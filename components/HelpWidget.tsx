'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const BUTTON_SIZE = 56;
const EDGE_MARGIN = 16;

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi, I'm here to help you find your way around Pulse & Plug. Ask me anything, like where to find products, how business pricing works, or how to request a quote." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const draggedRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth - BUTTON_SIZE - EDGE_MARGIN, y: window.innerHeight - BUTTON_SIZE - EDGE_MARGIN });
    function clampOnResize() {
      setPos((prev) => {
        if (!prev) return prev;
        const maxX = window.innerWidth - BUTTON_SIZE - 8;
        const maxY = window.innerHeight - BUTTON_SIZE - 8;
        return { x: Math.min(Math.max(prev.x, 8), maxX), y: Math.min(Math.max(prev.y, 8), maxY) };
      });
    }
    window.addEventListener('resize', clampOnResize);
    return () => window.removeEventListener('resize', clampOnResize);
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggedRef.current = false;
    dragStartRef.current = { pointerX: e.clientX, pointerY: e.clientY, originX: pos.x, originY: pos.y };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) draggedRef.current = true;
    const maxX = window.innerWidth - BUTTON_SIZE - 8;
    const maxY = window.innerHeight - BUTTON_SIZE - 8;
    setPos({
      x: Math.min(Math.max(dragStartRef.current.originX + dx, 8), maxX),
      y: Math.min(Math.max(dragStartRef.current.originY + dy, 8), maxY),
    });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function handleToggleClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    setOpen((v) => !v);
  }

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
    <div
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6"
      style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
    >
      {open && (
        <div className="mb-4 flex h-[28rem] max-h-[70vh] w-[calc(100vw-2rem)] max-w-80 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-pulse-charcoal">
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleToggleClick}
        className={`flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-white/30 bg-pulse-red/25 text-white backdrop-blur-md transition-transform cursor-grab active:cursor-grabbing ${
          dragging ? 'scale-105 shadow-[0_22px_45px_rgba(0,0,0,0.45)]' : 'shadow-lg hover:scale-105'
        }`}
        aria-label="Open site helper"
      >
        <span className="text-2xl font-bold leading-none">?</span>
      </button>
    </div>
  );
}
