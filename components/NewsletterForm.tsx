'use client';

import { useState } from 'react';

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStatus('sent');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  if (status === 'sent') {
    return (
      <p className={dark ? 'text-white/90' : 'text-black/70 dark:text-white/70'}>
        Thanks for subscribing. You're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className={`w-full rounded-full px-5 py-3 text-sm outline-none ${
          dark
            ? 'bg-white text-black placeholder:text-black/40'
            : 'border border-black/10 bg-transparent placeholder:text-black/40 dark:border-white/15 dark:placeholder:text-white/40'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex-shrink-0 rounded-full bg-pulse-red px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-pulse-redDark"
      >
        {status === 'sending' ? 'Joining…' : 'Subscribe'}
      </button>
      {status === 'error' && <p className="text-sm text-blue-400">{message}</p>}
    </form>
  );
}
