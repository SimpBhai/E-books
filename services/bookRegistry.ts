import { Chapter, Verse } from '../types';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';
import { MANUSMRITI_DATA } from '../data/manusmriti';

export type BookSchemaDefinition = {
  id: string;
  label: string;
  description: string;
  supports: string[];
};

export const BOOK_SCHEMAS: Record<string, BookSchemaDefinition> = {
  sutra: { id: 'sutra', label: 'Sūtra', description: 'Numbered aphorisms with Sanskrit, transliteration, meanings, and commentaries.', supports: ['sanskrit', 'transliteration', 'sutrarth', 'summary', 'commentaries'] },
  smriti: { id: 'smriti', label: 'Smṛti', description: 'Adhyāya and verse texts with translations and multiple bhāṣya layers.', supports: ['sanskrit', 'transliteration', 'translation', 'commentaries', 'sourcePage'] },
  purana: { id: 'purana', label: 'Purāṇa', description: 'Book, skandha, adhyāya, verse, translation, and multiple commentary layers.', supports: ['sanskrit', 'transliteration', 'translation', 'commentaries', 'sourcePage'] },
  itihasa: { id: 'itihasa', label: 'Itihāsa', description: 'Kāṇḍa/parva and adhyāya-aware narrative text.', supports: ['sanskrit', 'transliteration', 'translation', 'commentaries'] },
  custom: { id: 'custom', label: 'Custom', description: 'A book-specific adapter defined by its own JSON schema.', supports: ['custom'] },
};

type BookAdapter = { schema: string; chapters: Chapter[]; normalize?: (input: unknown) => Chapter[] };

// Each book gets its own adapter. Add GitHub JSON/TS parsing here without forcing
// Sanskrit editions into one universal source schema.
export const BOOK_ADAPTERS: Record<string, BookAdapter> = {
  ashtadhyayi: { schema: 'sutra', chapters: ASHTADHYAYI_DATA },
  yogasutra: { schema: 'sutra', chapters: YOGASUTRA_DATA },
  manusmriti: { schema: 'smriti', chapters: MANUSMRITI_DATA },
  'bhagavad-gita': { schema: 'itihasa', chapters: [] },
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
