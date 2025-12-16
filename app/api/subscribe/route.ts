import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email/send';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  action: z.enum(['subscribe', 'unsubscribe']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, action } = validation.data;
    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, subscribed')
      .eq('email', email.toLowerCase())
      .single();

    // Determine target state based on action or current state
    let targetSubscribed: boolean;
    if (action === 'subscribe') {
      targetSubscribed = true;
    } else if (action === 'unsubscribe') {
      targetSubscribed = false;
    } else {
      // Toggle: if subscribed, unsubscribe; if not subscribed, subscribe
      targetSubscribed = existing ? !existing.subscribed : true;
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ subscribed: targetSubscribed })
        .eq('email', email.toLowerCase());

      if (updateError) {
        // SECURE: Log error without exposing email
        console.error('Failed to update subscription status');
        return NextResponse.json(
          { error: 'Failed to update subscription. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: targetSubscribed ? 'Successfully subscribed!' : 'Successfully unsubscribed!',
        subscribed: targetSubscribed,
      });
    }

    // Insert new subscriber (only if subscribing)
    if (!targetSubscribed) {
      return NextResponse.json(
        { error: 'Email not found in subscribers list' },
        { status: 404 }
      );
    }

    const { data: newSubscriber, error: insertError } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase(),
        subscribed: true,
      })
      .select('id')
      .single();

    if (insertError || !newSubscriber) {
      // SECURE: Log error without exposing email
      console.error('Failed to insert new subscriber');
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // SECURE: Send welcome email with token-based unsubscribe link
    // Email sending happens in background, doesn't block response
    sendWelcomeEmail(newSubscriber.id, email).catch(() => {
      console.error('Welcome email failed to send');
    });

    return NextResponse.json({
      message: 'Successfully subscribed!',
      subscribed: true,
    });
  } catch (error) {
    // SECURE: Generic error log, no email exposure
    console.error('Subscription request failed');
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
