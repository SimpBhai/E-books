import express from 'express';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { BOOKS, UNIQUE_BOOKS } from './data/metadata';
import { getChaptersForBook, getVersesForBook } from './services/bookRegistry';
import { fuzzyMatch } from './services/searchUtils';

const app = express();
const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'development-only-change-me';
const sessions = new Map<string, { expiresAt: number; userId: string }>();
const attempts = new Map<string, { count: number; resetAt: number }>();

type ConfiguredUser = { id: string; passwordHash: string };
function configuredUsers(): ConfiguredUser[] {
  const users: ConfiguredUser[] = [];
  try {
    const raw = process.env.SITE_USERS_JSON || '[]';
    const parsed = JSON.parse(raw);
    const candidates = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.entries(parsed).map(([id, value]) => ({ id, passwordHash: typeof value === 'string' ? value : (value as { passwordHash?: unknown })?.passwordHash })) : []);
    users.push(...candidates.filter((user): user is ConfiguredUser => typeof user?.id === 'string' && typeof user?.passwordHash === 'string' && user.id.length <= 128 && /^\$2[aby]?\$\d{2}\$/.test(user.passwordHash)));
  } catch { /* Invalid JSON is handled as an unconfigured user list. */ }
  // Keep the original single-user environment variables working during migration.
  const legacyId = process.env.SITE_USERNAME;
  const legacyPassword = process.env.SITE_PASSWORD;
  if (legacyId && legacyPassword && !users.some(user => user.id === legacyId)) {
    users.push({ id: legacyId, passwordHash: legacyPassword });
  }
  return users;
}
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

function tokenFor(value: string) { return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex'); }
function safeEqual(a: string, b: string) { const aa = Buffer.from(a); const bb = Buffer.from(b); return aa.length === bb.length && crypto.timingSafeEqual(aa, bb); }
function cookieValue(req: express.Request) { return req.headers.cookie?.match(/(?:^|; )sutra_session=([^;]+)/)?.[1]; }
function currentSession(req: express.Request) { const token = cookieValue(req); const session = token ? sessions.get(token) : undefined; if (!session || session.expiresAt <= Date.now()) { if (token) sessions.delete(token); return undefined; } return session; }
function isSessionValid(req: express.Request) { return Boolean(currentSession(req)); }
function requireSession(req: express.Request, res: express.Response, next: express.NextFunction) { if (!isSessionValid(req)) return res.status(401).json({ error: 'Authentication required.' }); next(); }
function rateLimit(store: Map<string, { count: number; resetAt: number }>, key: string, max: number, windowMs: number) { const now = Date.now(); const current = store.get(key); if (!current || current.resetAt < now) { store.set(key, { count: 1, resetAt: now + windowMs }); return true; } current.count += 1; return current.count <= max; }
function apiKey(req: express.Request) { return req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim(); }
function authorizedApi(req: express.Request) { const key = apiKey(req); const configured = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').map(x => x.trim()).filter(Boolean); return Boolean(key && configured.some(item => safeEqual(item, key))); }

app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!rateLimit(attempts, ip, 8, 15 * 60_000)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const users = configuredUsers();
  if (users.length === 0) return res.status(503).json({ error: 'No users are configured. Add SITE_USERS_JSON in the deployment environment and redeploy.' });
  const user = users.find(candidate => safeEqual(candidate.id, username));
  let valid = false;
  if (user) {
    valid = /^\$2[aby]?\$\d{2}\$/.test(user.passwordHash)
      ? await bcrypt.compare(password, user.passwordHash)
      : safeEqual(password, user.passwordHash);
  }
  if (!valid || !user) return res.status(401).json({ error: 'Invalid credentials.' });
  const token = tokenFor(`${user.id}:${crypto.randomUUID()}`);
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 8 * 60 * 60_000 });
  res.setHeader('Set-Cookie', `sutra_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.json({ authenticated: true });
});
app.get('/api/auth/session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ authenticated: isSessionValid(req) });
});
app.post('/api/auth/logout', (req, res) => { const token = cookieValue(req); if (token) sessions.delete(token); res.setHeader('Set-Cookie', 'sutra_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'); res.json({ authenticated: false }); });

app.get('/api/auth/config', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ configured: configuredUsers().length > 0, userCount: configuredUsers().length });
});

app.get('/api/books', requireSession, (_req, res) => res.json(UNIQUE_BOOKS));
app.get('/api/books/search', requireSession, (req, res) => { const query = String(req.query.q ?? '').trim(); if (query.length < 2) return res.json([]); res.json(BOOKS.flatMap(book => getVersesForBook(book.id).filter(v => fuzzyMatch(query, v.id, v.sanskrit, v.transliteration, ...(v.sutrarth?.map(x => x.text) ?? []), ...(v.summary?.map(x => x.text) ?? []))).map(verse => ({ book, verse })))); });
app.get('/api/books/:id', requireSession, (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(book) : res.status(404).json({ error: 'Book not found' }); });
app.get(['/api/books/:id/chapters', '/api/books/:id/content'], requireSession, (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getChaptersForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:id/verses', requireSession, (req, res) => { const book = BOOKS.find(item => item.id === req.params.id); return book ? res.json(getVersesForBook(book.id)) : res.status(404).json({ error: 'Book not found' }); });
app.get('/api/books/:bookId/verses/:verseId', requireSession, (req, res) => { const verse = getVersesForBook(req.params.bookId).find(item => item.id === req.params.verseId); return verse ? res.json(verse) : res.status(404).json({ error: 'Verse not found' }); });

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
