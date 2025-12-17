'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface NotifySubscribersButtonProps {
  contentType: 'blog_posts' | 'articles' | 'products' | 'demos' | 'projects';
  slug: string;
  title: string;
  excerpt: string;
  published: boolean;
}

/**
 * SECURE NOTIFICATION BUTTON
 *
 * Allows admins to send email notifications when publishing content.
 * All email processing happens server-side with secure tokens.
 */
export default function NotifySubscribersButton({
  contentType,
  slug,
  title,
  excerpt,
  published,
}: NotifySubscribersButtonProps) {
  const [isNotifying, setIsNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  const handleNotify = async () => {
    if (!published) {
      alert('Content must be published before notifying subscribers');
      return;
    }

    const confirmed = confirm(
      `Send email notification to all subscribers about this ${contentType.replace('_', ' ')}?\n\n"${title}"`
    );

    if (!confirmed) return;

    setIsNotifying(true);

    try {
      const response = await fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          slug,
          title,
          excerpt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Success! Notifications sent to ${data.sent} subscribers${data.failed > 0 ? ` (${data.failed} failed)` : ''}`
        );
        setNotified(true);
      } else {
        alert(`Failed to send notifications: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to send notifications. Please try again.');
    } finally {
      setIsNotifying(false);
    }
  };

  if (!published) {
    return (
      <Button variant="secondary" size="sm" disabled>
        📧 Notify (Publish First)
      </Button>
    );
  }

  return (
    <Button
      variant={notified ? 'secondary' : 'primary'}
      size="sm"
      onClick={handleNotify}
      disabled={isNotifying || notified}
    >
      {isNotifying ? '📧 Sending...' : notified ? '✅ Notified' : '📧 Notify Subscribers'}
    </Button>
  );
}
