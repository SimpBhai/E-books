import { Book, Chapter, Verse, Section } from '../types';
import { BOOKS } from '../data/metadata';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';
import { fuzzyMatch } from './searchUtils';

// --- Registry Map ---
const DATA_REGISTRY: Record<string, unknown> = {
  'ashtadhyayi': ASHTADHYAYI_DATA,
  'yogasutra': YOGASUTRA_DATA,
};

// --- Data Access Layer ---

export const getAvailableBooks = (): Book[] => BOOKS;

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

/**
 * Type Guard to ensure an object is a Verse
 */
function isVerse(data: unknown): data is Verse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'sanskrit' in data
  );
}

/**
 * Validates the structural integrity of book data at runtime.
 * Ensures the app doesn't crash if a JSON file has a typo.
 */
const validateBookData = (data: unknown): Chapter[] => {
  if (!Array.isArray(data)) {
    console.error("[Data Integrity] Root content is not an array.");
    return [];
  }

  // We map and filter simultaneously to discard malformed entries
  const cleanChapters: Chapter[] = [];

  for (const ch of data) {
    if (!ch || typeof ch !== 'object') continue;

    // Default values for missing optional fields
    const chapterId = 'id' in ch ? Number(ch.id) : 0;
    const chapterTitle = 'title' in ch ? String(ch.title) : `Chapter ${chapterId}`;
    
    // Validate Sections
    const rawSections = 'sections' in ch && Array.isArray(ch.sections) ? ch.sections : [];
    const cleanSections: Section[] = [];

    for (const sec of rawSections) {
      if (!sec || typeof sec !== 'object') continue;

      const rawVerses = 'verses' in sec && Array.isArray(sec.verses) ? sec.verses : [];
      // Filter out invalid verses immediately
      const validVerses = rawVerses.filter(isVerse);

      if (validVerses.length > 0) {
        cleanSections.push({
          id: Number(sec.id) || 0,
          chapterId: chapterId,
          title: sec.title ? String(sec.title) : undefined,
          verses: validVerses
        });
      }
    }

    // Only include chapters that actually contain content
    if (cleanSections.length > 0) {
      cleanChapters.push({
        id: chapterId,
        title: chapterTitle,
        sections: cleanSections
      });
    }
  }

  return cleanChapters;
};

export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  const rawData = DATA_REGISTRY[bookId];
  
  if (!rawData) {
    console.warn(`[Registry] No data found for book ID: ${bookId}`);
    return [];
  }

  return validateBookData(rawData);
};

export const getAllVerses = async (bookId: string): Promise<Verse[]> => {
  const chapters = await getBookContent(bookId);
  return chapters.flatMap(c => c.sections.flatMap(s => s.verses));
};

export const getVerseById = async (bookId: string, verseId: string): Promise<Verse | undefined> => {
  // Optimization: In a real app, we might want an index map. 
  // For static local data, iterating is fast enough (< 10ms for 4000 sutras).
  const verses = await getAllVerses(bookId);
  return verses.find(v => v.id === verseId);
};

export const searchGlobal = async (query: string): Promise<{ book: Book, verse: Verse }[]> => {
  if (!query || query.trim().length < 2) return [];
  
  const books = getAvailableBooks();
  const results: { book: Book, verse: Verse }[] = [];
  
  // Parallel search across books
  await Promise.all(books.map(async (book) => {
    const verses = await getAllVerses(book.id);
    
    // We filter verses based on the fuzzyMatch utility
    const matches = verses.filter(v => 
       fuzzyMatch(
         query, 
         v.id, 
         v.sanskrit, 
         v.transliteration, 
         // Search inside meanings and summaries too
         ...(v.sutrarth?.map(s => s.text) || []), 
         ...(v.summary?.map(s => s.text) || [])
       )
    );

    matches.forEach(m => results.push({ book, verse: m }));
  }));
  
  // Relevance sorting: Shorter ID usually means exact match (e.g. "1.1.1" vs "1.1.10")
  return results.sort((a, b) => {
    const lenDiff = a.verse.id.length - b.verse.id.length;
    if (lenDiff !== 0) return lenDiff;
    return a.verse.id.localeCompare(b.verse.id);
  });
};
