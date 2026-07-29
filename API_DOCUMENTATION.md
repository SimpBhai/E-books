# SutraLibrary Books API & Vercel Deployment Documentation

An open REST API for classical Indian scriptures and texts (such as Aṣṭādhyāyī, Yoga Sūtras, etc.), supporting chapters, sections, verses/sutras, transliterations, sutrartha (meanings), and Bhasya (commentaries) with translations.

---

## 1. Database & Content Structure

### Is everything in the API database?
**Yes!** All scriptures, chapters, sutras, padachheda, translations, and commentaries (Bhasya) are organized in a structured API database (`/data/*`). 

Current scriptures included in the database:
1. **Aṣṭādhyāyī (अष्टाध्यायी)** by Maharshi Panini — Grammar & Rules (3,996 Sutras total, with classical Kashika Vritti & Mahabhashya commentaries)
2. **Pātañjala Yogasūtra (योगसूत्रम्)** by Maharshi Patanjali — Yoga Philosophy (196 Sutras across 4 Padas, with Vyasa Bhashya & Bhoja Vritti commentaries)

### Can I give you text to add to the database?
**Yes, absolutely!** You can share any text in the chat (Sanskrit, transliteration, English or Hindi translations, or entire books like Bhagavad Gita, Upanishads, Nyaya Sutras, etc.). 

When you provide text:
1. I will structure it into standard JSON/TypeScript scripture format.
2. I will automatically add it to the `/data` directory.
3. The API (`/api/books`, `/api/books/:id/verses`, global search, and Bhasya generators) will immediately serve the new text to your web application and any external API consumers!

---

## 2. Base URL & Endpoints

When hosted on **Vercel** or locally:
```
https://your-vercel-domain.vercel.app/api
```
or locally:
```
http://localhost:3000/api
```

### CORS & Access Control
All API responses include `Access-Control-Allow-Origin: *` headers, allowing cross-origin requests from web browsers, mobile apps, or third-party servers.

---

## 3. API Endpoints Reference

### 1. List All Books
Retrieves all available scriptures in the library.

* **Endpoint:** `GET /api/books`
* **Response Status:** `200 OK`
* **Example Response:**
```json
[
  {
    "id": "ashtadhyayi",
    "title": "अष्टाध्यायी",
    "transliteration": "Aṣṭādhyāyī",
    "author": "Maharshi Panini",
    "description": "The foundational text of Sanskrit grammar...",
    "category": "Vyakarana",
    "tags": ["Grammar", "Sanskrit", "Panini"],
    "totalVerses": 3996
  },
  {
    "id": "yogasutra",
    "title": "योगसूत्रम्",
    "transliteration": "Pātañjalayogasūtra",
    "author": "Maharshi Patanjali",
    "description": "Foundational text of Yoga philosophy...",
    "category": "Darshana",
    "tags": ["Yoga", "Philosophy", "Meditation"],
    "totalVerses": 196
  }
]
```

---

### 2. Get Book Metadata
Retrieves metadata for a specific scripture.

* **Endpoint:** `GET /api/books/:bookId`
* **Example:** `GET /api/books/yogasutra`
* **Response Status:** `200 OK` or `404 Not Found`

---

### 3. Get Chapters & Structural Breakdown
Retrieves all chapters, sections, and nested verses with commentary for a book.

* **Endpoint:** `GET /api/books/:bookId/chapters`
* **Alternative Endpoint:** `GET /api/books/:bookId/content`
* **Example:** `GET /api/books/ashtadhyayi/chapters`
* **Response Status:** `200 OK` or `404 Not Found`

---

### 4. Get All Verses / Sutras
Returns a flattened list of all verses for a given book.

* **Endpoint:** `GET /api/books/:bookId/verses`
* **Example:** `GET /api/books/yogasutra/verses`
* **Response Status:** `200 OK` or `404 Not Found`

---

### 5. Get Single Verse / Sutra
Retrieves a specific verse by verse ID.

* **Endpoint:** `GET /api/books/:bookId/verses/:verseId`
* **Example:** `GET /api/books/yogasutra/verses/1.1`
* **Response Status:** `200 OK` or `404 Not Found`
* **Example Response:**
```json
{
  "id": "1.1",
  "number": "1.1",
  "sanskrit": "अथ योगानुशासनम्",
  "transliteration": "atha yogānuśāsanam",
  "sutrarth": [
    { "id": "st1", "language": "English", "author": "Literal", "text": "Atha (Now) Yoga (Yoga) Anushasanam (Instruction)." },
    { "id": "st2", "language": "Hindi", "author": "Literal", "text": "अथ (अब) योग (योग का) अनुशासनम् (उपदेश आरम्भ होता है)।" }
  ],
  "commentaries": [
    {
      "id": "c1",
      "author": "Vyasa Bhashya (व्यासभाष्यम्)",
      "language": "Sanskrit",
      "text": "अथेत्ययमधिकारार्थः। योगानुशासनं शास्त्रमधिकृतं वेदितव्यम्। योगः समाधिः।"
    }
  ]
}
```

---

### 6. Search Across Scriptures
Searches across Sanskrit text, transliteration, verse IDs, and meanings.

* **Endpoint:** `GET /api/books/search?q=:query`
* **Example:** `GET /api/books/search?q=samadhi`
* **Response Status:** `200 OK`

---

### 7. Classical Bhashya Exposition Generator
Generates or retrieves deep Bhashya commentaries (Vyasa Bhashya / Mahabhashya / Kashika Vritti) with multi-language explanations.

* **Endpoint:** `POST /api/bhasya`
* **Request Body:**
```json
{
  "sutraId": "1.2",
  "sanskrit": "योगश्चित्तवृत्तिनिरोधः",
  "transliteration": "yogaś citta-vṛtti-nirodhaḥ",
  "sutrarth": [
    { "language": "English", "text": "Yoga is the inhibition of the modifications of the mind-stuff." }
  ],
  "bookTitle": "Yogasutra"
}
```
* **Response Body Example:**
```json
{
  "id": "ai-bhasya-1.2",
  "author": "Vyasa Bhashya (व्यासभाष्यम्)",
  "language": "Sanskrit",
  "text": "चित्तं हि प्रख्याप्रवृत्तिस्थितिशीलत्वात् त्रिगुणम्...",
  "translations": [
    {
      "id": "eng-ai",
      "language": "English",
      "author": "Classical English Exposition",
      "text": "Vyasa commentary explains that the mind-stuff has three qualities..."
    },
    {
      "id": "hin-ai",
      "language": "Hindi",
      "author": "व्यासभाष्य हिन्दी अनुवाद",
      "text": "चित्त प्रकाश, प्रवृत्ति और स्थिति स्वभाव वाला होने से त्रिगुणात्मक है..."
    }
  ]
}
```

---

## 4. Deploying to Vercel

This repository is pre-configured for instant deployment on Vercel as a hybrid application (Vite Frontend SPA + Vercel Serverless Functions API).

### Step-by-Step Vercel Deployment:

1. **Push to GitHub**:
   - Push your project code or export ZIP to a GitHub repository.

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Click **Import Repository** and select your repository.

3. **Build & Framework Settings** (Vercel automatically detects Vite):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
   In Vercel Settings -> Environment Variables, add:
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API Key for dynamic Bhashya generation.

5. **Deploy**:
   - Click **Deploy**. Vercel will build both the frontend and the `/api` serverless endpoints automatically!

### How Vercel Routing Works (`vercel.json`):
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
- `/api/*` requests route to `/api/index.ts` (Express Vercel Serverless Function).
- All other route requests serve the React frontend app.
