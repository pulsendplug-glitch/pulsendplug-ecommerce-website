import { prisma } from '@/lib/prisma';
import { CountdownTimer } from '@/components/CountdownTimer';
import { BusinessPageClient } from './BusinessPageClient';

export const dynamic = 'force-dynamic';

export default async function BusinessPage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      {/* Hero with countdown */}
      <section className="relative overflow-hidden bg-pulse-black py-20 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-pulse-red/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-pulse-red/10 blur-3xl" />
        <div className="container-max section-pad relative text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-pulse-red">
            Limited Time Business Deal
          </p>
          <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Business Partner Discount
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
            Register your business today and unlock <span className="font-bold text-white">20% off</span> all
            equipment. This exclusive deal ends January 2nd, so do not miss it.
          </p>

          {/* Countdown */}
          <div className="mb-4 inline-block rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
              Deal Expires In
            </p>
            <CountdownTimer />
          </div>
          <p className="mt-4 text-sm text-white/40">Offer ends January 2nd, 2027</p>
        </div>
      </section>

      <BusinessPageClient products={products} />
    </>
  );
}
