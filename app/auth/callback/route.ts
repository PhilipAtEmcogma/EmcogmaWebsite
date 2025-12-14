import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logSecureUrl } from '@/lib/security/logger';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/admin';

  // Secure logging - redacts OAuth code and other sensitive params
  logSecureUrl('OAuth callback', requestUrl.toString());

  if (process.env.NODE_ENV === 'development') {
    console.log('Code present:', !!code);
    if (error_description) {
      console.log('Error description:', error_description);
    }
  }

  // Handle errors from OAuth provider
  if (error_description) {
    // Only log in development to avoid exposing error details in production logs
    if (process.env.NODE_ENV === 'development') {
      console.error('OAuth error:', error_description);
    }
    return NextResponse.redirect(
      new URL('/admin/login?error=auth_failed', request.url)
    );
  }

  // Handle PKCE flow (code exchange)
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(
            cookiesToSet: Array<{
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }>
          ) {
            cookiesToSet.forEach(
              ({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
                cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success - redirect to intended destination
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Log the error for debugging (development only to avoid leaking auth details)
    if (process.env.NODE_ENV === 'development') {
      console.error('OAuth callback error:', error);
    }
  }

  // For implicit flow (tokens in hash), redirect to a client-side handler
  // The client-side code will extract tokens from the URL hash
  const response = NextResponse.redirect(new URL(next, request.url));

  // Add a flag to indicate this came from OAuth callback
  response.cookies.set('oauth_callback', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60, // 1 minute - just enough for the redirect
  });

  return response;
}
