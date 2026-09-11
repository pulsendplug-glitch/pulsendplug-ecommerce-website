'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { CheckoutUnavailableModal } from '@/components/CheckoutUnavailableModal';

export default function CartPage() {
  const { items, updateQuantity, removeItem, itemCount, subtotal, hasUnpricedItems, isLoaded } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  return (
    <div className="section-pad py-16">
      <div className="container-max">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Your Order</p>
        <h1 className="mb-10 font-display text-4xl font-bold">Cart</h1>

        {!isLoaded ? (
          <p className="text-sm text-black/50 dark:text-white/50">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-16 text-center dark:border-white/15">
            <p className="mb-2 font-display text-xl font-semibold">Your cart is empty</p>
            <p className="mb-6 text-sm text-black/60 dark:text-white/60">
              Browse our equipment and add something to get started.
            </p>
            <Link href="/shop" className="btn-primary">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <Link href={`/shop/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-pulse-fog dark:bg-pulse-steel">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-black/30 dark:text-white/30">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="flex-1">
                    <Link href={`/shop/${item.slug}`} className="font-display font-semibold hover:text-pulse-red">
                      {item.name}
                    </Link>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {item.price !== null ? `$${item.price.toLocaleString()} each` : 'Request Pricing'}
                    </p>
                  </div>

                  <div className="flex items-center rounded-full border border-black/10 dark:border-white/15">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center text-lg font-semibold hover:text-pulse-red"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center text-lg font-semibold hover:text-pulse-red"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 text-right font-display font-semibold">
                    {item.price !== null ? `$${(item.price * item.quantity).toLocaleString()}` : '—'}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-sm font-medium text-black/40 hover:text-blue-600 dark:text-white/40"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-pulse-red hover:underline">
                ← Continue Shopping
              </Link>
            </div>

            <div className="card h-fit p-6">
              <h2 className="mb-4 font-display text-lg font-bold">Order Summary</h2>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-black/60 dark:text-white/60">Items</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="mb-6 flex justify-between text-sm">
                <span className="text-black/60 dark:text-white/60">Subtotal</span>
                <span className="font-display text-lg font-bold">${subtotal.toLocaleString()}</span>
              </div>
              {hasUnpricedItems && (
                <p className="mb-6 text-xs text-black/50 dark:text-white/40">
                  Some items in your cart require custom pricing and aren&apos;t included in the subtotal above.
                </p>
              )}
              <button type="button" onClick={() => setShowCheckoutModal(true)} className="btn-primary w-full">
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-black/40 dark:text-white/40">
                You won&apos;t be charged yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {showCheckoutModal && <CheckoutUnavailableModal onClose={() => setShowCheckoutModal(false)} />}
    </div>
  );
}
