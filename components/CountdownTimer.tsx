'use client';

import { useEffect, useState } from 'react';

function getTimeLeft() {
  const target = new Date('2027-01-02T00:00:00');
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Pad({ n }: { n: number }) {
  return <>{String(n).padStart(2, '0')}</>;
}

export function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Mins', value: time.minutes },
    { label: 'Secs', value: time.seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-display text-sm font-bold text-white">
        {units.map((u, i) => (
          <span key={u.label} className="flex items-center gap-1.5">
            <Pad n={u.value} />
            <span className="text-[10px] font-medium uppercase text-white/70">{u.label.slice(0, 1)}</span>
            {i < 3 && <span className="text-white/50">:</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-6">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3 md:gap-6">
          <div className="text-center">
            <div className="font-display text-4xl font-bold leading-none text-white md:text-6xl">
              <Pad n={u.value} />
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
              {u.label}
            </div>
          </div>
          {i < 3 && (
            <div className="font-display text-3xl font-bold text-pulse-red md:text-5xl">:</div>
          )}
        </div>
      ))}
    </div>
  );
}
