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
 * Session timeout configuration (default: 10 minutes)
 */
export const SESSION_TIMEOUT_MS =
  parseInt(process.env.SESSION_TIMEOUT_MINUTES || '10', 10) * 60 * 1000;

/**
 * Helper function to create session expiry redirect response
 * Consolidates redirect logic to reduce duplication (DRY principle)
 *
 * @param request - Next.js request object
 * @param errorType - Error type for query parameter (session_timeout | session_invalid | ip_changed)
 * @returns Redirect response with cleared cookies and security headers
 */
function createSessionExpiredRedirect(
  request: NextRequest,
  errorType: 'session_timeout' | 'session_invalid' | 'ip_changed'
): { url: URL; response: NextResponse } {
  const url = new URL('/admin/login', request.url);
  url.searchParams.set('error', errorType);
  const response = NextResponse.redirect(url);
  response.cookies.delete('last_activity');
  response.cookies.delete('session_ip');

  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value);
  });

  return { url, response };
}

/**
 * Check if user just completed OAuth callback
 *
 * @param request - Next.js request object
 * @returns True if oauth_callback cookie exists with a truthy value
 */
export function isOAuthCallback(request: NextRequest): boolean {
  const cookie = request.cookies.get('oauth_callback');
  return !!cookie && !!cookie.value; // Validate both cookie existence and value
}

/**
 * Validate session activity timeout
 *
 * Checks for:
 * - Missing last_activity cookie (browser reopen detection)
 * - Invalid timestamp values (NaN, negative, future dates)
 * - Session timeout (configurable via SESSION_TIMEOUT_MS)
 *
 * @param request - Next.js request object
 * @param lastActivityCookie - Cookie containing last activity timestamp
 * @param supabase - Supabase client for sign out
 * @returns SessionValidationResult indicating whether to redirect
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
      const { url, response } = createSessionExpiredRedirect(request, 'session_timeout');
      return { shouldRedirect: true, redirectUrl: url, response };
    }

    return { shouldRedirect: false };
  }

  // Validate cookie value is a valid number
  const lastActivity = parseInt(lastActivityCookie.value, 10);
  if (isNaN(lastActivity) || lastActivity < 0) {
    console.log('[Invalid Session] Cookie value is not a valid timestamp:', lastActivityCookie.value);
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const { url, response } = createSessionExpiredRedirect(request, 'session_invalid');
      return { shouldRedirect: true, redirectUrl: url, response };
    }

    return { shouldRedirect: false };
  }

  // Check if session has timed out
  const timeSinceActivity = now - lastActivity;

  // Validate timestamp is not unrealistically in the future
  if (timeSinceActivity < 0) {
    console.log('[Invalid Session] Future timestamp detected:', {
      lastActivity,
      now,
      difference: timeSinceActivity,
    });
    await supabase.auth.signOut();

    if (request.nextUrl.pathname !== '/admin/login') {
      const { url, response } = createSessionExpiredRedirect(request, 'session_invalid');
      return { shouldRedirect: true, redirectUrl: url, response };
    }

    return { shouldRedirect: false };
  }

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
      const { url, response } = createSessionExpiredRedirect(request, 'session_timeout');
      return { shouldRedirect: true, redirectUrl: url, response };
    }
  }

  return { shouldRedirect: false };
}

/**
 * Validate session IP address hasn't changed
 *
 * Security measure to detect session hijacking. Logs out user if IP address
 * changes during an active session.
 *
 * @param request - Next.js request object
 * @param sessionIpCookie - Cookie containing stored session IP
 * @param currentIP - Current request IP address
 * @param supabase - Supabase client for sign out
 * @returns SessionValidationResult indicating whether to redirect
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
      const { url, response } = createSessionExpiredRedirect(request, 'ip_changed');
      return { shouldRedirect: true, redirectUrl: url, response };
    }
  }

  return { shouldRedirect: false };
}

/**
 * Update session cookies with current timestamp and IP
 *
 * Sets HTTP-only session cookies (no maxAge) that expire when browser closes.
 * This enables browser closure detection as part of triple-layer session security.
 *
 * @param response - Next.js response object to set cookies on
 * @param currentIP - Current request IP address to store
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
 *
 * Removes the oauth_callback marker cookie after the initial authentication
 * flow completes to prevent false positives in session timeout detection.
 *
 * @param response - Next.js response object to delete cookie from
 * @param request - Next.js request object to check for cookie
 */
export function cleanupOAuthCallback(response: NextResponse, request: NextRequest): void {
  if (isOAuthCallback(request)) {
    response.cookies.delete('oauth_callback');
    console.log('[OAuth] Cleaned up callback cookie');
  }
}
