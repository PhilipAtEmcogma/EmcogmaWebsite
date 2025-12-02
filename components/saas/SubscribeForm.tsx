'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Implement actual subscription logic with Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));

    setStatus('success');
    setEmail('');

    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <section className="section-container">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyber-primary/10 via-cyber-secondary/10 to-cyber-accent/10 border border-cyber-primary/30 p-12">
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">
            <span className="neon-text">Stay Updated</span>
          </h2>
          <p className="text-foreground/80 mb-8">
            Subscribe to our newsletter for the latest updates, features, and exclusive beta access.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow input-cyber"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-cyber disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-cyber-accent font-mono">
              ✓ Successfully subscribed! Check your email.
            </p>
          )}

          {status === 'error' && (
            <p className="mt-4 text-red-400 font-mono">
              ✗ Something went wrong. Please try again.
            </p>
          )}

          <p className="mt-4 text-sm text-foreground/60">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
