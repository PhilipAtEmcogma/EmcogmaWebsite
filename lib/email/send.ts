import { createClient } from '@/lib/supabase/server';
import { generateUnsubscribeUrl } from './tokens';
import { generateContentNotificationEmail, generateWelcomeEmail } from './templates';

/**
 * SECURE EMAIL SENDING SERVICE
 *
 * Uses Resend API for reliable email delivery.
 * Email addresses are NEVER logged or exposed in URLs.
 *
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Add domain and verify DNS records
 * 3. Generate API key
 * 4. Add RESEND_API_KEY to environment variables
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@emcogma.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://emcogma.com';

interface Subscriber {
  id: string;
  email: string;
  subscribed: boolean;
}

interface ContentNotification {
  contentType: 'blog_posts' | 'articles' | 'products' | 'demos' | 'projects';
  slug: string;
  title: string;
  excerpt: string;
}

/**
 * Send email via Resend API
 * SECURE: Email address only used in API call, never logged
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      // SECURE: Don't log email address
      console.error('Email send failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    // SECURE: Generic error log
    console.error('Email send error');
    return false;
  }
}

/**
 * Send notification to all active subscribers about new content
 * SECURE: Batch processing with secure unsubscribe tokens
 */
export async function sendContentNotification(
  notification: ContentNotification
): Promise<{ sent: number; failed: number }> {
  const supabase = await createClient();

  // Fetch all active subscribers
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('id, email, subscribed')
    .eq('subscribed', true);

  if (error || !subscribers || subscribers.length === 0) {
    console.log('No active subscribers found');
    return { sent: 0, failed: 0 };
  }

  const contentTypeLabels = {
    blog_posts: 'Blog Post',
    articles: 'Article',
    products: 'Product',
    demos: 'Demo',
    projects: 'Project',
  };

  let sent = 0;
  let failed = 0;

  // SECURE: Process emails in batches to avoid rate limiting
  for (const subscriber of subscribers) {
    // SECURE: Generate unique unsubscribe token for each subscriber
    const unsubscribeUrl = generateUnsubscribeUrl(subscriber.id, SITE_URL);

    const contentUrl = `${SITE_URL}/${notification.contentType.replace('_', '')}/${notification.slug}`;

    const emailContent = generateContentNotificationEmail({
      title: notification.title,
      excerpt: notification.excerpt,
      url: contentUrl,
      contentType: contentTypeLabels[notification.contentType],
      unsubscribeUrl,
    });

    // SECURE: Email address only used in API call, never logged
    const success = await sendEmail({
      to: subscriber.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Rate limiting: Wait 100ms between emails
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Email notification sent: ${sent} succeeded, ${failed} failed`);
  return { sent, failed };
}

/**
 * Send welcome email to new subscriber
 * SECURE: Uses token-based unsubscribe link
 */
export async function sendWelcomeEmail(subscriberId: string, email: string): Promise<boolean> {
  // SECURE: Generate unsubscribe token using subscriber ID
  const unsubscribeUrl = generateUnsubscribeUrl(subscriberId, SITE_URL);

  const emailContent = generateWelcomeEmail(unsubscribeUrl);

  return await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

/**
 * Test email configuration
 * Used for development/testing only
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  const dummyUnsubscribeUrl = `${SITE_URL}/unsubscribe?token=test`;

  const emailContent = generateWelcomeEmail(dummyUnsubscribeUrl);

  console.log('Testing email configuration...');
  const result = await sendEmail({
    to: testEmail,
    subject: '[TEST] ' + emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (result) {
    console.log('✅ Test email sent successfully');
  } else {
    console.error('❌ Test email failed');
  }

  return result;
}
