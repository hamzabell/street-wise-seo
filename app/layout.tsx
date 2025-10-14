import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'StreetWise SEO - AI-Powered Local SEO Content Ideas',
  description: 'Generate unlimited SEO-optimized topics for your local business. Powered by LemonFox AI. Start free with 5 topics monthly.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  };

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // Remove preloaded data to avoid PPR bailout during build time
              // Components will fetch data on mount instead
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
