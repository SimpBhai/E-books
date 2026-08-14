import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { BOOKS } from './data/metadata';
import { getChaptersForBook, getVersesForBook } from './services/bookRegistry';
import { fuzzyMatch } from './services/searchUtils';

const app = express();
const PORT = 3000;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '64kb' }));

app.get('/api/books', (_req, res) => res.json(BOOKS));
app.get('/api/books/search', (req, res) => {
  const query = String(req.query.q ?? '').trim();
  if (query.length < 2) return res.json([]);
  const results = BOOKS.flatMap((book) => getVersesForBook(book.id)
    .filter((verse) => fuzzyMatch(query, verse.id, verse.sanskrit, verse.transliteration, ...(verse.sutrarth?.map((x) => x.text) ?? []), ...(verse.summary?.map((x) => x.text) ?? [])))
    .map((verse) => ({ book, verse })));
  res.json(results);
});
app.get('/api/books/:id', (req, res) => {
  const book = BOOKS.find((item) => item.id === req.params.id);
  return book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
});
app.get(['/api/books/:id/chapters', '/api/books/:id/content'], (req, res) => {
  const book = BOOKS.find((item) => item.id === req.params.id);
  return book ? res.json(getChaptersForBook(book.id)) : res.status(404).json({ error: 'Book not found' });
});
app.get('/api/books/:id/verses', (req, res) => {
  const book = BOOKS.find((item) => item.id === req.params.id);
  return book ? res.json(getVersesForBook(book.id)) : res.status(404).json({ error: 'Book not found' });
});
app.get('/api/books/:bookId/verses/:verseId', (req, res) => {
  const verse = getVersesForBook(req.params.bookId).find((item) => item.id === req.params.verseId);
  return verse ? res.json(verse) : res.status(404).json({ error: 'Verse not found' });
});

function authorized(req: express.Request) {
  const key = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const keys = (process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? '').split(',').map((item) => item.trim()).filter(Boolean);
  return Boolean(key && keys.includes(key));
}
async function answerWithGroq(question: string, bookId?: string) {
  const context = (bookId ? getVersesForBook(bookId) : BOOKS.flatMap((book) => getVersesForBook(book.id))).slice(0, 80)
    .map((verse) => `${verse.id}: ${verse.sanskrit}\n${verse.transliteration}\n${(verse.summary ?? []).map((x) => x.text).join(' ')}`).join('\n\n');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile', temperature: 0.2, messages: [
      { role: 'system', content: 'Answer only from the supplied Sanskrit library context. If context is insufficient, say so. Cite verse ids when possible.' },
      { role: 'user', content: `Library context:\n${context}\n\nQuestion: ${question}` },
    ] }),
  });
  if (!response.ok) throw new Error(`Groq request failed: ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? 'No answer was returned.';
}
app.post('/api/ai/answer', async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: 'A valid API key is required.' });
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 2000) return res.status(400).json({ error: 'Question must be 1–2000 characters.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Groq is not configured.' });
  try { res.json({ answer: await answerWithGroq(question, req.body.bookId) }); }
  catch { res.status(502).json({ error: 'Groq request failed.' }); }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') app.use((await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })).middlewares);
  else { app.use(express.static(path.join(process.cwd(), 'dist'))); app.get('*all', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html'))); }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}
startServer();
