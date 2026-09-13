import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { BOOKS, UNIQUE_BOOKS } from './data/metadata';
import { BOOK_SCHEMAS, BOOK_ADAPTERS, getChaptersForBook, getVersesForBook } from './services/bookRegistry';
import { fuzzyMatch } from './services/searchUtils';

const app = express();
const PORT = 3000;
const allowedOrigin = process.env.API_ALLOWED_ORIGIN || '';

app.disable('x-powered-by');
app.use((req, res, next) => {
  if (allowedOrigin && req.headers.origin === allowedOrigin) res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('X-Frame-Options', 'DENY');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.header('Content-Security-Policy', "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
  if (process.env.NODE_ENV === 'production') res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '32kb' }));

app.get('/api/books', (_req, res) => res.json(UNIQUE_BOOKS));
app.get('/api/schemas', (_req, res) => res.json(BOOK_SCHEMAS));
app.get('/api/books/:id/schema', (req, res) => {
  const book = UNIQUE_BOOKS.find(item => item.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const schemaId = book.schema || BOOK_ADAPTERS[book.id]?.schema || 'custom';
  return res.json({ bookId: book.id, schema: BOOK_SCHEMAS[schemaId] || BOOK_SCHEMAS.custom });
});
app.get('/api/books/search', (req, res) => {
  const query = String(req.query.q ?? '').trim();
  if (query.length < 2) return res.json([]);
  const results = UNIQUE_BOOKS.flatMap(book => getVersesForBook(book.id)
    .filter(verse => fuzzyMatch(query, verse.id, verse.sanskrit, verse.transliteration, ...(verse.sutrarth?.map(item => item.text) ?? []), ...(verse.summary?.map(item => item.text) ?? []), ...(verse.commentaries?.flatMap(commentary => [commentary.text, ...(commentary.translations?.map(item => item.text) ?? [])]) ?? [])))
    .map(verse => ({ book, verse })));
  res.json(results);
});
app.get('/api/books/:id', (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(book) : res.status(404).json({ error: 'Book not found' }); });
app.get(['/api/books/:id/chapters', '/api/books/:id/content'], (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getChaptersForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:id/verses', (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getVersesForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:bookId/verses/:verseId', (req, res) => { const verse = getVersesForBook(req.params.bookId).find(item => item.id === req.params.verseId); return verse ? res.json(verse) : res.status(404).json({ error: 'Verse not found' }); });

async function startServer() { if (process.env.NODE_ENV !== 'production') app.use((await createViteServer({ server: { middlewareMode: true, hmr: false }, appType: 'spa' })).middlewares); else { app.use(express.static(path.join(process.cwd(), 'dist'))); app.get('*all', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html'))); } app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`)); }
startServer();
