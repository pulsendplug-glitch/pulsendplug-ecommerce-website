import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CursorGlow } from '@/components/CursorGlow';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { HeartbeatIntro } from '@/components/HeartbeatIntro';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Pulse & Plug | Premium Wellness & Recovery Equipment',
  description:
    "Pulse & Plug supplies premium wellness, recovery, and studio equipment including massage chairs, infrared saunas, and cold plunge systems, helping fitness, wellness, and therapeutic businesses give their clients an experience worth remembering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-body`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <HeartbeatIntro />
          <CursorGlow />
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
