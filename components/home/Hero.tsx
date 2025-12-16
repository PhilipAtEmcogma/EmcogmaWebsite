'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function Hero() {
  const [text, setText] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();
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

  const checkSubscriptionStatus = async (emailToCheck: string) => {
    if (!emailToCheck) return;

    setIsCheckingStatus(true);
    try {
      // SECURE: Email sent in POST body, not URL - prevents exposure in logs/history
      const response = await fetch('/api/subscribe/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscribed);
      }
    } catch (error) {
      // SECURE: Don't log email address or error details
      console.error('Failed to check subscription status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Check subscription status when email changes
    if (newEmail.includes('@') && newEmail.includes('.')) {
      await checkSubscriptionStatus(newEmail);
    } else {
      setIsSubscribed(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const action = isSubscribed ? 'unsubscribe' : 'subscribe';
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        setEmail('');
        setIsSubscribed(false);
        setShowSubscribeModal(false);
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to process request. Please try again.', 'error');
      }
    } catch (error) {
      // SECURE: Generic error message, no details exposed
      showToast('Failed to process request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button
              onClick={() => setShowSubscribeModal(true)}
              className="px-6 py-3 font-mono border-2 border-cyber-accent/50 hover:border-cyber-accent text-cyber-accent hover:bg-cyber-accent hover:text-cyber-dark transition-all duration-300"
            >
              📧 Subscribe
            </button>
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

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card-cyber max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 text-foreground/60 hover:text-cyber-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold font-mono neon-text mb-4">
              {isSubscribed ? 'Unsubscribe from Updates' : 'Subscribe to Updates'}
            </h3>
            <p className="text-foreground/70 mb-6">
              {isSubscribed
                ? 'You will no longer receive news, articles, and project updates.'
                : 'Get the latest news, articles, and project updates delivered to your inbox.'}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label htmlFor="subscribe-email" className="block text-sm font-mono text-cyber-primary mb-2">
                  Email Address
                </label>
                <input
                  id="subscribe-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-cyber-darker border border-cyber-primary/30 rounded-lg text-white placeholder-foreground/40 focus:border-cyber-primary focus:outline-none focus:ring-2 focus:ring-cyber-primary/20 transition-all"
                />
                {isCheckingStatus && (
                  <p className="text-xs text-foreground/50 mt-1">Checking subscription status...</p>
                )}
                {isSubscribed && !isCheckingStatus && (
                  <p className="text-xs text-cyber-accent mt-1">✓ This email is currently subscribed</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 font-mono ${
                    isSubscribed
                      ? 'bg-cyber-secondary text-white hover:bg-cyber-secondary/90'
                      : 'bg-cyber-accent text-cyber-dark hover:bg-cyber-accent/90'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg`}
                >
                  {isSubmitting
                    ? isSubscribed
                      ? 'Unsubscribing...'
                      : 'Subscribing...'
                    : isSubscribed
                    ? 'Unsubscribe'
                    : 'Subscribe'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                  className="px-6 py-3 font-mono border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary transition-all duration-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
