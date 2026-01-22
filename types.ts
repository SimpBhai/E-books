export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  structure: {
    level1: string; // Label for Chapter level (e.g. "Chapter", "Adhyaya")
    level2: string; // Label for Section level (e.g. "Section", "Pada")
    hasSections: boolean; // Whether the UI should show the section selector
  };
}

export interface ContentText {
  id: string;
  language: string; // e.g., "English", "Hindi", "Sanskrit"
  author: string;   // e.g., "S.C. Vasu"
  text: string;
}

export interface Commentary {
  id: string;
  author: string;     // e.g., "Kashika"
  language: string;   // e.g., "Sanskrit"
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
  
  // Optional flag for UI
  isVerified?: boolean;
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
  note?: string;
}