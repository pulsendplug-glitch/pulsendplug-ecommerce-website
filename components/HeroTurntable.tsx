'use client';

import { useEffect, useRef, useState } from 'react';

// How long one full idle auto-rotation loop takes, in seconds.
const IDLE_ROTATION_SECONDS = 13;
// How long the user must stop dragging before idle auto-rotate resumes.
const IDLE_RESUME_DELAY_MS = 1200;
// Drag sensitivity: pixels of vertical mouse drag needed for one full rotation.
const DRAG_PX_PER_ROTATION = 500;

/**
 * A bounded, self-contained 360deg product viewer — NOT a full-bleed
 * scroll-jacked hero background. It sits inside a normal-sized box next to
 * the hero copy (see app/page.tsx) and never changes the page's scroll
 * height, so there's no extra "dead scroll" runway before the next section.
 *
 * Rotation sources:
 *   - Idle ambient auto-rotate, always on by default.
 *   - Mouse/pen click-drag to manually spin (desktop). Touch is
 *     deliberately left to do nothing special here — this widget is a
 *     normal-height box now, not a full-viewport hijack, so there's no
 *     scroll-trap risk either way, but a custom touch-drag on a small
 *     photo-ish widget mostly just fights the user's attempt to scroll
 *     the page, so we skip it and let touch scroll normally.
 */
export function HeroTurntable({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>();
  const durationRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const idleTimeRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const inViewRef = useRef(true);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion: no auto-rotate, no drag, just a still frame.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pause the rAF loop when the widget scrolls out of view, to save performance.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    function onLoaded() {
      durationRef.current = video!.duration || 0;
      setReady(true);
    }
    function onError() {
      setFailed(true);
    }
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !ready || failed) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    function setScrubTime(t: number) {
      const duration = durationRef.current;
      if (!duration || !video) return;
      const wrapped = ((t % duration) + duration) % duration; // seamless wraparound
      video.currentTime = wrapped;
    }

    function markInteraction() {
      lastInteractionRef.current = performance.now();
    }

    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return; // touch: no custom capture, see note above
      draggingRef.current = true;
      dragStartYRef.current = e.clientY;
      dragStartTimeRef.current = video!.currentTime;
      markInteraction();
    }

    function handlePointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const deltaY = e.clientY - dragStartYRef.current;
      const deltaTime = (deltaY / DRAG_PX_PER_ROTATION) * durationRef.current;
      setScrubTime(dragStartTimeRef.current + deltaTime);
      markInteraction();
    }

    function handlePointerUp() {
      draggingRef.current = false;
      markInteraction();
    }

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Idle ambient auto-rotation, on its own rAF loop.
    let lastFrameTime = performance.now();
    function tick(now: number) {
      const dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      const sinceInteraction = now - lastInteractionRef.current;
      const idle = sinceInteraction > IDLE_RESUME_DELAY_MS;

      if (idle && inViewRef.current && !draggingRef.current) {
        idleTimeRef.current += dt;
        const rate = durationRef.current / IDLE_ROTATION_SECONDS;
        setScrubTime(idleTimeRef.current * rate);
      } else if (draggingRef.current) {
        // Keep the idle clock in sync with wherever dragging leaves off, so
        // auto-rotate resumes smoothly instead of snapping.
        idleTimeRef.current = (video!.currentTime / durationRef.current) * IDLE_ROTATION_SECONDS;
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, failed, reducedMotion]);

  const showStatic = reducedMotion || failed;

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Ambient red glow behind the chair for a bolder, more dramatic presentation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{ background: 'radial-gradient(60% 60% at 55% 60%, rgba(225,29,46,0.45), transparent 70%)' }}
      />

      <div className="relative aspect-[4/5] w-full cursor-grab overflow-visible active:cursor-grabbing sm:aspect-[5/6]">
        {!showStatic && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              filter: 'contrast(1.18) saturate(1.35) brightness(1.06) drop-shadow(0 35px 45px rgba(0,0,0,0.55))',
            }}
          >
            <source src="/videos/chair-turntable.mp4" type="video/mp4" />
          </video>
        )}
        {showStatic && (
          <img
            src="/videos/chair-poster.jpg"
            alt="Pulse & Plug massage chair"
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              filter: 'contrast(1.18) saturate(1.35) brightness(1.06) drop-shadow(0 35px 45px rgba(0,0,0,0.55))',
            }}
          />
        )}
      </div>
    </div>
  );
}
