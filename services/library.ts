import { Book, Chapter, Verse } from '../types';
import { BOOKS } from '../data/metadata';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';

// In a real application, these imports could be dynamic import() calls
// to lazy load the heavy content only when the book is selected.

export const getAvailableBooks = (): Book[] => {
  return BOOKS;
};

export const getBookMetadata = (bookId: string): Book | undefined => {
  return BOOKS.find(b => b.id === bookId);
};

export const getBookContent = (bookId: string): Chapter[] => {
  switch (bookId) {
    case 'ashtadhyayi': return ASHTADHYAYI_DATA;
    case 'yogasutra': return YOGASUTRA_DATA;
    default: return [];
  }
};

export const getAllVerses = (bookId: string): Verse[] => {
  const chapters = getBookContent(bookId);
  return chapters.flatMap(c => c.sections.flatMap(s => s.verses));
};

export const getVerseById = (bookId: string, verseId: string): Verse | undefined => {
  const verses = getAllVerses(bookId);
  return verses.find(v => v.id === verseId);
};
