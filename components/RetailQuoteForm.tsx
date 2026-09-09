'use client';

import { useState } from 'react';

export function RetailQuoteForm({ productName }: { productName?: string }) {
  const [isUS, setIsUS] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: productName ? `I'm interested in: ${productName}` : '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [discount, setDiscount] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isUsBased: isUS === true, type: 'retail' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiscount(data.discountPercent);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-pulse-red/30 bg-pulse-red/5 p-8 text-center">
        
        <p className="mb-2 font-display text-xl font-bold">Quote Request Received!</p>
        {discount > 0 && (
          <p className="mb-2 font-semibold text-pulse-red">{discount}% discount applied to your quote!</p>
        )}
        <p className="text-sm text-black/60 dark:text-white/60">
          We'll get back to you within 24 hours with pricing and availability.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">What are you interested in? *</label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
      </div>

      {/* US Discount Offer */}
      <div className="rounded-2xl border border-pulse-red/30 bg-pulse-red/5 p-5">
        <p className="mb-3 font-semibold text-pulse-red">Special Offer for US Residents</p>
        <p className="mb-4 text-sm text-black/70 dark:text-white/70">
          As a US based customer, you qualify for an exclusive <strong>10% discount</strong> on your order.
          Are you a US resident?
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsUS(true)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${isUS === true ? 'border-pulse-red bg-pulse-red text-white' : 'border-black/10 hover:border-pulse-red dark:border-white/15'}`}>
            Yes, I'm a US Resident
          </button>
          <button type="button" onClick={() => setIsUS(false)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${isUS === false ? 'border-black/30 bg-black/5 dark:border-white/20' : 'border-black/10 hover:border-black/30 dark:border-white/15'}`}>
            No, I'm not
          </button>
        </div>
        {isUS === true && (
          <p className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400">
            A 10% US resident discount will be applied to your quote.
          </p>
        )}
        {isUS === false && (
          <p className="mt-3 text-sm text-black/50 dark:text-white/40">
            No worries, you will still receive our best pricing.
          </p>
        )}
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="btn-primary w-full sm:w-auto">
        {status === 'sending' ? 'Sending…' : 'Request Quote'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong, please try again.</p>}
    </form>
  );
}
