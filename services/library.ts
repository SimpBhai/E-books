import { Book, Chapter, Verse } from '../types';
import { BOOKS, UNIQUE_BOOKS } from '../data/metadata';
import { ASHTADHYAYI_DATA } from '../data/ashtadhyayi';
import { YOGASUTRA_DATA } from '../data/yogasutra';
import { fuzzyMatch } from './searchUtils';

function getLocalChaptersForBook(bookId: string): Chapter[] {
  switch (bookId) {
    case 'ashtadhyayi':
      return ASHTADHYAYI_DATA;
    case 'yogasutra':
      return YOGASUTRA_DATA;
    default:
      return [];
  }
}

function getLocalVersesForBook(bookId: string): Verse[] {
  const chapters = getLocalChaptersForBook(bookId);
  return chapters.flatMap(c => (c.sections || []).flatMap(s => s.verses || []));
}

export const getAvailableBooks = async (): Promise<Book[]> => {
  try {
    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Failed to fetch books from API');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    return UNIQUE_BOOKS;
  } catch (error) {
    console.warn('API fetch failed, using local books data:', error);
    return UNIQUE_BOOKS;
  }
};

export const getBookMetadata = async (bookId: string): Promise<Book | undefined> => {
  try {
    const res = await fetch(`/api/books/${encodeURIComponent(bookId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch (error) {
    console.warn(`API fetch for book ${bookId} failed, using local metadata:`, error);
  }
  return BOOKS.find(b => b.id === bookId);
};

export const getBookContent = async (bookId: string): Promise<Chapter[]> => {
  try {
    const res = await fetch(`/api/books/${encodeURIComponent(bookId)}/chapters`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (error) {
    console.warn(`API fetch content for ${bookId} failed, using local chapter data:`, error);
  }
  return getLocalChaptersForBook(bookId);
};

export const getBookStructure = async (bookId: string) => {
  const content = await getBookContent(bookId);
  return content.map(ch => ({
    id: ch.id,
    title: ch.title,
    sections: (ch.sections || []).map(s => ({
      id: s.id,
      title: s.title,
      verses: (s.verses || []).map(v => ({ id: v.id, sanskrit: v.sanskrit, number: v.number }))
    }))
  }));
};

export const getAllVerses = async (bookId: string): Promise<Verse[]> => {
  try {
    const res = await fetch(`/api/books/${encodeURIComponent(bookId)}/verses`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (error) {
    console.warn(`API fetch verses for ${bookId} failed, using local verse data:`, error);
  }
  return getLocalVersesForBook(bookId);
};

export const getVerseById = async (bookId: string, verseId: string): Promise<Verse | undefined> => {
  try {
    const res = await fetch(`/api/books/${encodeURIComponent(bookId)}/verses/${encodeURIComponent(verseId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch (error) {
    console.warn(`API fetch verse ${verseId} in ${bookId} failed, using local data:`, error);
  }
  const verses = getLocalVersesForBook(bookId);
  return verses.find(v => v.id === verseId);
};

export const searchGlobal = async (query: string): Promise<{ book: Book, verse: Verse }[]> => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (error) {
    console.warn('Search API failed, performing local search:', error);
  }

  const results: { book: Book, verse: Verse }[] = [];
  for (const book of BOOKS) {
    const verses = getLocalVersesForBook(book.id);
    const matches = verses.filter(v => 
      fuzzyMatch(
        query,
        v.id,
        v.sanskrit,
        v.transliteration,
        ...(v.sutrarth?.map(s => s.text) || []),
        ...(v.summary?.map(s => s.text) || [])
      )
    );
    matches.forEach(v => results.push({ book, verse: v }));
  }
  return results;
};

