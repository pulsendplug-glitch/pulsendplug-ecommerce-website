'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fullscreen, gesture-scrubbed 360deg hero background.
 *
 * The video's `currentTime` is the single source of truth for "rotation" —
 * nothing here calls play()/pause() or touches playbackRate to fake motion.
 * Three input sources feed one target time, in priority order:
 *
 *   1. Active mouse/pen drag directly on the hero (desktop only — see note
 *      on touch below).
 *   2. Scroll position while the hero's extra "pin" runway is being
 *      scrolled through. This is driven by plain, native scrolling (mouse
 *      wheel OR touch-scroll) — we never call preventDefault on it, so it
 *      can never fight or trap the page's normal scroll.
 *   3. Idle ambient auto-rotate, only when neither of the above is active.
 *
 * Touch note: on a touchscreen, "drag" and "scroll" are the same physical
 * gesture. Capturing touch as a separate pointer-drag (with
 * preventDefault) would mean the very first swipe over a full-height hero
 * can never hand scrolling back to the page, trapping the user. So touch
 * input drives rotation exclusively through mechanism 2 (native scroll),
 * which already satisfies "drag downward rotates forward, drag upward
 * reverses" and releases naturally the moment the user scrolls past the
 * pin range. Mouse/pen get the extra instant click-drag scrub on top,
 * since a desktop click-drag is unambiguous and never scrolls the page.
 *
 * A single requestAnimationFrame loop reads whichever source is active and
 * writes `video.currentTime` at most once per frame, and is skipped
 * entirely once the hero is off-screen (IntersectionObserver).
 * `prefers-reduced-motion` disables scrubbing and auto-rotate entirely and
 * shows a static frame instead.
 */

const IDLE_ROTATION_SECONDS = 13; // one full lazy auto-rotate every ~13s when untouched

