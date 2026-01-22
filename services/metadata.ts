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
    id: 'yogasutra',
    title: 'Yoga Sutras',
    author: 'Patanjali',
    category: 'Philosophy',
    description: 'The seminal text on the theory and practice of Yoga, organized into four chapters (padas).',
    structure: {
      level1: 'Pada',
      level2: 'Section',
      hasSections: false
    }
  }
];