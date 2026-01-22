import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
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

  // Deep clone to ensure immutability
  return JSON.parse(JSON.stringify(staticChapters));
};

export const getBookStructure = async (bookId: string) => {
    const content = await getBookContent(bookId);
    return content.map(ch => ({
        id: ch.id,
        title: ch.title,
        sections: ch.sections.map(s => ({
            id: s.id,
            title: s.title,
            verses: s.verses.map(v => ({ id: v.id, sanskrit: v.sanskrit, number: v.number }))
        }))
    }));
};

export const getAllVerses = async (bookId: string): Promise<Verse[]> => {
  const chapters = await getBookContent(bookId);
  return chapters.flatMap(c => c.sections.flatMap(s => s.verses));
};

export const getVerseById = async (bookId: string, verseId: string): Promise<Verse | undefined> => {
  const verses = await getAllVerses(bookId);
  return verses.find(v => v.id === verseId);
};