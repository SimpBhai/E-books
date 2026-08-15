import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { BOOKS, UNIQUE_BOOKS } from './data/metadata';
import { getChaptersForBook, getVersesForBook } from './services/bookRegistry';
import { fuzzyMatch } from './services/searchUtils';

const app = express();
const PORT = 3000;
const apiHits = new Map<string, { count: number; resetAt: number }>();
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
  res.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://api.groq.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
  if (process.env.NODE_ENV === 'production') res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '32kb' }));

function safeEqual(a: string, b: string) { const aa = Buffer.from(a); const bb = Buffer.from(b); return aa.length === bb.length && crypto.timingSafeEqual(aa, bb); }
function rateLimit(store: Map<string, { count: number; resetAt: number }>, key: string, max: number, windowMs: number) { const now = Date.now(); const current = store.get(key); if (!current || current.resetAt < now) { store.set(key, { count: 1, resetAt: now + windowMs }); return true; } current.count += 1; return current.count <= max; }
function apiKey(req: express.Request) { return req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim(); }
function authorizedApi(req: express.Request) { const key = apiKey(req); const configured = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').map(x => x.trim()).filter(Boolean); return Boolean(key && configured.some(item => safeEqual(item, key))); }


app.get('/api/books', (_req, res) => res.json(UNIQUE_BOOKS));
app.get('/api/books/search', (req, res) => { const query = String(req.query.q ?? '').trim(); if (query.length < 2) return res.json([]); res.json(BOOKS.flatMap(book => getVersesForBook(book.id).filter(v => fuzzyMatch(query, v.id, v.sanskrit, v.transliteration, ...(v.sutrarth?.map(x => x.text) ?? []), ...(v.summary?.map(x => x.text) ?? []))).map(verse => ({ book, verse })))); });
app.get('/api/books/:id', (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(book) : res.status(404).json({ error: 'Book not found' }); });
app.get(['/api/books/:id/chapters', '/api/books/:id/content'], (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getChaptersForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:id/verses', (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getVersesForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:bookId/verses/:verseId', (req, res) => { const verse = getVersesForBook(req.params.bookId).find(item => item.id === req.params.verseId); return verse ? res.json(verse) : res.status(404).json({ error: 'Verse not found' }); });

async function answerWithGroq(question: string, bookId?: string) {
  const context = (bookId ? getVersesForBook(bookId) : BOOKS.flatMap(book => getVersesForBook(book.id))).slice(0, 80).map(v => `${v.id}: ${v.sanskrit}\n${v.transliteration}\n${(v.summary ?? []).map(x => x.text).join(' ')}`).join('\n\n');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', temperature: 0.2, messages: [{ role: 'system', content: 'Answer only from the supplied Sanskrit library context. If context is insufficient, say so. Cite verse ids when possible.' }, { role: 'user', content: `Library context:\n${context}\n\nQuestion: ${question}` }] }) });
  if (!response.ok) throw new Error('Groq request failed');
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || 'No answer was returned.';
}
app.post('/api/ai/answer', async (req, res) => {
  const key = apiKey(req) || req.ip || 'unknown';
  if (!rateLimit(apiHits, key, 30, 60_000)) return res.status(429).json({ error: 'Rate limit exceeded.' });
  if (!authorizedApi(req)) return res.status(401).json({ error: 'A valid API key is required.' });
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 2000) return res.status(400).json({ error: 'Question must be 1–2000 characters.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Groq is not configured.' });
  try { res.json({ answer: await answerWithGroq(question, typeof req.body.bookId === 'string' ? req.body.bookId : undefined) }); } catch { res.status(502).json({ error: 'AI provider unavailable.' }); }
});

async function startServer() { if (process.env.NODE_ENV !== 'production') app.use((await createViteServer({ server: { middlewareMode: true, hmr: false }, appType: 'spa' })).middlewares); else { app.use(express.static(path.join(process.cwd(), 'dist'))); app.get('*all', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html'))); } app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`)); }
startServer();
