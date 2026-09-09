import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

const categories = [
  'Recovery Chairs',
  'Saunas',
  'Cold Plunge',
  'Pilates & Studio',
  'Clinical & Rehab',
  'Recovery Tools',
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeCategory = searchParams.category;

  const products = await prisma.product.findMany({
    where: activeCategory ? { category: activeCategory } : {},
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <section className="border-b border-black/5 bg-pulse-fog py-16 dark:border-white/10 dark:bg-pulse-charcoal">
        <div className="container-max section-pad">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Catalog</p>
          <h1 className="font-display text-4xl font-bold">Shop Recovery &amp; Studio Equipment</h1>
        </div>
      </section>

      <section className="section-pad py-16">
        <div className="container-max grid gap-10 md:grid-cols-[240px_1fr]">
          <aside>
            <h3 className="mb-4 font-display text-lg font-semibold">Category</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    !activeCategory ? 'bg-pulse-red text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  All Equipment
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeCategory === cat ? 'bg-pulse-red text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 p-16 text-center dark:border-white/15">
                <p className="mb-2 font-display text-xl font-semibold">No products yet</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Add your first product from the <Link href="/admin" className="text-pulse-red underline">admin panel</Link>.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
