'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [text, setText] = useState('');
  const fullText = 'Welcome to the future.';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 section-container text-center">
        <div className="max-w-4xl mx-auto">
          {/* Glitch effect title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-mono">
            <span className="neon-text block mb-2">EMCOGMA</span>
            <span className="gradient-text text-3xl md:text-5xl">
              {text}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Developer, innovator, and builder of cyberpunk dreams. Explore my products, read my thoughts, and witness the projects shaping tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/saas" className="btn-cyber">
              Explore Product
            </Link>
            <Link href="/portfolio" className="btn-cyber">
              View Projects
            </Link>
            <Link href="/blog" className="px-6 py-3 font-mono text-foreground/80 border-2 border-cyber-secondary/50 hover:border-cyber-secondary hover:text-cyber-secondary transition-all duration-300">
              Read Blog
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <svg
              className="w-6 h-6 mx-auto text-cyber-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
