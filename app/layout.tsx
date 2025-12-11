import type { Metadata } from 'next';
import { Rajdhani, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Cyberpunk 2077 inspired fonts
const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Emcogma',
  description: 'Personal brand site showcasing SaaS products, blog posts, and portfolio projects with a cyberpunk aesthetic.',
  keywords: ['developer', 'blog', 'portfolio', 'SaaS', 'technology', 'cyberpunk'],
  authors: [{ name: 'Emcogma' }],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://emcogma.com',
    siteName: 'Emcogma',
    title: 'Emcogma',
    description: 'Personal brand site showcasing SaaS products, blog posts, and portfolio projects.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emcogma',
    description: 'Personal brand site showcasing SaaS products, blog posts, and portfolio projects.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${rajdhani.variable} ${shareTechMono.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <div className="cyber-grid-bg fixed inset-0 opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
