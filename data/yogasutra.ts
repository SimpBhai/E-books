import { Chapter } from '../types';

export const YOGASUTRA_DATA: Chapter[] = [
  {
    id: 1,
    title: "Samadhi Pada",
    sections: [
      {
        id: 1,
        chapterId: 1,
        title: "Section 1",
        verses: [
          {
            id: "1.1",
            chapter: 1,
            number: 1,
            sanskrit: "अथ योगानुशासनम्",
            transliteration: "atha yogānuśāsanam",
            sutrarth: [
              {
                id: "st1",
                language: "English",
                author: "Literal",
                text: "Atha (Now) Yoga (Yoga) Anushasanam (Instruction/Exposition)."
              },
              {
                id: "st2",
                language: "Hindi",
                author: "Literal",
                text: "अथ (अब) योग (योग का) अनुशासनम् (उपदेश आरम्भ होता है)।"
              }
            ],
            summary: [
              {
                id: "s1",
                language: "English",
                author: "Author",
                text: "Now, the exposition of Yoga."
              },
              {
                id: "s2",
                language: "Hindi",
                author: "Author",
                text: "अब योग का उपदेश आरम्भ होता है।"
              }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Vyasa Bhashya",
                text: "अथेत्ययमधिकारार्थः। योगानुशासनं शास्त्रमधिकृतं वेदितव्यम्। योगः समाधिः। स च सार्वभौमश्चित्तस्य धर्मः।",
                translations: [
                  {
                     id: "ct1",
                     language: "English",
                     author: "Rama Prasada",
                     text: "The word 'atha' is used in the sense of commencement. The science of Yoga-instruction is to be understood as the subject matter derived. Yoga is Samadhi."
                  },
                  {
                     id: "ct2",
                     language: "Hindi",
                     author: "Vimla Karnataka",
                     text: "'अथ' यह शब्द अधिकार (आरम्भ) अर्थ में है। 'योगानुशासन' यह शास्त्र अधिकृत है, ऐसा जानना चाहिए। योग समाधि है।"
                  }
                ]
              },
              {
                id: "c2",
                language: "Sanskrit",
                author: "Bhoja Vritti",
                text: "अथेत्ययमधिकारार्थः। योगानुशासनं शास्त्रमधिकृतं वेदितव्यम्। योगशब्देन समाधिरभिधीयते।",
                translations: [
                   {
                     id: "bt1",
                     language: "English",
                     author: "Rajendralala Mitra",
                     text: "The word 'atha' implies a beginning. It is to be understood that the institute of Yoga is here begun."
                   }
                ]
              }
            ]
          },
          {
            id: "1.2",
            chapter: 1,
            number: 2,
            sanskrit: "योगश्चित्तवृत्तिनिरोधः",
            transliteration: "yogaścittavṛttinirodhaḥ",
            sutrarth: [
               {
                 id: "st1",
                 language: "English",
                 author: "Literal",
                 text: "Yoga (Yoga is) Chitta (Mind-stuff) Vritti (Modifications) Nirodhah (Restraint)."
               }
            ],
            summary: [
               {
                id: "s1",
                language: "English",
                author: "Author",
                text: "Yoga is restraining the mind-stuff (Chitta) from taking various forms (Vrittis)."
               },
               {
                id: "s2",
                language: "Hindi",
                author: "Author",
                text: "चित्त की वृत्तियों का निरोध ही योग है।"
               }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Vyasa Bhashya",
                text: "सर्वशब्दाग्रहणात्संप्रज्ञातोऽपि योग इत्याख्यायते। चित्तं हि प्रख्याप्रवृत्तिस्थितिशीलत्वात्त्रिगुणम्।",
                translations: [
                  {
                    id: "ct1",
                    language: "English",
                    author: "Hariharananda Aranya",
                    text: "Since the word 'all' is not used (before modifications), Samprajnata Yoga is also called Yoga. The mind being constituted of the three Gunas has the nature of illumination, activity and inertia."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
