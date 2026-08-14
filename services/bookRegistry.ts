import { Chapter, Verse } from '../types';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';

type BookAdapter = { chapters: Chapter[]; normalize?: (input: unknown) => Chapter[] };

// Each book gets its own adapter. Add GitHub JSON/TS parsing here without forcing
// Sanskrit editions into one universal source schema.
export const BOOK_ADAPTERS: Record<string, BookAdapter> = {
  ashtadhyayi: { chapters: ASHTADHYAYI_DATA },
  yogasutra: { chapters: YOGASUTRA_DATA },
  manusmriti: { chapters: [] },
  'bhagavad-gita': { chapters: [] },
};

export function getChaptersForBook(bookId: string): Chapter[] {
  const adapter = BOOK_ADAPTERS[bookId];
  return adapter?.normalize ? adapter.normalize(adapter.chapters) : adapter?.chapters ?? [];
}

export function getVersesForBook(bookId: string): Verse[] {
  return getChaptersForBook(bookId).flatMap((chapter) =>
    (chapter.sections ?? []).flatMap((section) => section.verses ?? []),
  );
}
