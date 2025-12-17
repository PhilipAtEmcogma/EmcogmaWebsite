import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rateLimitDistributed';

const checkSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST endpoint to check subscription status (secure - no email in URL)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 checks per minute per IP
    const rateLimitResult = await checkRateLimit(request, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validation = checkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const supabase = await createClient();

    // SECURE: Query database without exposing email in logs
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('subscribed')
      .eq('email', email.toLowerCase())
      .single();

    // SECURE: Only return subscription status, never the email
    return NextResponse.json({
      subscribed: subscriber?.subscribed || false,
    });
  } catch (error) {
    // SECURE: Log error without exposing email address
    console.error('Subscription check failed');
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
