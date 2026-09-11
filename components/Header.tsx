'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from './CartContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/business', label: 'Business' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-pulse-black/80">
      <div className="container-max section-pad flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-pulse-red hover:text-pulse-red dark:border-white/15 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 transition-transform duration-300">
              {open ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span className="relative h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10">
              <Image src="/logo-mark.png" alt="Pulse & Plug logo" fill className="object-contain" priority />
            </span>
            <span className="hidden sm:inline">
              Pulse<span className="text-pulse-red">&amp;</span>Plug
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-pulse-red ${
                link.href === '/business' ? 'font-bold text-pulse-red' : pathname === link.href ? 'text-pulse-red' : 'text-current'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-pulse-red hover:text-pulse-red dark:border-white/15"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.6 4h11.2M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-pulse-red px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/contact"
            aria-label="Request a Quote"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-pulse-red hover:text-pulse-red dark:border-white/15 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 8v-3.5A2.5 2.5 0 0 1 9.5 14H18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1Z" />
            </svg>
          </Link>
          <Link href="/contact" className="hidden btn-primary md:inline-flex">Request a Quote</Link>
          <ThemeToggle />
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-black/5 bg-white transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-pulse-black md:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                pathname === link.href ? 'bg-pulse-red/10 text-pulse-red' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {link.href === '/business' ? 'Business Portal' : link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cart {itemCount > 0 ? `(${itemCount})` : ''}
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
            Request a Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
