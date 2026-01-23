# SutraLibrary Developer Documentation

## Overview
SutraLibrary is a static, client-side React application designed to render structured hierarchical texts (Sutras, Slokas, Poetry). It allows for deep linking, fuzzy searching, and multi-language commentary display.

This document outlines the procedure for extending the library with new volumes.

---

## 1. Data Architecture

The application uses a strict TypeScript schema defined in `types.ts`. Understanding these interfaces is crucial before adding data.

### Core Interfaces

1.  **Book**: Metadata container.
    *   `structure`: Defines UI labels (e.g., "Chapter", "Adhyaya") and hierarchy depth (`hasSections`).
2.  **Chapter**: Top-level division.
3.  **Section**: Sub-division (optional in UI, mandatory in data structure).
4.  **Verse**: The atomic unit of content.

### Verse Schema Breakdown

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | **Unique** identifier (e.g., "1.2.3"). Used for routing and deep links. |
| `sanskrit` | `string` | The source text in Devanagari. |
| `transliteration` | `string` | IAST or Romanized transliteration. |
| `sutrarth` | `ContentText[]` | Literal word-for-word meaning. |
| `summary` | `ContentText[]` | The "Bhavarth" or gist/translation. |
| `commentaries` | `Commentary[]` | Detailed "Bhasya" or scholarly analysis. |

---

## 2. Adding a New Book

### Step 1: Create the Data File
Create a new file in `data/<book_id>.ts` (e.g., `data/manusmriti.ts`).
We recommend using TypeScript to enforce schema validation during development.

```typescript
import { Chapter } from '../types';

export const MANUSMRITI_DATA: Chapter[] = [
  {
    id: 1,
    title: "Chapter 1",
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
            sanskrit: "आसीदिदं तमोभूतमप्रज्ञातमलक्षणम् ।",
            transliteration: "āsīdidaṃ tamobhūtamaprajñātamalakṣaṇam |",
            summary: [
               { id: "en", language: "English", author: "G. Buhler", text: "This (universe) existed in the shape of Darkness..." }
            ]
          }
        ]
      }
    ]
  }
];
```

### Step 2: Register Metadata
Open `data/metadata.ts`. Add a new `Book` object to the `BOOKS` array.

```typescript
{
  id: 'manusmriti', // This ID must match your filename convention
  title: 'Manusmriti',
  author: 'Manu',
  category: 'Dharma Shastra',
  description: 'Ancient legal text...',
  structure: {
    level1: 'Adhyaya',
    level2: 'Section',
    hasSections: false // Set to true if you use the 2-level accordion in Sidebar
  }
}
```

### Step 3: Wire into Service
Open `services/library.ts`.
1.  Import your data constant.
2.  Add it to the `getBookContent` switch statement.

```typescript
import { MANUSMRITI_DATA } from '../data/manusmriti';

// ... inside getBookContent
case 'manusmriti':
  staticChapters = MANUSMRITI_DATA;
  break;
```

---

## 3. Best Practices & Validation

### Runtime Validation
The application includes a `validateBookData` utility in `services/library.ts`. When a book is loaded, the application checks:
1.  If chapters exist.
2.  If the hierarchical structure (Chapter -> Section -> Verse) remains intact.
3.  If critical fields (`id`, `sanskrit`) are present.

If validation fails, an error is logged to the console, and an empty book is returned to prevent the UI from crashing.

### Performance
For datasets exceeding 5MB:
*   Do not bundle them in the main bundle.
*   Convert `getBookContent` to use dynamic `import()`:
    ```typescript
    case 'large-book':
       const mod = await import('../data/large-book');
       staticChapters = mod.LARGE_BOOK_DATA;
       break;
    ```

### IDs
*   **Verse IDs** must be unique within a book.
*   **Translation IDs** (inside `ContentText`) should be simple codes like 'en', 'hi', or 'auth-name'.

---

## 4. Troubleshooting

*   **Book not appearing**: Check `data/metadata.ts`.
*   **White screen on select**: Check console for "Data integrity validation failed". Ensure your data file exports an array of `Chapter` objects, not `Verse` objects directly.
*   **Search not working**: Ensure `fuzzyMatch` in `searchUtils.ts` supports the character set used (currently optimized for Latin and Devanagari).
