import React, { useState } from 'react';
import { LockKeyhole, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ username: username.trim(), password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Invalid username or password.');
      onLogin();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-stone-950 px-4 py-8 text-white flex items-center justify-center">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-red-700 text-yellow-100"><LockKeyhole size={26} /></div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300">SutraLibrary</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Private archive</h1>
      <p className="mt-3 leading-6 text-stone-300">Sign in with the credentials provided by the site owner.</p>
      <div className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-semibold">Username<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-yellow-300" /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold">Password
          <span className="relative">
            <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 pr-12 text-white outline-none focus:border-yellow-300" />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>
        </label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/30 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 px-5 py-3 font-bold text-stone-950 transition hover:bg-yellow-200 disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
    </form>
  </main>;
}
