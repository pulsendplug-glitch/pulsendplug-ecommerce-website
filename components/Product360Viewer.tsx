'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

type Props = {
  imageUrl: string | null;
  images?: string[];
  productName: string;
};

export function Product360Button({ imageUrl, images, productName }: Props) {
  const [open, setOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-pulse-red hover:text-pulse-red dark:border-white/15"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <ellipse cx="12" cy="12" rx="9" ry="4.5" />
          <path strokeLinecap="round" d="M3 12c0 1 1 2 2 2M19 10c1 0 2 1 2 2" />
        </svg>
        360 View
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close 360 view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <Product360Spin imageUrl={imageUrl} images={images} productName={productName} />
        </div>
      )}
    </>
  );
}

function Product360Spin({ imageUrl, images, productName }: Props) {
  const frames = images && images.length > 1 ? images : null;
  const [frameIndex, setFrameIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  function startDrag(x: number) {
    dragging.current = true;
    lastX.current = x;
  }

  function moveDrag(x: number) {
    if (!dragging.current) return;
    const delta = x - lastX.current;
    lastX.current = x;

    if (frames) {
      // Real multi-image 360: step through frames based on drag distance
      const step = Math.round(delta / 8);
      if (step !== 0) {
        setFrameIndex((prev) => {
          let next = (prev + step) % frames.length;
          if (next < 0) next += frames.length;
          return next;
        });
      }
    } else {
      // Single image fallback: simulate rotation with a 3D perspective tilt
      setRotation((prev) => Math.max(-35, Math.min(35, prev + delta * 0.3)));
    }
  }

  function endDrag() {
    dragging.current = false;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative aspect-square w-[80vw] max-w-md cursor-grab select-none overflow-hidden rounded-3xl bg-pulse-steel active:cursor-grabbing"
        style={{ perspective: frames ? undefined : '1000px' }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        <div
          className="relative h-full w-full"
          style={frames ? undefined : { transform: `rotateY(${rotation}deg)`, transition: dragging.current ? 'none' : 'transform 0.3s ease' }}
        >
          <Image
            src={frames ? frames[frameIndex] : imageUrl!}
            alt={productName}
            fill
            className="object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
      <p className="flex items-center gap-2 text-sm text-white/60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
        </svg>
        Drag left or right to rotate
      </p>
    </div>
  );
}
