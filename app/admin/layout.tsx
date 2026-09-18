import Link from 'next/link';
import Image from 'next/image';

// Admin gets its own shell: no customer header, footer, cart, newsletter
// gate, or help widget. Just a plain top bar identifying this as the staff
// side of the site, and a link back out to the storefront.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pulse-black text-white">
      <header className="border-b border-white/10">
        <div className="container-max section-pad flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold">
            <span className="relative h-7 w-7 flex-shrink-0">
              <Image src="/logo-mark.png" alt="Pulse & Plug logo" fill className="object-contain" />
            </span>
            Pulse &amp; Plug Admin
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            View Site
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
