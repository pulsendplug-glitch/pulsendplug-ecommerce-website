'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9()+\-.\s]{7,20}$/;

type SubmitState = 'idle' | 'submitting' | 'error';

export default function RequestQuotePage() {
  const { items, itemCount, subtotal, hasUnpricedItems, clearCart, isLoaded } = useCart();

  const [form, setForm] = useState({ name: '', email: '', phone: '', deliveryAddress: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitState>('idle');
  const [serverError, setServerError] = useState('');
  const [confirmation, setConfirmation] = useState<{ requestNumber: string } | null>(null);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please enter your full name.';
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (!form.phone.trim() || !PHONE_RE.test(form.phone.trim())) next.phone = 'Please enter a valid phone number.';
    if (!form.deliveryAddress.trim() || form.deliveryAddress.trim().length < 8)
      next.deliveryAddress = 'Please enter a complete delivery address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/quote-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          deliveryAddress: form.deliveryAddress.trim(),
          message: form.message.trim() || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong submitting your request.');

      setConfirmation({ requestNumber: data.requestNumber });
      clearCart();
      setStatus('idle');
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  if (confirmation) {
    return (
      <div className="section-pad py-24">
        <div className="container-max mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mb-4 font-display text-3xl font-bold">Quote Request Received</h1>
          <p className="mb-2 text-black/70 dark:text-white/70">
            Thank you for choosing Pulse &amp; Plug. We've successfully received your request and our team will review your order details.
          </p>
          <p className="mb-8 text-black/70 dark:text-white/70">
            We'll contact you using the phone number or email address you provided to discuss your quote, delivery, and final payment arrangements.
          </p>
          <p className="mb-8 font-display text-xl font-bold text-pulse-red">
            Quote Request #: {confirmation.requestNumber}
          </p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (isLoaded && items.length === 0) {
    return (
      <div className="section-pad py-24">
        <div className="container-max mx-auto max-w-xl text-center">
          <h1 className="mb-4 font-display text-2xl font-bold">Your Cart Is Empty</h1>
          <p className="mb-8 text-black/60 dark:text-white/60">
            Add some products to your cart before requesting a quote.
          </p>
          <Link href="/shop" className="btn-primary">Browse Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad py-16">
      <div className="container-max">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Final Step</p>
        <h1 className="mb-10 font-display text-4xl font-bold">Request Your Quote</h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit} className="card space-y-5 p-6">
            <h2 className="font-display text-lg font-bold">Your Information</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
                />
                {errors.name && <p className="mt-1 text-xs text-blue-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
                />
                {errors.email && <p className="mt-1 text-xs text-blue-600">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone Number *</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
                />
                {errors.phone && <p className="mt-1 text-xs text-blue-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Delivery Address *</label>
                <input
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Street, city, state, zip"
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
                />
                {errors.deliveryAddress && <p className="mt-1 text-xs text-blue-600">{errors.deliveryAddress}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Additional Message (optional)</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Special delivery instructions or anything else we should know"
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
              />
            </div>

            {serverError && <p className="text-sm text-blue-600">{serverError}</p>}

            <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">
              {status === 'submitting' ? 'Submitting…' : 'Submit Quote Request'}
            </button>
          </form>

          <div className="card h-fit p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Your Quote Request</h2>
            <p className="mb-4 text-xs uppercase tracking-wide text-black/40 dark:text-white/40">
              Products in Cart (read only)
            </p>
            <div className="mb-5 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-pulse-fog dark:bg-pulse-steel">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      Qty {item.quantity} {item.price !== null && `· $${item.price.toLocaleString()} each`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {item.price !== null ? `$${(item.price * item.quantity).toLocaleString()}` : 'Custom'}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-black/5 pt-4 text-sm dark:border-white/10">
              <div className="mb-1 flex justify-between">
                <span className="text-black/60 dark:text-white/60">Total Items</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60 dark:text-white/60">Estimated Cart Total</span>
                <span className="font-display text-lg font-bold">${subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-3 text-xs text-black/40 dark:text-white/40">
                This is an estimated total. Your final quote may depend on shipping, quantity, location, or business pricing.
              </p>
            </div>
            <Link href="/cart" className="mt-5 inline-block text-sm font-semibold text-pulse-red hover:underline">
              ← Edit items in cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
