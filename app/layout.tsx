import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Emcogma - Cyberpunk Innovation',
  description: 'Personal brand site showcasing SaaS products, blog posts, and portfolio projects with a cyberpunk aesthetic.',
  keywords: ['developer', 'blog', 'portfolio', 'SaaS', 'technology', 'cyberpunk'],
  authors: [{ name: 'Emcogma' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://emcogma.com',
    siteName: 'Emcogma',
    title: 'Emcogma - Cyberpunk Innovation',
    description: 'Personal brand site showcasing SaaS products, blog posts, and portfolio projects.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emcogma - Cyberpunk Innovation',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
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
