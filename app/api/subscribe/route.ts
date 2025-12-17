import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email/send';
import {
  performSecurityCheck,
  RATE_LIMITS,
  getRequestContext,
  SecurityLog,
} from '@/lib/security';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  action: z.enum(['subscribe', 'unsubscribe']).optional(),
  recaptchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Security check: Rate limiting for subscriptions
    const securityCheck = await performSecurityCheck(request, {
      rateLimit: RATE_LIMITS.api,
      validateBody: true,
      maxBodySize: 10 * 1024, // 10KB max
    });

    if (!securityCheck.passed) {
      return securityCheck.response!;
    }

    const body = await request.json();

    // Validate request body
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, action, recaptchaToken } = validation.data;

    // Require reCAPTCHA for subscribe action
    if (action === 'subscribe' || !action) {
      if (!recaptchaToken) {
        SecurityLog.invalidInput(context, 'recaptchaToken', 'Missing reCAPTCHA token');
        return NextResponse.json(
          { error: 'reCAPTCHA verification required' },
          { status: 400 }
        );
      }

      // Verify reCAPTCHA token with Google
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;

      if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

      const recaptchaResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      });

      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success) {
        SecurityLog.suspiciousRequest(context, 'reCAPTCHA verification failed for subscription');
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

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

      // Send welcome email for re-subscriptions (when user subscribes again)
      if (targetSubscribed) {
        sendWelcomeEmail(existing.id, email).catch(() => {
          console.error('Welcome email failed to send for re-subscription');
        });
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
