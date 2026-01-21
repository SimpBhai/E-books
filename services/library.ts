import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
import { getApprovedOverride } from './cms';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';

export const getAvailableBooks = (): Book[] => {
  return BOOKS;
};

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  let staticChapters: Chapter[] = [];
  
  // Explicit mapping ensures build stability on Vercel
  switch (bookId) {
    case 'ashtadhyayi':
        staticChapters = ASHTADHYAYI_DATA;
        break;
    case 'yogasutra':
        staticChapters = YOGASUTRA_DATA;
        break;
    default:
        console.warn(`No static data found for book: ${bookId}`);
        staticChapters = [];
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