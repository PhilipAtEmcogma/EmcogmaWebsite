import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/email/tokens';
import { z } from 'zod';

/**
 * SECURE UNSUBSCRIBE ENDPOINT
 *
 * Handles unsubscribe requests via secure tokens.
 * NO email addresses in URLs or logs.
 *
 * Token contains subscriber ID only, verified via HMAC signature.
 */

const unsubscribeSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = unsubscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { token } = validation.data;

    // SECURE: Verify token and extract subscriber ID
    const subscriberId = verifyUnsubscribeToken(token);

    if (!subscriberId) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update subscriber status
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ subscribed: false })
      .eq('id', subscriberId);

    if (updateError) {
      // SECURE: Generic error log
      console.error('Unsubscribe failed');
      return NextResponse.json(
        { error: 'Failed to unsubscribe. Please try again.' },
        { status: 500 }
      );
    }

    // SECURE: Log success without subscriber details
    console.log('Subscriber unsubscribed successfully');

    return NextResponse.json({
      message: 'Successfully unsubscribed from all future updates',
    });
  } catch (error) {
    // SECURE: Generic error log
    console.error('Unsubscribe request failed');
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
