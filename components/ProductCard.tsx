import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  price: number | null;
  imageUrl: string | null;
  inStock: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="card group overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pulse-fog dark:bg-pulse-steel">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-black/30 dark:text-white/30">
            No image yet
          </div>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold uppercase text-white">
            Out of Stock
          </span>
        )}
        {product.imageUrl && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <ellipse cx="12" cy="12" rx="9" ry="4.5" />
            </svg>
            360
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pulse-red">{product.category}</p>
        <h3 className="mb-1 font-display text-lg font-semibold">{product.name}</h3>
        <p className="mb-3 text-sm text-black/60 dark:text-white/60">{product.shortDesc}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold">
            {product.price ? `$${product.price.toLocaleString()}` : 'Request Pricing'}
          </span>
          <span className="text-sm font-semibold text-pulse-red opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
