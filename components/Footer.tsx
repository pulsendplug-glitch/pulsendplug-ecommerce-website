import Link from 'next/link';
import { NewsletterForm } from './NewsletterForm';
export function Footer() {
  return (
    <footer className="bg-pulse-black text-white">
      <div className="container-max section-pad grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pulse-red"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-7 4 14 2-7h6" /></svg></span>
            Pulse&amp;Plug
          </div>
          <p className="text-sm text-white/60">Premium wellness and recovery equipment that helps studios, clinics, and gyms give their clients an experience worth coming back for.</p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Company</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-pulse-red">About Us</Link></li>
            <li><Link href="/shop" className="hover:text-pulse-red">Shop Equipment</Link></li>
            <li><Link href="/business" className="hover:text-pulse-red">Business Portal</Link></li>
            <li><Link href="/contact" className="hover:text-pulse-red">Request a Quote</Link></li>
            <li><Link href="/admin" className="hover:text-pulse-red">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Categories</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li><Link href="/shop?category=Recovery%20Chairs" className="hover:text-pulse-red">Recovery Chairs</Link></li>
            <li><Link href="/shop?category=Saunas" className="hover:text-pulse-red">Infrared Saunas</Link></li>
            <li><Link href="/shop?category=Cold%20Plunge" className="hover:text-pulse-red">Cold Plunge</Link></li>
            <li><Link href="/shop?category=Pilates%20%26%20Studio" className="hover:text-pulse-red">Pilates &amp; Studio</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Newsletter</h4>
          <p className="mb-4 text-sm text-white/70">Get updates on new equipment and offers.</p>
          <NewsletterForm dark />
          <ul className="mt-6 space-y-2 text-sm text-white/60">
            <li>pulsendplug@gmail.com</li>
            <li>+1 786 406 6937</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="container-max section-pad text-xs text-white/40">Copyright {new Date().getFullYear()} Pulse &amp; Plug. All rights reserved.</p>
      </div>
    </footer>
  );
}
