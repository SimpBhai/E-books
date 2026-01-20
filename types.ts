export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
}

export interface ContentText {
  id: string;
  language: string; // e.g., "English", "Hindi", "Sanskrit"
  author: string;   // e.g., "S.C. Vasu" (Translator/Author)
  text: string;
}

export interface Commentary {
  id: string;
  author: string;     // e.g., "Vyasa"
  language: string;   // e.g., "Sanskrit" (Original Language)
  text: string;       // Original Text
  translations?: ContentText[]; // Translations of this specific commentary
}

export interface Verse {
  id: string; // e.g., "1.1.1"
  chapter: number;
  pada?: number;
  number: number;
  sanskrit: string;
  transliteration: string;
  
  // Sutrarth / Literal Meaning
  sutrarth?: ContentText[];

  // Bhavarth / Simple Meaning / Summary
  summary?: ContentText[]; 
  
  // Bhasya / Detailed Commentary
  commentaries?: Commentary[]; 
}

export interface Chapter {
  id: number;
  title: string;
  sections: Section[];
}

export interface Section {
  id: number;
  chapterId: number;
  title?: string;
  verses: Verse[];
}

export interface Bookmark {
  bookId: string;
  verseId: string;
  timestamp: number;
}
