import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendContentNotification } from '@/lib/email/send';
import { z } from 'zod';

/**
 * SECURE NOTIFICATION ENDPOINT
 *
 * Triggers email notifications to all subscribers when new content is published.
 * Protected by admin authentication.
 *
 * Security features:
 * - Admin-only access (verified via Supabase session)
 * - No email addresses in logs or responses
 * - Secure token-based unsubscribe links
 * - Rate limiting on email sending
 */

const notificationSchema = z.object({
  contentType: z.enum(['blog_posts', 'articles', 'products', 'demos', 'projects']),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // SECURITY: Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY: Verify user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('active')
      .eq('email', user.email?.toLowerCase())
      .eq('active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validation = notificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { contentType, slug, title, excerpt } = validation.data;

    // Send notifications to all subscribers
    console.log(`Sending notifications for new ${contentType}: ${title}`);

    const result = await sendContentNotification({
      contentType,
      slug,
      title,
      excerpt,
    });

    return NextResponse.json({
      message: 'Notifications sent successfully',
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    // SECURE: Generic error log
    console.error('Notification send failed');
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
