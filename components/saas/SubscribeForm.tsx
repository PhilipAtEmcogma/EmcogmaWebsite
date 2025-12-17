'use client';

import { useState } from 'react';
import ReCaptchaWrapper from '@/components/contact/ReCaptchaWrapper';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          action: 'subscribe',
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setRecaptchaToken(null);
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const isFormValid = email && recaptchaToken;

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
                disabled={!isFormValid || status === 'loading'}
                className={`btn-cyber whitespace-nowrap ${
                  isFormValid && status !== 'loading'
                    ? ''
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>

            <div className="flex justify-center">
              <ReCaptchaWrapper
                onVerify={handleRecaptchaChange}
                resetTrigger={status === 'success'}
              />
            </div>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-cyber-accent font-mono">
              ✓ Successfully subscribed! Check your email.
            </p>
          )}

          {status === 'error' && (
            <p className="mt-4 text-red-400 font-mono">
              ✗ {errorMessage || 'Something went wrong. Please try again.'}
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
