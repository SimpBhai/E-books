import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';
import { fuzzyMatch } from './searchUtils';

// --- DATA ACCESS LAYER ---

export const getAvailableBooks = (): Book[] => {
  return BOOKS;
};

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

/**
 * Validates the structural integrity of book data at runtime.
 * This prevents the UI from crashing if a developer introduces malformed JSON.
 */
const validateBookData = (chapters: any[]): Chapter[] => {
  if (!Array.isArray(chapters)) {
    console.error("Book data integrity failed: Root is not an array.");
    return [];
  }

  const validChapters: Chapter[] = [];

  for (const ch of chapters) {
    // Basic structural check
    if (!ch || typeof ch !== 'object' || !Array.isArray(ch.sections)) {
      console.warn(`Skipping malformed chapter: ${ch?.id || 'unknown'}`);
      continue;
    }

    // Deep copy to prevent mutation
    const safeChapter: Chapter = {
      id: Number(ch.id) || 0,
      title: String(ch.title || `Chapter ${ch.id}`),
      sections: []
    };

    for (const sec of ch.sections) {
      if (!sec || !Array.isArray(sec.verses)) continue;

      safeChapter.sections.push({
        id: Number(sec.id) || 0,
        chapterId: safeChapter.id,
        title: sec.title ? String(sec.title) : undefined,
        verses: sec.verses.filter((v: any) => v && v.id && v.sanskrit) // Strict filter for essential fields
      });
    }

    if (safeChapter.sections.length > 0) {
      validChapters.push(safeChapter);
    }
  }

  return validChapters;
};

export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  let rawData: Chapter[] = [];
  
  // Routing logic for static data files
  switch (bookId) {
    case 'ashtadhyayi':
        rawData = ASHTADHYAYI_DATA;
        break;
    case 'yogasutra':
        rawData = YOGASUTRA_DATA;
        break;
    default:
        console.warn(`Registry warning: No data mapped for book ID '${bookId}'`);
        return [];
  }

  return validateBookData(rawData);
};

export const getAllVerses = async (bookId: string): Promise<Verse[]> => {
  const chapters = await getBookContent(bookId);
  return chapters.flatMap(c => c.sections.flatMap(s => s.verses));
};

export const getVerseById = async (bookId: string, verseId: string): Promise<Verse | undefined> => {
  // Optimization: In a real app, this would use a hash map lookup.
  // For static text arrays < 10k items, flatMap + find is acceptable performance.
  const verses = await getAllVerses(bookId);
  return verses.find(v => v.id === verseId);
};

export const searchGlobal = async (query: string): Promise<{ book: Book, verse: Verse }[]> => {
  if (!query || query.length < 2) return [];
  
  const books = getAvailableBooks();
  const results: { book: Book, verse: Verse }[] = [];
  
  // Parallel execution for better performance on larger datasets
  await Promise.all(books.map(async (book) => {
    const verses = await getAllVerses(book.id);
    const matches = verses.filter(v => 
       fuzzyMatch(
         query, 
         v.id, 
         v.sanskrit, 
         v.transliteration, 
         // Safely access optional nested arrays
         ...(v.sutrarth?.map(s => s.text) || []), 
         ...(v.summary?.map(s => s.text) || [])
       )
    );
    matches.forEach(m => results.push({ book, verse: m }));
  }));
  
  // Sort results: shorter IDs (e.g. "1.1") usually imply higher relevance/precedence
  return results.sort((a, b) => a.verse.id.length - b.verse.id.length);
};
