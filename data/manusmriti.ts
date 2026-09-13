import { Chapter, Commentary, ContentText, Verse } from '../types';

export interface ManusmritiSourceRecord {
  id: string;
  adhyaya: number;
  verse: number;
  sanskrit: string;
  transliteration?: string;
  translation: ContentText;
  medhatithi: Commentary;
  sourcePage?: string;
  isVerified: boolean;
}

export const MANUSMRITI_SOURCE = {
  edition: 'Ganganatha Jha, Manusmriti with the Bhashya of Medhatithi',
  publisher: 'University of Calcutta',
  year: 1920,
  source: 'Internet Archive scan; exact volume identifier must be recorded per imported chunk',
  license: 'Verify public-domain status for the selected scan before distribution',
} as const;

export function normalizeManusmriti(records: ManusmritiSourceRecord[]): Chapter[] {
  const chapters = new Map<number, Chapter>();
  const seen = new Set<string>();

  for (const record of records) {
    if (!record.id || seen.has(record.id)) continue;
    seen.add(record.id);
    const chapter = chapters.get(record.adhyaya) ?? {
      id: record.adhyaya,
      title: `Adhyāya ${record.adhyaya}`,
      sections: [{ id: record.adhyaya, chapterId: record.adhyaya, title: 'Verses', verses: [] }],
    };
    const verse: Verse = {
      id: record.id,
      chapter: record.adhyaya,
      number: record.verse,
      sanskrit: record.sanskrit,
      transliteration: record.transliteration ?? '',
      summary: [record.translation],
      commentaries: [record.medhatithi],
      isVerified: record.isVerified,
    };
    chapter.sections[0].verses.push(verse);
    chapters.set(record.adhyaya, chapter);
  }

  return [...chapters.values()].sort((a, b) => a.id - b.id);
}

// Content is intentionally empty until the exact Internet Archive scan/volume is selected
// and imported with its page-level provenance. This prevents fabricated or mixed OCR data.
export const MANUSMRITI_DATA: Chapter[] = normalizeManusmriti([]);
