'use client';

import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-pulse-red/30 bg-pulse-red/5 p-8 text-center">
        <p className="mb-2 font-display text-xl font-semibold">Thanks — we got it!</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          Someone from the Pulse &amp; Plug team will reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your Name *</label>
          <input name="name" required className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Business Name</label>
          <input name="business" className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email *</label>
          <input type="email" name="email" required className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone</label>
          <input name="phone" className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Tell us about your business *</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What kind of business do you run, and what equipment are you interested in?"
          className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
        />
      </div>
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full sm:w-auto">
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-blue-600">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