export function HeroTurntable({ children }: { children?: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null); // tall "pin runway" — provides the extra scroll distance
  const stickyRef = useRef<HTMLDivElement>(null); // the visible 100vh sticky layer
  const bgLayerRef = useRef<HTMLDivElement>(null); // decorative video layer only — drag listeners live here,
  // deliberately NOT on stickyRef, so clicks bubbling up from the headline/CTA
  // children (a sibling layer) never get mistaken for a drag-to-spin gesture.
  const videoRef = useRef<HTMLVideoElement>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false); // metadata loaded, duration known
  const [failed, setFailed] = useState(false); // video errored out — fall back to poster

  const duration = useRef(0);
  const inView = useRef(false);
  const rafId = useRef<number | null>(null);
  const rotationPx = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);

  // Mouse/pen drag state
  const dragging = useRef(false);
  const dragLastY = useRef(0);
  const dragSeconds = useRef(0);

  // Idle auto-rotate accumulator
  const idleSeconds = useRef(0);
  const lastFrameTime = useRef<number | null>(null);
  const lastWrittenTime = useRef(-1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    function onResize() {
      rotationPx.current = window.innerHeight;
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Track whether the hero is on screen at all, so the rAF loop (and idle
  // rotation) can fully stop once the user has scrolled well past it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { rootMargin: '200px 0px 200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function getPinRect() {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const runway = rect.height - window.innerHeight;
    if (runway <= 0) return null;
    return { top: rect.top, runway };
  }

  function scrollProgressSeconds(): number | null {
    const pin = getPinRect();
    if (!pin) return null;
    const scrolled = Math.min(Math.max(-pin.top, 0), pin.runway);
    return (scrolled / pin.runway) * duration.current;
  }

  function isWithinPinRange(): boolean {
    const pin = getPinRect();
    if (!pin) return false;
    return pin.top <= 0 && pin.top >= -pin.runway;
  }

  // Main scrub loop — one video.currentTime write per animation frame, at most.
  useEffect(() => {
    if (reducedMotion) return;

    function tick(now: number) {
      rafId.current = requestAnimationFrame(tick);

      const video = videoRef.current;
      if (!video || !ready || !inView.current) {
        lastFrameTime.current = null;
        return;
      }

      let target: number;

      if (dragging.current) {
        target = dragSeconds.current;
        idleSeconds.current = target;
        lastFrameTime.current = null;
      } else if (isWithinPinRange()) {
        const fromScroll = scrollProgressSeconds();
        target = fromScroll ?? video.currentTime;
        idleSeconds.current = target;
        lastFrameTime.current = null;
      } else {
        // Idle ambient auto-rotate — only while visible and untouched.
        const dt = lastFrameTime.current == null ? 0 : (now - lastFrameTime.current) / 1000;
        lastFrameTime.current = now;
        idleSeconds.current += dt * (duration.current / IDLE_ROTATION_SECONDS);
        const raw = ((idleSeconds.current % duration.current) + duration.current) % duration.current;

        // Ease idle rotation back toward frame 0 over the viewport-height of
        // scroll just before the pin range engages, so the handoff from
        // "idle auto-rotate" to "scroll-driven" is seamless instead of
        // snapping to wherever the idle loop happened to be.
        const wrap = wrapRef.current;
        const rectTop = wrap ? wrap.getBoundingClientRect().top : Infinity;
        const settle = Math.max(0, Math.min(1, rectTop / window.innerHeight));
        target = raw * settle;
      }

      if (Math.abs(target - lastWrittenTime.current) > 1 / 48) {
        video.currentTime = target;
        lastWrittenTime.current = target;
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion, ready]);

  // Desktop click-drag scrubbing (mouse/pen only — see note above on why
  // touch is deliberately excluded from this path).
  useEffect(() => {
    if (reducedMotion) return;
    const el = bgLayerRef.current;
    if (!el) return;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === 'touch' || !ready) return;
      dragging.current = true;
      dragLastY.current = e.clientY;
      dragSeconds.current = videoRef.current?.currentTime ?? 0;
      el?.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return;
      e.preventDefault();
      const deltaY = e.clientY - dragLastY.current; // drag down = positive = rotate forward
      dragLastY.current = e.clientY;
      const deltaSeconds = (deltaY / rotationPx.current) * duration.current;
      let next = dragSeconds.current + deltaSeconds;
      next = ((next % duration.current) + duration.current) % duration.current; // wrap seamlessly
      dragSeconds.current = next;
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return;
      dragging.current = false;
      try {
        el?.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove, { passive: false });
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [reducedMotion, ready]);

  const showStaticFrame = reducedMotion || failed || !ready;

  return (
    <div ref={wrapRef} className="relative" style={{ height: reducedMotion ? '100vh' : '200vh' }}>
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Decorative only — headline/CTA content is rendered by the parent, on top of this. */}
        <div
          ref={bgLayerRef}
          className="absolute inset-0"
          style={{ cursor: reducedMotion ? undefined : 'grab', touchAction: 'pan-y' }}
          aria-hidden="true"
        >
          {!failed && (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              style={{ opacity: showStaticFrame ? 0 : 1, transition: 'opacity 0.4s ease' }}
              muted
              playsInline
              preload="auto"
              poster="/images/massage-chair-turntable-poster.jpg"
              controls={false}
              disablePictureInPicture
              onLoadedMetadata={(e) => {
                duration.current = e.currentTarget.duration || 8;
                idleSeconds.current = 0;
                setReady(true);
              }}
              onError={() => setFailed(true)}
            >
              <source src="/videos/massage-chair-turntable.mp4" type="video/mp4" />
            </video>
          )}
          {/* Static fallback: shown until the video is ready, if it fails, or if the
              user prefers reduced motion. Same crop/position as the video so there's
              no layout shift when it swaps in. */}
          <img
            src="/images/massage-chair-turntable-poster.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: showStaticFrame ? 1 : 0, transition: 'opacity 0.4s ease' }}
          />
          {/* Readability overlay so headline/CTA text stays legible over the chair. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </div>

        {/* Real hero content sits above the decorative layer and stays pinned
            with it, so it never drifts out of sync with the background while
            scrubbing. */}
        <div className="relative z-10 flex h-full w-full items-center">{children}</div>
      </div>
    </div>
  );
}
