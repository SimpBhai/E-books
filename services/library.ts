import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
import { getApprovedOverride } from './cms';

// Fallback static imports for environments where import.meta.glob is not supported
// This ensures the app doesn't crash if the build system differs.
import * as ashtadhyayiData from '../data/ashtadhyayi';
import * as yogasutraData from '../data/yogasutra';

export const getAvailableBooks = (): Book[] => {
  return BOOKS;
};

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

// Map for fallback manual loading
const STATIC_DATA_MAP: Record<string, any> = {
    'ashtadhyayi': ashtadhyayiData,
    'yogasutra': yogasutraData
};

export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  let staticChapters: Chapter[] = [];
  
  try {
    // 1. Try Vite's dynamic glob first (Best for code splitting)
    // We cast to any to avoid TS errors in environments checking for strict Vite types
    const globFn = (import.meta as any).glob;
    let loadedViaGlob = false;

    if (globFn) {
        try {
            const dataModules = globFn('../data/*.ts');
            const filePath = `../data/${bookId}.ts`;
            const loadModule = dataModules[filePath];

            if (loadModule) {
                const module: any = await loadModule();
                const dataExport = Object.values(module).find((exp) => Array.isArray(exp));
                if (dataExport) {
                    staticChapters = dataExport as Chapter[];
                    loadedViaGlob = true;
                }
            }
        } catch (err) {
            console.warn("Dynamic import failed, switching to fallback", err);
        }
    } 
    
    // 2. Fallback: If glob didn't work or file not found in glob (but might be in static map)
    if (!loadedViaGlob && STATIC_DATA_MAP[bookId]) {
        console.log("Using static fallback for", bookId);
        const module = STATIC_DATA_MAP[bookId];
        // Find the exported array in the module
        const dataExport = Object.values(module).find((exp) => Array.isArray(exp));
        if (dataExport) {
            staticChapters = dataExport as Chapter[];
        }
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