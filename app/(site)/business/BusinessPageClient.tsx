'use client';

import { useState } from 'react';
import Image from 'next/image';

type Product = {
  id: string; name: string; slug: string; category: string;
  shortDesc: string; price: number | null; imageUrl: string | null;
};

const BUSINESS_DISCOUNT = 20; // percent

export function BusinessPageClient({ products }: { products: Product[] }) {
  const [step, setStep] = useState<'register' | 'shop'>('register');
  const [discountCode, setDiscountCode] = useState('');
  const [regForm, setRegForm] = useState({ businessName: '', regNumber: '', email: '', phone: '' });
  const [regStatus, setRegStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteForm, setQuoteForm] = useState({ name: '', message: '' });
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegStatus('sending');
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiscountCode(data.discountCode);
      setRegStatus('done');
      setStep('shop');
    } catch {
      setRegStatus('error');
    }
  }

  async function handleQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    setQuoteStatus('sending');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quoteForm.name,
          email: regForm.email,
          business: regForm.businessName,
          message: `${quoteForm.message}\n\nProduct interested in: ${selectedProduct.name}`,
          discountCode,
          type: 'business',
        }),
      });
      if (!res.ok) throw new Error();
      setQuoteStatus('sent');
    } catch {
      setQuoteStatus('error');
    }
  }

  function discountedPrice(price: number | null) {
    if (!price) return null;
    return price * (1 - BUSINESS_DISCOUNT / 100);
  }

  return (
    <div className="section-pad py-16">
      <div className="container-max">
        {step === 'register' ? (
          <div className="mx-auto max-w-xl">
            <div className="card p-8">
              <h2 className="mb-2 font-display text-2xl font-bold">Register Your Business</h2>
              <p className="mb-6 text-sm text-black/60 dark:text-white/60">
                Fill in your details below to unlock your 20% business discount and access exclusive pricing.
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business Name *</label>
                  <input required value={regForm.businessName}
                    onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                    placeholder="e.g. FitLife Studios LLC"
                    className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business Registration Number *</label>
                  <input required value={regForm.regNumber}
                    onChange={(e) => setRegForm({ ...regForm, regNumber: e.target.value })}
                    placeholder="e.g. 123456789"
                    className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business Email *</label>
                  <input type="email" required value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone</label>
                  <input value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                </div>
                {regStatus === 'error' && (
                  <p className="text-sm text-red-600">Something went wrong, please try again.</p>
                )}
                <button type="submit" disabled={regStatus === 'sending'} className="btn-primary w-full">
                  {regStatus === 'sending' ? 'Registering…' : 'Register & Unlock 20% Off'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Success banner */}
            <div className="mb-10 rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
              <p className="mb-1 font-display text-xl font-bold text-green-600 dark:text-green-400">
                Business Registered: 20% Discount Unlocked
              </p>
              <p className="text-sm text-black/60 dark:text-white/60">
                Your discount code: <span className="font-mono font-bold text-pulse-red">{discountCode}</span>
                {' '}This is automatically applied to all your quotes.
              </p>
            </div>

            <div className="mb-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Business Pricing</p>
              <h2 className="font-display text-3xl font-bold">All Equipment: 20% Off</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const sale = discountedPrice(p.price);
                return (
                  <div key={p.id} className="card group overflow-hidden">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-pulse-fog dark:bg-pulse-steel">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-black/30 dark:text-white/30">No image</div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-pulse-red px-3 py-1 text-xs font-bold text-white">
                        −{BUSINESS_DISCOUNT}%
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pulse-red">{p.category}</p>
                      <h3 className="mb-1 font-display text-lg font-semibold">{p.name}</h3>
                      <p className="mb-3 text-sm text-black/60 dark:text-white/60">{p.shortDesc}</p>
                      <div className="mb-4 flex items-center gap-3">
                        {sale ? (
                          <>
                            <span className="font-display text-lg font-bold text-pulse-red">
                              ${sale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm text-black/40 line-through dark:text-white/40">
                              ${p.price!.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-display text-base font-bold">Request Pricing</span>
                        )}
                      </div>
                      <button onClick={() => setSelectedProduct(p)}
                        className="btn-primary w-full py-2.5 text-xs">
                        Request Business Quote
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote modal */}
            {selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="card w-full max-w-lg p-8">
                  {quoteStatus === 'sent' ? (
                    <div className="text-center">
                      
                      <p className="mb-2 font-display text-xl font-bold">Quote Sent!</p>
                      <p className="mb-2 text-sm text-black/60 dark:text-white/60">
                        Your 20% business discount has been applied.
                      </p>
                      <button onClick={() => { setSelectedProduct(null); setQuoteStatus('idle'); }}
                        className="btn-outline mt-4">Browse More</button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-xl font-bold">{selectedProduct.name}</h3>
                          <p className="text-sm text-pulse-red">Business quote, 20% off applied</p>
                        </div>
                        <button onClick={() => setSelectedProduct(null)}
                          className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                      </div>
                      <form onSubmit={handleQuote} className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Your Name *</label>
                          <input required value={quoteForm.name}
                            onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Message and quantity needed</label>
                          <textarea rows={3} value={quoteForm.message}
                            onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15" />
                        </div>
                        {quoteStatus === 'error' && (
                          <p className="text-sm text-red-600">Something went wrong, please try again.</p>
                        )}
                        <button type="submit" disabled={quoteStatus === 'sending'} className="btn-primary w-full">
                          {quoteStatus === 'sending' ? 'Sending…' : 'Submit Business Quote'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
