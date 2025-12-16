'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. No token provided.');
      return;
    }

    handleUnsubscribe();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="section-container min-h-screen flex items-center justify-center">
      <div className="card-cyber max-w-2xl w-full p-12 text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-bold font-mono neon-text mb-4">
              Processing...
            </h1>
            <p className="text-foreground/70">
              Please wait while we process your unsubscribe request.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold font-mono neon-text-green mb-4">
              Successfully Unsubscribed
            </h1>
            <p className="text-foreground/70 mb-8">{message}</p>
            <p className="text-foreground/60 mb-6">
              You will no longer receive email notifications about new blog posts, articles, products, or demos.
            </p>
            <p className="text-foreground/60 mb-8">
              Changed your mind? You can always re-subscribe from the homepage.
            </p>
            <Link href="/" className="btn-cyber inline-block">
              Return to Homepage
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold font-mono text-cyber-secondary mb-4">
              Unsubscribe Failed
            </h1>
            <p className="text-foreground/70 mb-8">{message}</p>
            <p className="text-foreground/60 mb-8">
              This link may be invalid or expired. If you'd like to unsubscribe, please use the unsubscribe link from a recent email, or contact support.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/" className="btn-cyber">
                Return to Homepage
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 font-mono border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary transition-all duration-300"
              >
                Contact Support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
