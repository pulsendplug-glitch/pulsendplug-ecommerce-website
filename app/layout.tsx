import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Pulse & Plug | Premium Wellness & Recovery Equipment',
  description:
    "Pulse & Plug supplies premium wellness, recovery, and studio equipment including massage chairs, infrared saunas, and cold plunge systems, helping fitness, wellness, and therapeutic businesses give their clients an experience worth remembering.",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
};

// This root layout only carries things that must apply everywhere, including
// the admin area: fonts and dark/light mode. Everything customer-facing
// (header, footer, cart, the newsletter/cookie gate, the help widget) lives
// in app/(site)/layout.tsx instead, so /admin never renders any of it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-body`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
