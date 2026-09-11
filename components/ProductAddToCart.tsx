'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';

type Props = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
  inStock: boolean;
};

export function ProductAddToCart({ productId, name, slug, imageUrl, price, inStock }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!inStock) return;
    addItem({ productId, name, slug, imageUrl, price }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center rounded-full border border-black/10 dark:border-white/15">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-lg font-semibold hover:text-pulse-red"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className="flex h-11 w-11 items-center justify-center text-lg font-semibold hover:text-pulse-red"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!inStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
      </button>

      {added && (
        <button type="button" onClick={() => router.push('/cart')} className="text-sm font-semibold text-pulse-red underline">
          View Cart
        </button>
      )}
    </div>
  );
}
