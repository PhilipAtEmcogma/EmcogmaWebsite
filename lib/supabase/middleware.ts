import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSecurityHeaders, getApiSecurityHeaders } from '@/lib/security/headers';
import { generateNonce } from '@/lib/security/csp';
import { getClientIP } from './ip';
import {
  validateSessionTimeout,
  validateSessionIP,
  updateSessionCookies,
  cleanupOAuthCallback,
  authorizeAdminRoute,
} from '@/lib/session';

export async function updateSession(request: NextRequest) {
  // Normalize URLs by removing trailing slashes (except root)
  // This ensures consistent route matching and prevents duplicate content issues
  const pathname = request.nextUrl.pathname;
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, { status: 308 }); // Permanent redirect
  }

  // Generate nonce for CSP (if enabled)
  const nonce = generateNonce();

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Store nonce in request headers for use in pages
  supabaseResponse.headers.set('x-nonce', nonce);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
              supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle session validation for authenticated users on admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const lastActivityCookie = request.cookies.get('last_activity');
    const sessionIpCookie = request.cookies.get('session_ip');
    const currentIP = getClientIP(request);

    // Validate session timeout
    const timeoutResult = await validateSessionTimeout(request, lastActivityCookie, supabase);
    if (timeoutResult.shouldRedirect && timeoutResult.response) {
      return timeoutResult.response;
    }

    // Validate session IP hasn't changed
    const ipResult = await validateSessionIP(request, sessionIpCookie, currentIP, supabase);
    if (ipResult.shouldRedirect && ipResult.response) {
      return ipResult.response;
    }

    // Update session cookies with current activity
    updateSessionCookies(supabaseResponse, currentIP);

    // Clean up OAuth callback cookie if present
    cleanupOAuthCallback(supabaseResponse, request);
  }

  // Handle admin route authorization
  const authResponse = await authorizeAdminRoute(request, user, supabase);
  if (authResponse) {
    return authResponse;
  }

  // Apply security headers to all responses
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const securityHeaders = isApiRoute ? getApiSecurityHeaders() : getSecurityHeaders(nonce);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      supabaseResponse.headers.set(key, value);
    }
  });

  return supabaseResponse;
}
