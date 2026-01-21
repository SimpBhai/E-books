import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
import { getApprovedOverride } from './cms';

// Metadata is small, so we keep it synchronous
export const getAvailableBooks = (): Book[] => {
  return BOOKS;
};

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

// Content is heavy, so we load it asynchronously (Lazy Loading)
export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  let staticChapters: Chapter[] = [];
  
  try {
    switch (bookId) {
      case 'ashtadhyayi': 
        const m1 = await import('../data/ashtadhyayi');
        staticChapters = m1.ASHTADHYAYI_DATA; 
        break;
      case 'yogasutra': 
        const m2 = await import('../data/yogasutra');
        staticChapters = m2.YOGASUTRA_DATA; 
        break;
      // As you add 1000 books, you can either add cases here 
      // OR fetch JSON from a server/CDN to avoid modifying code.
      default: 
        console.warn(`Book data for ${bookId} not found locally.`);
        staticChapters = [];
    }
  } catch (e) {
    console.error(`Failed to load book ${bookId}`, e);
    return [];
  }

  // Deep clone to avoid mutating static data in memory
  const chapters = JSON.parse(JSON.stringify(staticChapters));

  // Merge CMS overrides
  chapters.forEach((chapter: Chapter) => {
    chapter.sections.forEach((section) => {
      section.verses = section.verses.map((verse: Verse) => {
        const override = getApprovedOverride(bookId, verse.id);
        return override || verse;
      });
    });
  });

  return chapters;
};

export const getAllVerses = async (bookId: string): Promise<Verse[]> => {
  const chapters = await getBookContent(bookId);
  return chapters.flatMap(c => c.sections.flatMap(s => s.verses));
};

export const getVerseById = async (bookId: string, verseId: string): Promise<Verse | undefined> => {
  // Check override first (fast, synchronous check in localstorage)
  const override = getApprovedOverride(bookId, verseId);
  if (override) return override;

  // Fallback to static (slow, async fetch)
  const verses = await getAllVerses(bookId);
  return verses.find(v => v.id === verseId);
};
