import { Chapter } from '../types';
import { PADA_1_VERSES } from './yogasutra/pada1';
import { PADA_2_VERSES } from './yogasutra/pada2';
import { PADA_3_VERSES } from './yogasutra/pada3';
import { PADA_4_VERSES } from './yogasutra/pada4';

export const YOGASUTRA_DATA: Chapter[] = [
  {
    id: 1,
    title: "Samadhi Pada (समाधिपादः - Concentration)",
    sections: [
      {
        id: 1,
        chapterId: 1,
        title: "Samadhi Pada (51 Sutras)",
        verses: PADA_1_VERSES
      }
    ]
  },
  {
    id: 2,
    title: "Sadhana Pada (साधनपादः - Practice)",
    sections: [
      {
        id: 2,
        chapterId: 2,
        title: "Sadhana Pada (55 Sutras)",
        verses: PADA_2_VERSES
      }
    ]
  },
  {
    id: 3,
    title: "Vibhuti Pada (विभूतिपादः - Accomplishments)",
    sections: [
      {
        id: 3,
        chapterId: 3,
        title: "Vibhuti Pada (56 Sutras)",
        verses: PADA_3_VERSES
      }
    ]
  },
  {
    id: 4,
    title: "Kaivalya Pada (कैवल्यपादः - Liberation)",
    sections: [
      {
        id: 4,
        chapterId: 4,
        title: "Kaivalya Pada (34 Sutras)",
        verses: PADA_4_VERSES
      }
    ]
  }
];
