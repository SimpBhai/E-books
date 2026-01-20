import { Chapter } from '../types';

export const ASHTADHYAYI_DATA: Chapter[] = [
  {
    id: 1,
    title: "Chapter 1: Terms & Rules",
    sections: [
      {
        id: 1,
        chapterId: 1,
        title: "Pada 1",
        verses: [
          {
            id: "1.1.1",
            chapter: 1,
            pada: 1,
            number: 1,
            sanskrit: "वृद्धिरादैच्",
            transliteration: "vṛddhirādaic",
            summary: [
              {
                id: "s1",
                language: "English",
                author: "S.C. Vasu",
                text: "The term vṛddhi denotes ā, ai, and au."
              },
              {
                id: "s2",
                language: "Hindi",
                author: "Shri Narayana",
                text: "आ, ऐ और औ इन तीन वर्णों की 'वृद्धि' संज्ञा होती है।"
              }
            ],
            commentaries: [
              {
                id: "c1",
                language: "English",
                author: "Kashika",
                text: "This is the first sutra of the Ashtadhyayi. It defines the term 'Vriddhi' used throughout the grammar. The letters ā, ai, and au are called Vṛddhi. The word 'Vriddhi' is placed first for auspiciousness (Mangala).",
                translations: []
              },
              {
                id: "c2",
                language: "Sanskrit",
                author: "Mahabhasya",
                text: "कुतोऽयं वृद्धिशब्दः प्रयुक्तः? माङ्गलिका आचार्याः स्म।",
                translations: [
                   {
                     id: "mt1",
                     language: "English",
                     author: "Joshi",
                     text: "Why is the word Vriddhi used? The teachers desire auspiciousness."
                   }
                ]
              }
            ]
          },
          {
            id: "1.1.2",
            chapter: 1,
            pada: 1,
            number: 2,
            sanskrit: "अदेङ्गुणः",
            transliteration: "adeṅguṇaḥ",
            summary: [
              {
                id: "s1",
                language: "English",
                author: "S.C. Vasu",
                text: "The term guṇa denotes a, e, and o."
              },
              {
                 id: "s2",
                 language: "Hindi",
                 author: "Shri Narayana",
                 text: "ह्रस्व अ, ए और ओ इन तीन वर्णों की 'गुण' संज्ञा होती है।"
              }
            ],
            commentaries: [
              {
                id: "c1",
                language: "English",
                author: "Kashika",
                text: "The short 'a' and the letters 'e' and 'o' (eng) are called Guna.",
                translations: []
              }
            ]
          }
        ]
      },
      { id: 2, chapterId: 1, title: "Pada 2", verses: [] }
    ]
  },
  {
    id: 2,
    title: "Chapter 2: Compounds",
    sections: [{ id: 1, chapterId: 2, title: "Pada 1", verses: [] }]
  }
];
