'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi, I'm here to help you find your way around Pulse & Plug. Ask me anything, like where to find products, how business pricing works, or how to request a quote." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages([...next, { role: 'assistant', content: 'Sorry, I could not respond right now. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex h-[28rem] w-80 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-pulse-charcoal">
          <div className="flex items-center justify-between border-b border-black/5 p-4 dark:border-white/10">
            <p className="font-display font-semibold">Site Helper</p>
            <button onClick={() => setOpen(false)} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-pulse-red text-white' : 'bg-pulse-fog dark:bg-pulse-steel'}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl bg-pulse-fog px-4 py-2 text-sm dark:bg-pulse-steel">Typing</div>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-black/5 p-3 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question"
              className="flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm outline-none focus:border-pulse-red dark:border-white/15"
            />
            <button type="submit" disabled={loading} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pulse-red text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-pulse-red text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Open site helper"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 15.5a3.5 3.5 0 1 1 3.5 -3.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </button>
    </div>
  );
}
