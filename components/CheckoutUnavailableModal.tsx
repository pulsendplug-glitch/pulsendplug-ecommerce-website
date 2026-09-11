'use client';

import { useRouter } from 'next/navigation';

export function CheckoutUnavailableModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-pulse-charcoal"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pulse-red/10 text-pulse-red">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="mb-2 text-center font-display text-xl font-bold">
          Online Checkout Is Temporarily Unavailable
        </h2>
        <p className="mb-2 text-center text-sm text-black/70 dark:text-white/70">
          Thank you for choosing Pulse &amp; Plug. Our online payment checkout is currently being finalized.
          You can still place your order by submitting a quick quote request.
        </p>
        <p className="mb-6 text-center text-sm text-black/70 dark:text-white/70">
          Your cart and selected products will automatically be included in your request, so you won&apos;t need to enter your products again.
        </p>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => router.push('/request-quote')} className="btn-primary w-full">
            Continue to Request a Quote
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-black/10 py-3.5 text-sm font-semibold uppercase tracking-wide hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            Close &amp; Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
