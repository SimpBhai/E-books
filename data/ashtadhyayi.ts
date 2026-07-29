import { Chapter } from '../types';

export const ASHTADHYAYI_DATA: Chapter[] = [
  {
    id: 1,
    title: "Adhyaya 1: Technical Terms & Interpretation Rules (संज्ञा एवं परिभाषा)",
    sections: [
      {
        id: 1,
        chapterId: 1,
        title: "Pada 1 (प्रथमः पादः)",
        verses: [
          {
            id: "1.1.1",
            chapter: 1,
            pada: 1,
            number: 1,
            sanskrit: "वृद्धिरादैच्",
            transliteration: "vṛddhirādaic",
            padachheda: "वृद्धिः (१.१) आदैच् (१.१)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "The vowels 'ā', 'ai', and 'au' are designated by the technical term 'vṛddhi'." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "आत् (आ) और ऐच् (ऐ, औ) वर्णों की 'वृद्धि' संज्ञा होती है।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Panini Grammar", text: "Defines the grammatical technical term 'Vriddhi'." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "आदैच् च वृद्धिसंज्ञः स्यात्। वृद्धिः अष्टाध्याय्याः प्रथमं सूत्रम्। मङ्गलार्थं वृद्धिशब्दस्य पूर्वं प्रयोगः कृतः।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "The letters 'ā', 'ai', and 'au' receive the designation Vriddhi. This is the opening sutra of Ashtadhyayi." },
                  { id: "kt2", language: "Hindi", author: "Jayashankar Tripathi", text: "आत् (दीर्घ आ) तथा ऐच् (ऐ, औ) की वृद्धि संज्ञा होती है।" }
                ]
              },
              {
                id: "c2",
                language: "Sanskrit",
                author: "Mahabhashya (महाभाष्यम् - पतञ्जलिः)",
                text: "कुतोऽयं वृद्धिशब्दः प्रयुक्तः? माङ्गलिका आचार्याः महतः शास्त्रौघस्य मङ्गलार्थं वृद्धिशब्दं पूर्वं प्रयुञ्जते।",
                translations: [
                  { id: "mt1", language: "English", author: "S.D. Joshi", text: "Why is Vriddhi used first? Teachers use Vriddhi in the beginning for auspicious completion." }
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
            padachheda: "अत् (१.१) एङ् (१.१) गुणः (१.१)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "Short 'a' and the vowels 'e' and 'o' are designated by the term 'guna'." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "ह्रस्व अत् (अ) और एङ् (ए, ओ) की 'गुण' संज्ञा होती है।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Panini Grammar", text: "Defines the term 'Guna'." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "अच्च एङ् च गुणसंज्ञो भवति। अत् इति तपकरणम् मकारोच्चारणार्थम्।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "Short 'a' and vowels 'e' and 'o' are called Guna." }
                ]
              }
            ]
          },
          {
            id: "1.1.3",
            chapter: 1,
            pada: 1,
            number: 3,
            sanskrit: "इको गुणवृद्धि",
            transliteration: "iko guṇavṛddhī",
            padachheda: "इकः (६.१) गुण-वृद्धी (१.२)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "Where 'guna' or 'vriddhi' are prescribed without naming the vowel, they substitute vowels of the 'ik' group (i, u, ṛ, ḷ)." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "गुण और वृद्धि के विधान में जहाँ स्थान निर्दिष्ट न हो, वहाँ 'इक्' वर्णों के स्थान पर आदेश होता है।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Panini Grammar", text: "Paribhasha sutra defining substitution target for Guna and Vriddhi." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "इक् इति षष्ठ्यन्तं पदम्। गुणवृद्धिशब्दाभ्यां यत्र गुणवृद्धी विधीयेते तत्र इकः स्थाने वेदितव्ये।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "Whenever Guna or Vriddhi are ordered by these technical terms, they replace a vowel of the Ik pratyahara (i, u, ṛ, ḷ)." },
                  { id: "kt2", language: "Hindi", author: "Jayashankar Tripathi", text: "जहाँ गुण और वृद्धि का निर्देश बिना स्थान विशेष के किया जाए, वहाँ वे 'इक्' प्रत्याहार के वर्णों के स्थान पर ही प्रवृत्त होते हैं।" }
                ]
              },
              {
                id: "c2",
                language: "Sanskrit",
                author: "Mahabhashya (महाभाष्यम् - पतञ्जलिः)",
                text: "किमर्थमिदमुच्यते? अनियमनिवृत्त्यर्थम्। गुणवृद्धिविधाने अनिर्धारितनियमप्राप्तौ इक एवेति नियम्यते।",
                translations: [
                  { id: "mt1", language: "English", author: "S.D. Joshi", text: "This Paribhasha is stated to restrict arbitrary substitution, ensuring only Ik vowels receive Guna and Vriddhi." }
                ]
              }
            ]
          },
          {
            id: "1.1.9",
            chapter: 1,
            pada: 1,
            number: 9,
            sanskrit: "तुल्यास्यप्रयत्नं सवर्णम्",
            transliteration: "tulyāsyaprayatnaṁ savarṇam",
            padachheda: "तुल्य-आस्य-प्रयत्नम् (१.१) सवर्णम् (१.१)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "Letters having the same place of articulation (Aasya) and internal effort (Abhyantara Prayatna) are called homogeneous (Savarna)." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "जिन वर्णों का उच्चारण-स्थान और आभ्यन्तर प्रयत्न समान हो, वे आपस में 'सवर्ण' कहलाते हैं।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Panini Grammar", text: "Defines Savarna (homogeneity) of speech sounds." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "आस्ये भवो देशः आस्यम्। तालुवादि उच्चारणस्थानम्, आभ्यन्तरः प्रयत्नश्च ययोस्तुल्यो तौ मिथः सवर्णसंज्ञौ भवतः।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "Aasya refers to places of articulation like palate, teeth, lips. When both place of articulation and internal effort match, two sounds are Savarna (homogeneous)." },
                  { id: "kt2", language: "Hindi", author: "Jayashankar Tripathi", text: "कण्ठ, तालु आदि स्थान और आभ्यन्तर प्रयत्न जिन वर्णों के समान हों, वे आपस में सवर्ण कहलाते हैं।" }
                ]
              }
            ]
          },
          {
            id: "1.1.11",
            chapter: 1,
            pada: 1,
            number: 11,
            sanskrit: "ईदूदेद्द्विवचनं प्रगृह्यम्",
            transliteration: "īdūdeddvivacanaṁ pragṛhyam",
            padachheda: "ईत्-ऊत्-एत् (१.१) द्विवचनम् (१.१) प्रगृह्यम् (१.१)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "Dual forms ending in long 'ī', 'ū', or 'e' are called Pragrihya." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "दीर्घ ई, ऊ और ए के अन्त वाले द्विवचन पदों की 'प्रगृह्य' संज्ञा होती है।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Panini Grammar", text: "Defines Pragrihya designations preventing euphonic Sandhi." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "ईदन्तं ऊदन्तं एदन्तं च यद् द्विवचनं तत् प्रगृह्यसंज्ञं भवति। यथा हरि एतौ, विष्णू इमौ, गङ्गे अमू।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "Dual forms ending in long ī, ū, or e get Pragrihya status, preventing sandhi changes as in 'Hari etau'." }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Adhyaya 8: Phonological & Sandhi Rules (पाद एवं सन्धि प्रकरणम्)",
    sections: [
      {
        id: 4,
        chapterId: 8,
        title: "Pada 4 (चतुर्थः पादः)",
        verses: [
          {
            id: "8.4.68",
            chapter: 8,
            pada: 4,
            number: 68,
            sanskrit: "अ अ",
            transliteration: "a a",
            padachheda: "अ (६.१) अ (१.१)",
            sutrarth: [
              { id: "st1", language: "English", author: "S.C. Vasu", text: "The short vowel 'a' which was treated as open (Vivrita) for the operations of grammar is restored to its actual closed state (Samvrita)." },
              { id: "st2", language: "Hindi", author: "Shri Narayana Dash", text: "व्याकरण प्रक्रिया में विवृत माना गया ह्रस्व 'अ' अब संवृत रूप में पुनस्थापित किया जाता है।" }
            ],
            summary: [
              { id: "s1", language: "English", author: "Closing Sutra", text: "The final concluding sutra of Panini's Ashtadhyayi." }
            ],
            commentaries: [
              {
                id: "c1",
                language: "Sanskrit",
                author: "Kashika Vritti (काशिकावृत्तिः)",
                text: "विवृतम् अनूद्य संवृतोऽनेन विधीयते। अष्टाध्याय्याः सम्पूर्णताम् एतेन सूत्रेण गच्छति।",
                translations: [
                  { id: "kt1", language: "English", author: "J.S. Joshi", text: "Having treated short 'a' as open throughout the Ashtadhyayi for rule application, it is now declared closed." }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
