'use client';

import { useEffect, useRef, useState } from 'react';

type Phase = 'checking' | 'newsletter' | 'heartbeat' | 'cookies' | 'done';

function playHeartbeat(ctx: AudioContext) {
  const now = ctx.currentTime;

  function thump(time: number, freq: number, duration: number, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + duration);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  // Two beats ("lub-dub"), repeated a few times, mimicking a real heartbeat rhythm
  for (let i = 0; i < 3; i++) {
    const base = now + i * 0.85;
    thump(base, 90, 0.15, 0.5); // lub (lower, longer)
    thump(base + 0.18, 65, 0.12, 0.35); // dub (softer, quicker)
  }
}

export function SiteGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [form, setForm] = useState({ email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const subscribed = localStorage.getItem('pp_subscribed');
    const cookieChoice = localStorage.getItem('pp_cookie_consent');
    const introShown = sessionStorage.getItem('pp_intro_shown');

    if (!subscribed) {
      setPhase('newsletter');
    } else if (!introShown) {
      setPhase('heartbeat');
    } else if (!cookieChoice) {
      setPhase('cookies');
    } else {
      setPhase('done');
    }
  }, []);

  useEffect(() => {
    if (phase !== 'heartbeat') return;

    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        playHeartbeat(audioCtxRef.current);
      } catch {
        // Audio is a nice-to-have; if it fails, the visual animation still runs fine.
      }
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('pp_intro_shown', '1');
      const cookieChoice = localStorage.getItem('pp_cookie_consent');
      setPhase(cookieChoice ? 'done' : 'cookies');
    }, 2600);
    return () => clearTimeout(timer);
  }, [phase]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Create the AudioContext now, while we're still inside a real user click,
    // so the browser allows sound to play a moment later during the heartbeat phase.
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    } catch {
      audioCtxRef.current = null;
    }

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      localStorage.setItem('pp_subscribed', '1');
      const introShown = sessionStorage.getItem('pp_intro_shown');
      setPhase(introShown ? (localStorage.getItem('pp_cookie_consent') ? 'done' : 'cookies') : 'heartbeat');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCookieChoice(choice: 'accepted' | 'declined') {
    localStorage.setItem('pp_cookie_consent', choice);
    setPhase('done');
  }

  if (phase === 'checking') {
    return <div className="min-h-screen bg-pulse-black" />;
  }

  if (phase === 'newsletter') {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-pulse-black p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-pulse-charcoal p-8 text-white">
          <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pulse-red">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-7 4 14 2-7h6" />
              </svg>
            </span>
            Pulse<span className="text-pulse-red">&amp;</span>Plug
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold">Join Our Newsletter</h2>
          <p className="mb-6 text-sm text-white/60">
            Enter your email and phone number to get updates on new equipment and offers before you continue.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-pulse-red"
            />
            <input
              type="tel"
              required
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-pulse-red"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting' : 'Continue to Site'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'heartbeat') {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-pulse-black">
        <svg viewBox="0 0 100 90" className="w-32 md:w-40" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 82 C20 60, 4 40, 4 24 C4 8, 18 0, 30 0 C40 0, 47 6, 50 14 C53 6, 60 0, 70 0 C82 0, 96 8, 96 24 C96 40, 80 60, 50 82 Z"
            fill="#e11d2e"
            className="heart-beat"
          />
        </svg>
        <p className="mt-8 font-display text-xl font-bold tracking-widest text-white">
          PULSE<span className="text-pulse-red">&amp;</span>PLUG
        </p>
        <style>{`
          .heart-beat {
            transform-origin: center;
            animation: heartbeat-rhythm 0.85s ease-in-out infinite;
            filter: drop-shadow(0 0 14px rgba(225, 29, 46, 0.55));
          }
          @keyframes heartbeat-rhythm {
            0%   { transform: scale(1); }
            14%  { transform: scale(1.18); }
            28%  { transform: scale(0.96); }
            42%  { transform: scale(1.1); }
            60%  { transform: scale(1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (phase === 'cookies') {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-pulse-charcoal">
          <h2 className="mb-3 font-display text-xl font-bold">Cookie Notice</h2>
          <p className="mb-6 text-sm text-black/70 dark:text-white/70">
            We use cookies to improve your experience on this site. Please choose an option to continue.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleCookieChoice('declined')}
              className="flex-1 rounded-full border border-black/15 py-3 text-sm font-medium dark:border-white/20"
            >
              Decline
            </button>
            <button
              onClick={() => handleCookieChoice('accepted')}
              className="flex-1 rounded-full bg-pulse-red py-3 text-sm font-semibold text-white"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
