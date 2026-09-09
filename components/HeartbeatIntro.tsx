'use client';

import { useEffect, useState } from 'react';

export function HeartbeatIntro() {
  const [phase, setPhase] = useState<'beat' | 'fadeout' | 'done'>('beat');

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem('pp_intro_shown')) {
      setPhase('done');
      return;
    }
    // Beat for 2.2s then fade out
    const t1 = setTimeout(() => setPhase('fadeout'), 2200);
    const t2 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('pp_intro_shown', '1');
    }, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-pulse-black transition-opacity duration-700 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <svg viewBox="0 0 200 80" className="w-64 md:w-80" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="0,40 30,40 40,10 50,70 60,25 70,55 80,40 110,40 120,5 130,75 140,20 150,60 160,40 200,40"
          fill="none"
          stroke="#e11d2e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="heartbeat-line"
        />
      </svg>
      <p className="mt-6 font-display text-xl font-bold tracking-widest text-white">
        PULSE<span className="text-pulse-red">&</span>PLUG
      </p>
      <style>{`
        .heartbeat-line {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: draw 1.8s ease forwards, pulse-glow 1.8s ease forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 0px #e11d2e); }
          50% { filter: drop-shadow(0 0 12px #e11d2e); }
          100% { filter: drop-shadow(0 0 4px #e11d2e); }
        }
      `}</style>
    </div>
  );
}
