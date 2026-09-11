'use client';

import Image from 'next/image';
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
  const [reducedMotion, setReducedMotion] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
    }, reducedMotion ? 900 : 2600);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

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
            <span className="relative h-10 w-10 flex-shrink-0">
              <Image src="/logo-mark.png" alt="Pulse & Plug logo" fill className="object-contain" />
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
            {error && <p className="text-sm text-blue-400">{error}</p>}
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
        <div className="relative h-10 w-11 flex-shrink-0 md:h-14 md:w-14">
          <Image src="/logo-mark.png" alt="Pulse & Plug logo" fill className="object-contain" priority />
        </div>

        <div className="ecg-window mt-6 w-[85vw] max-w-md overflow-hidden">
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className={`h-16 md:h-20 ${reducedMotion ? 'w-full' : 'ecg-trace w-[200%]'}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={
                reducedMotion
                  ? 'M0,50 L70,50 Q80,50 85,38 Q90,26 95,38 Q100,50 110,50 L150,50 L162,50 L170,20 L178,4 L186,55 L192,88 L200,50 L300,50 L370,50 Q380,50 385,38 Q390,26 395,38 Q400,50 410,50 L450,50 L462,50 L470,20 L478,4 L486,55 L492,88 L500,50 L600,50 L670,50 Q680,50 685,38 Q690,26 695,38 Q700,50 710,50 L750,50 L762,50 L770,20 L778,4 L786,55 L792,88 L800,50 L900,50 L970,50 Q980,50 985,38 Q990,26 995,38 Q1000,50 1010,50 L1050,50 L1062,50 L1070,20 L1078,4 L1086,55 L1092,88 L1100,50 L1200,50'
                  : 'M0,50 L70,50 Q80,50 85,38 Q90,26 95,38 Q100,50 110,50 L150,50 L162,50 L170,20 L178,4 L186,55 L192,88 L200,50 L300,50 L370,50 Q380,50 385,38 Q390,26 395,38 Q400,50 410,50 L450,50 L462,50 L470,20 L478,4 L486,55 L492,88 L500,50 L600,50 L670,50 Q680,50 685,38 Q690,26 695,38 Q700,50 710,50 L750,50 L762,50 L770,20 L778,4 L786,55 L792,88 L800,50 L900,50 L970,50 Q980,50 985,38 Q990,26 995,38 Q1000,50 1010,50 L1050,50 L1062,50 L1070,20 L1078,4 L1086,55 L1092,88 L1100,50 L1200,50 L1270,50 Q1280,50 1285,38 Q1290,26 1295,38 Q1300,50 1310,50 L1350,50 L1362,50 L1370,20 L1378,4 L1386,55 L1392,88 L1400,50 L1500,50 L1570,50 Q1580,50 1585,38 Q1590,26 1595,38 Q1600,50 1610,50 L1650,50 L1662,50 L1670,20 L1678,4 L1686,55 L1692,88 L1700,50 L1800,50 L1870,50 Q1880,50 1885,38 Q1890,26 1895,38 Q1900,50 1910,50 L1950,50 L1962,50 L1970,20 L1978,4 L1986,55 L1992,88 L2000,50 L2100,50 L2170,50 Q2180,50 2185,38 Q2190,26 2195,38 Q2200,50 2210,50 L2250,50 L2262,50 L2270,20 L2278,4 L2286,55 L2292,88 L2300,50 L2400,50'
              }
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="mt-6 font-display text-xl font-bold tracking-widest text-white">
          PULSE<span className="text-pulse-red">&amp;</span>PLUG
        </p>
        <style>{`
          .ecg-window {
            -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
            mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
          }
          .ecg-trace {
            display: block;
            animation: ecg-scroll 3.2s linear infinite;
            filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.65));
          }
          @keyframes ecg-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ecg-trace { animation: none; }
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
