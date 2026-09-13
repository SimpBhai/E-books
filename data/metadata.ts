import { Book } from '../types';

export const BOOKS: Book[] = [
  {
    id: 'ashtadhyayi',
    title: 'Ashtadhyayi',
    author: 'Panini',
    category: 'Grammar',
    description: 'The foundational text of Sanskrit grammar, consisting of 3,959 sutras in 8 chapters.',
    structure: {
      level1: 'Chapter',
      level2: 'Pada',
      hasSections: true
    }
  },
  {
    id: 'yogasutra', title: 'Yoga Darshan (Yoga Sutras)', author: 'Patanjali', category: 'Philosophy',
    description: 'The seminal text on the theory and practice of Yoga, organized into four padas.',
    structure: { level1: 'Pada', level2: 'Section', hasSections: false }
  },
  {
    id: 'manusmriti', title: 'Manusmriti', author: 'Manu', category: 'Dharmaśāstra',
    description: 'Ganganatha Jha’s Internet Archive edition with Medhātithi commentary, imported in source-verified chapter and verse chunks.',
    structure: { level1: 'Adhyaya', level2: 'Verse', hasSections: false }
  },
  {
    id: 'bhagavad-gita', title: 'Bhagavad Gita', author: 'Vyasa', category: 'Philosophy',
    description: 'A GitHub-versioned edition of the Bhagavad Gita with chapter-specific verse and translation fields.',
    structure: { level1: 'Adhyaya', level2: 'Verse', hasSections: false }
  }
];

// Stable IDs prevent repeated entries across epustakalaya/epustakam views.
export const UNIQUE_BOOKS: Book[] = [...new Map(BOOKS.map(book => [book.id, book])).values()];
