import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RetailQuoteForm } from '@/components/RetailQuoteForm';
import { Product360Button } from '@/components/Product360Viewer';
import { ProductAddToCart } from '@/components/ProductAddToCart';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, NOT: { id: product.id } },
    take: 3,
  });

  return (
    <div className="section-pad py-16">
      <div className="container-max">
        <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 hover:text-pulse-red dark:text-white/60">
          ← Back to Shop
        </Link>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-pulse-fog dark:bg-pulse-steel">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-black/30 dark:text-white/30">
                  No image yet
                </div>
              )}
            </div>
            <div className="mt-4">
              <Product360Button imageUrl={product.imageUrl} images={product.images} productName={product.name} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">{product.category}</p>
            <h1 className="mb-4 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
            <p className="mb-6 font-display text-2xl font-bold">
              {product.price ? `$${product.price.toLocaleString()}` : 'Request Pricing'}
            </p>
            <p className="mb-8 text-black/70 dark:text-white/70">{product.description}</p>

            <div className="mb-8 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className="text-sm font-medium">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
            </div>

            <div className="mb-6">
              <ProductAddToCart
                productId={product.id}
                name={product.name}
                slug={product.slug}
                imageUrl={product.imageUrl}
                price={product.price}
                inStock={product.inStock}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-outline">Ask a Question Instead</Link>
              <Link href="/shop" className="btn-outline">Keep Browsing</Link>
            </div>
          </div>
        </div>

        <div className="mt-16 card p-8">
          <h2 className="mb-6 font-display text-2xl font-bold">Request a Quote for {product.name}</h2>
          <RetailQuoteForm productName={product.name} />
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-8 font-display text-2xl font-bold">More in {product.category}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="card overflow-hidden">
                  <div className="relative aspect-[4/3] w-full bg-pulse-fog dark:bg-pulse-steel">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {p.price ? `$${p.price.toLocaleString()}` : 'Request Pricing'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
