'use client';

import { useEffect, useRef, useState } from 'react';

// Full rotation of the chair is mapped to this much extra scroll distance
// (on top of the one screen-height the hero itself occupies).
const SCRUB_VH = 100;
// How long one full idle auto-rotation loop takes, in seconds.
const IDLE_ROTATION_SECONDS = 13;
// How long the user must stop interacting before idle auto-rotate resumes.
const IDLE_RESUME_DELAY_MS = 1200;
// Drag sensitivity: pixels of vertical mouse drag needed for one full rotation.
const DRAG_PX_PER_ROTATION = 600;

export function HeroTurntable({ children }: { children?: React.ReactNode }) {
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

  // Respect prefers-reduced-motion: no scrub, no auto-rotate, just a still frame.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pause everything when the hero scrolls out of view, to save performance.
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
    const container = containerRef.current;
    if (!video || !container) return;

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
      // Wrap around with modulo so the loop never jumps.
      const wrapped = ((t % duration) + duration) % duration;
      video.currentTime = wrapped;
    }

    function scrollProgress() {
      const rect = container!.getBoundingClientRect();
      const scrubDistance = (container!.offsetHeight - window.innerHeight);
      if (scrubDistance <= 0) return 0;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrubDistance);
      return scrolled / scrubDistance;
    }

    function markInteraction() {
      lastInteractionRef.current = performance.now();
    }

    function handleScroll() {
      if (draggingRef.current) return;
      markInteraction();
      const progress = scrollProgress();
      setScrubTime(progress * durationRef.current);
    }

    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return; // touch already handled by native page scroll
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
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Idle ambient auto-rotation, running on its own rAF loop.
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
      } else {
        // Keep idle clock roughly in sync with wherever scrubbing left off,
        // so auto-rotate resumes smoothly rather than snapping.
        idleTimeRef.current = (video!.currentTime / durationRef.current) * IDLE_ROTATION_SECONDS;
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    // Set the initial frame right away.
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, failed, reducedMotion]);

  const showStatic = reducedMotion || failed;

  return (
    <div ref={containerRef} className="relative" style={{ height: `calc(100vh + ${SCRUB_VH}vh)` }}>
      <div className="sticky top-0 h-screen w-full cursor-grab overflow-hidden bg-pulse-black active:cursor-grabbing">
        {!showStatic && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/chair-turntable.mp4" type="video/mp4" />
          </video>
        )}
        {showStatic && (
          <img
            src="/videos/chair-poster.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Readability overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.6))' }}
        />

        {/* Hero content, always on top of the video layer */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
