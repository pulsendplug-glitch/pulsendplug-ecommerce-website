import { CursorGlow } from '@/components/CursorGlow';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SiteGate } from '@/components/SiteGate';
import { HelpWidget } from '@/components/HelpWidget';
import { CartProvider } from '@/components/CartContext';

// Everything customer-facing lives here: the header, footer, cart, the
// newsletter/heartbeat/cookie entry gate, and the help widget. This layout
// only wraps the (site) route group, so /admin never sees any of it.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteGate>
        <CursorGlow />
        <Header />
        <main>{children}</main>
        <Footer />
        <HelpWidget />
      </SiteGate>
    </CartProvider>
  );
}
