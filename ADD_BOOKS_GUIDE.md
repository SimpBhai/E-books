# How to Add New Books to SutraLibrary

This application is designed to be flexible and support various schemas (e.g., Simple Poetry, Darshan Sastra, Grammar).

## 1. Prepare Your Data
Create a new file in the `data/` folder (e.g., `data/gita.ts`).
Structure your content using the `Chapter` and `Verse` interfaces defined in `types.ts`.

### Verse Structure Options
The viewer adapts based on what fields you provide in the `Verse` object:

1. **Darshan Sastra (Philosophy)**
   - Use `sanskrit` & `transliteration`.
   - Use `sutrarth`: For word-for-word or literal meanings.
   - Use `summary`: For "Bhavarth" or the gist.
   - Use `commentaries`: For "Bhasya" or detailed analysis.

2. **Simple Texts (Poetry/Stotras)**
   - Use `sanskrit` & `transliteration`.
   - Use `summary`: For the translation.
   - Omit `sutrarth` and `commentaries` if not needed.

## 2. Register the Book
Open `data/metadata.ts` and add an entry to the `BOOKS` array:

```typescript
{
  id: 'gita', // Must match the ID used in step 3
  title: 'Bhagavad Gita',
  author: 'Vyasa',
  category: 'Itihasa',
  description: 'The conversation between Arjuna and Krishna.'
}
```

## 3. Load the Content
Open `services/library.ts` and update the `getBookContent` function:

1. Import your data file:
   ```typescript
   import { GITA_DATA } from '../data/gita';
   ```

2. Add a case to the switch statement:
   ```typescript
   export const getBookContent = (bookId: string): Chapter[] => {
     switch (bookId) {
       case 'ashtadhyayi': return ASHTADHYAYI_DATA;
       case 'yogasutra': return YOGASUTRA_DATA;
       case 'gita': return GITA_DATA; // <--- Add this line
       default: return [];
     }
   };
   ```

## Tips
- **Performance**: For very large texts (1000+ books), consider replacing the static imports in `services/library.ts` with dynamic `import()` calls or fetching JSON from an external server/CDN.
- **IDs**: Ensure verse IDs (e.g., "1.1") are unique within a book.
