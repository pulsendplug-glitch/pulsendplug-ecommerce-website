'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type Product = { id: string; name: string; slug: string; category: string; shortDesc: string; description: string; price: number | null; imageUrl: string | null; images: string[]; featured: boolean; inStock: boolean; };
type Business = { id: string; businessName: string; regNumber: string; email: string; phone?: string; discountCode: string; approved: boolean; createdAt: string; };
type Quote = { id: string; name: string; email: string; business?: string; message: string; type: string; discountPercent: number; isUsBased: boolean; createdAt: string; };
type Subscriber = { id: string; email: string; phone?: string; createdAt: string };

const emptyForm = { name: '', category: 'Recovery Chairs', shortDesc: '', description: '', price: '', imageUrl: '', images: [] as string[], featured: false, inStock: true };
const categories = ['Recovery Chairs', 'Saunas', 'Cold Plunge', 'Pilates & Studio', 'Clinical & Rehab', 'Recovery Tools'];

export function AdminPanel() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'products' | 'businesses' | 'quotes' | 'subscribers'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [form, setForm] = useState<typeof emptyForm & { id?: string }>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('pp_admin_key');
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  async function loadAll() {
    const h = { 'x-admin-key': key };
    try {
      const [p, b, q, s] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/business', { headers: h }).then((r) => r.json()),
        fetch('/api/quote', { headers: h }).then((r) => r.json()),
        fetch('/api/subscribe', { headers: h }).then((r) => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setBusinesses(Array.isArray(b) ? b : []);
      setQuotes(Array.isArray(q) ? q : []);
      setSubscribers(Array.isArray(s) ? s : []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    }
  }

  function tryLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) {
      setLoginError('Please enter a password.');
      return;
    }
    setLoginError('');
    sessionStorage.setItem('pp_admin_key', key);
    setAuthed(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': key }, body: fd });
      if (!res.ok) throw new Error('Upload failed. Check that Blob storage is connected.');
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAngleUpload(files: FileList) {
    setUploading(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-key': key }, body: fd });
        if (!res.ok) throw new Error('Upload failed. Check that Blob storage is connected.');
        const data = await res.json();
        uploaded.push(data.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeAngleImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/products/${form.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(form),
      });
      if (res.status === 401) throw new Error('Wrong admin password. Check the ADMIN_PASSWORD environment variable matches what you typed in.');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not save product.');
      }
      setForm(emptyForm);
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } });
    await loadAll();
  }

  function editProduct(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      shortDesc: p.shortDesc,
      description: p.description,
      price: p.price?.toString() ?? '',
      imageUrl: p.imageUrl ?? '',
      images: p.images ?? [],
      featured: p.featured,
      inStock: p.inStock,
    });
    setTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportCSV(data: any[], filename: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [keys.join(','), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm py-24">
        <h1 className="mb-6 font-display text-2xl font-bold">Admin Login</h1>
        <form onSubmit={tryLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-pulse-red dark:border-white/15"
          />
          <button type="submit" className="btn-primary w-full">Enter</button>
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <p className="text-xs text-black/50 dark:text-white/50">
            This checks against the ADMIN_PASSWORD environment variable set in Vercel when you save or delete anything.
          </p>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: 'products', label: `Products (${products.length})` },
    { id: 'businesses', label: `Businesses (${businesses.length})` },
    { id: 'quotes', label: `Quotes (${quotes.length})` },
    { id: 'subscribers', label: `Subscribers (${subscribers.length})` },
  ] as const;

  return (
    <div className="py-16">
      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === t.id ? 'bg-pulse-red text-white' : 'border border-black/10 dark:border-white/15'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'subscribers' && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Newsletter Subscribers</h2>
            <button onClick={() => exportCSV(subscribers, 'subscribers.csv')} className="btn-outline text-xs">Export CSV</button>
          </div>
          {subscribers.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">No subscribers yet.</p>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {subscribers.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium">{s.email}</span>
                    {s.phone && <span className="ml-3 text-sm text-black/50 dark:text-white/50">{s.phone}</span>}
                  </div>
                  <span className="text-sm text-black/50">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'businesses' && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Registered Businesses</h2>
            <button onClick={() => exportCSV(businesses, 'businesses.csv')} className="btn-outline text-xs">Export CSV</button>
          </div>
          {businesses.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">No businesses registered yet.</p>
          ) : (
            <div className="space-y-3">
              {businesses.map((b) => (
                <div key={b.id} className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{b.businessName}</p>
                      <p className="text-sm text-black/60 dark:text-white/60">Registration number {b.regNumber}, {b.email}</p>
                      <p className="mt-1 font-mono text-xs text-pulse-red">Code: {b.discountCode}</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'quotes' && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Quote Requests</h2>
            <button onClick={() => exportCSV(quotes, 'quotes.csv')} className="btn-outline text-xs">Export CSV</button>
          </div>
          {quotes.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">No quotes yet.</p>
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{q.name} {q.business ? `from ${q.business}` : ''}</p>
                      <p className="text-sm text-black/60 dark:text-white/60">{q.email}, {new Date(q.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm">{q.message.substring(0, 100)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${q.type === 'business' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>{q.type}</span>
                      {q.discountPercent > 0 && <span className="rounded-full bg-pulse-red/10 px-3 py-1 text-xs font-semibold text-pulse-red">{q.discountPercent}% off</span>}
                      {q.isUsBased && <span className="text-xs text-black/40 dark:text-white/40">US Resident</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="card sticky top-24 h-fit p-6">
            <h2 className="mb-4 font-display text-xl font-bold">{form.id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input placeholder="Product name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 outline-none focus:border-pulse-red dark:border-white/15" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 outline-none focus:border-pulse-red dark:border-white/15">
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <input placeholder="Short description" required value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 outline-none focus:border-pulse-red dark:border-white/15" />
              <textarea placeholder="Full description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 outline-none focus:border-pulse-red dark:border-white/15" />
              <input type="number" placeholder="Price, optional, leave blank for Request Pricing" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 outline-none focus:border-pulse-red dark:border-white/15" />
              <div>
                <label className="mb-2 block text-sm font-medium">Product Photo</label>
                {form.imageUrl && (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-pulse-fog dark:bg-pulse-steel">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="w-full text-sm" />
                {uploading && <p className="mt-1 text-xs text-black/50">Uploading</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">360 View Photos (optional)</label>
                <p className="mb-2 text-xs text-black/50 dark:text-white/50">
                  Upload several photos of the product taken from different angles, turning it a little between each shot. Customers can then drag to spin through them on the product page. Skip this if you only have the one main photo.
                </p>
                {form.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {form.images.map((url) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-pulse-fog dark:bg-pulse-steel">
                        <Image src={url} alt="Angle photo" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAngleImage(url)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && e.target.files.length > 0 && handleAngleUpload(e.target.files)}
                  className="w-full text-sm"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured on homepage
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
                  In stock
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving' : form.id ? 'Update Product' : 'Add Product'}</button>
                {form.id && (<button type="button" onClick={() => setForm(emptyForm)} className="btn-outline">Cancel</button>)}
              </div>
            </form>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl font-bold">All Products ({products.length})</h2>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="card flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-pulse-fog dark:bg-pulse-steel">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">{p.category}, {p.price ? `$${p.price}` : 'No price set'}</p>
                  </div>
                  <button onClick={() => editProduct(p)} className="rounded-full border border-black/10 px-4 py-2 text-sm hover:border-pulse-red hover:text-pulse-red dark:border-white/15">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="rounded-full border border-black/10 px-4 py-2 text-sm hover:border-red-600 hover:text-red-600 dark:border-white/15">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
