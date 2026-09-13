import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function AIPage({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function ask(event: React.FormEvent) {
    event.preventDefault(); setError(''); setAnswer(''); setLoading(true);
    try {
      const response = await fetch('/api/ai/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); setAnswer(data.answer);
    } catch (e) { setError(e instanceof Error ? e.message : 'Request failed'); } finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-stone-50 text-stone-900 px-4 py-8 md:px-12"><div className="mx-auto max-w-3xl">
    <button onClick={onBack} className="mb-10 flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-ochre-700"><ArrowLeft size={16}/> Back to Library</button>
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ochre-700">Library intelligence</p><h1 className="font-serif text-4xl font-bold md:text-6xl">Ask the texts.</h1>
    <p className="mt-4 max-w-2xl text-stone-600">Ask questions about the GitHub-versioned books. Answers are grounded in the library context and cite verse identifiers where available.</p>
    <form onSubmit={ask} className="mt-10 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-500">Powered by Groq. Your API key stays securely on the server.</p>
      <label htmlFor="question" className="text-xs font-bold uppercase tracking-wider text-stone-500">Question</label><textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} required rows={5} placeholder="What does this text say about..." className="resize-y rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-ochre-500" />
      <button disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-3 font-bold text-white hover:bg-ochre-700 disabled:opacity-50">{loading ? 'Thinking…' : 'Ask the library'} <Send size={16}/></button>
    </form>
    {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}{answer && <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-serif text-xl font-bold">Answer</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-stone-700">{answer}</p></section>}
  </div></main>;
}
