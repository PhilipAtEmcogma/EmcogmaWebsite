import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSecurityHeaders } from '@/lib/security/headers';

/**
 * Session validation result
 */
export interface SessionValidationResult {
  shouldRedirect: boolean;
  redirectUrl?: URL;
  response?: NextResponse;
}

/**
 * Session timeout configuration
 */
export const SESSION_TIMEOUT_MS =
  parseInt(process.env.SESSION_TIMEOUT_MINUTES || '10', 10) * 60 * 1000;

/**
 * Check if user just completed OAuth callback
 */
export function isOAuthCallback(request: NextRequest): boolean {
  return !!request.cookies.get('oauth_callback');
}

/**
 * Validate session activity timeout
 * Returns redirect response if session expired
 */
export async function validateSessionTimeout(
  request: NextRequest,
  lastActivityCookie: { value: string } | undefined,
  supabase: SupabaseClient
): Promise<SessionValidationResult> {
  const now = Date.now();

  // No last activity cookie - check if OAuth callback or browser reopen
  if (!lastActivityCookie) {
    if (isOAuthCallback(request)) {
      // First login - allow it to continue
      return { shouldRedirect: false };
    }

    // Browser was closed and reopened - session cookie expired
    console.log('[Browser Reopen Detected] No last_activity cookie - logging out');
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'session_timeout');
      const response = NextResponse.redirect(url);
      response.cookies.delete('last_activity');
      response.cookies.delete('session_ip');

      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) response.headers.set(key, value);
      });

      return { shouldRedirect: true, redirectUrl: url, response };
    }

    return { shouldRedirect: false };
  }

  // Validate cookie value is a valid number
  const lastActivity = parseInt(lastActivityCookie.value, 10);
  if (isNaN(lastActivity)) {
    console.log('[Invalid Session] Cookie value is not a valid timestamp');
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'session_invalid');
      const response = NextResponse.redirect(url);
      response.cookies.delete('last_activity');
      response.cookies.delete('session_ip');

      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) response.headers.set(key, value);
      });

      return { shouldRedirect: true, redirectUrl: url, response };
    }

    return { shouldRedirect: false };
  }

  // Check if session has timed out
  const timeSinceActivity = now - lastActivity;
  console.log('[Timeout Check]', {
    lastActivity,
    timeSinceActivity,
    timeoutThreshold: SESSION_TIMEOUT_MS,
    willTimeout: timeSinceActivity > SESSION_TIMEOUT_MS,
  });

  if (timeSinceActivity > SESSION_TIMEOUT_MS) {
    console.log('[Session Timeout] Inactive for', timeSinceActivity, 'ms');
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'session_timeout');
      const response = NextResponse.redirect(url);
      response.cookies.delete('last_activity');
      response.cookies.delete('session_ip');

      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) response.headers.set(key, value);
      });

      return { shouldRedirect: true, redirectUrl: url, response };
    }
  }

  return { shouldRedirect: false };
}

/**
 * Validate session IP address hasn't changed
 * Returns redirect response if IP changed (security measure)
 */
export async function validateSessionIP(
  request: NextRequest,
  sessionIpCookie: { value: string } | undefined,
  currentIP: string,
  supabase: SupabaseClient
): Promise<SessionValidationResult> {
  if (!sessionIpCookie) {
    // No stored IP - this is fine for first-time setup
    return { shouldRedirect: false };
  }

  if (sessionIpCookie.value !== currentIP) {
    console.log('[IP Changed] Session IP changed from', sessionIpCookie.value, 'to', currentIP);
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'ip_changed');
      const response = NextResponse.redirect(url);
      response.cookies.delete('last_activity');
      response.cookies.delete('session_ip');

      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) response.headers.set(key, value);
      });

      return { shouldRedirect: true, redirectUrl: url, response };
    }
  }

  return { shouldRedirect: false };
}

/**
 * Update session cookies with current timestamp and IP
 * Uses session cookies (no maxAge) so they expire on browser close
 */
export function updateSessionCookies(
  response: NextResponse,
  currentIP: string
): void {
  const now = Date.now();

  response.cookies.set('last_activity', now.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // No maxAge - session cookie (expires on browser close)
  });

  response.cookies.set('session_ip', currentIP, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // No maxAge - session cookie (expires on browser close)
  });

  console.log('[Session Updated]', {
    lastActivity: now,
    sessionIP: currentIP,
  });
}

/**
 * Clean up OAuth callback cookie after first login
 */
export function cleanupOAuthCallback(response: NextResponse, request: NextRequest): void {
  if (isOAuthCallback(request)) {
    response.cookies.delete('oauth_callback');
    console.log('[OAuth] Cleaned up callback cookie');
  }
}
