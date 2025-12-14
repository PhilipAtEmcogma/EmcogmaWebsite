import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSecurityHeaders, getApiSecurityHeaders } from '@/lib/security/headers';
import { generateNonce } from '@/lib/security/csp';
import { getClientIP } from './ip';

export async function updateSession(request: NextRequest) {
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

  // Check session timeout (10 minutes = 600000ms)
  const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '10') * 60 * 1000;

  // Handle session timeout for authenticated users on admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const lastActivityCookie = request.cookies.get('last_activity');
    const sessionIpCookie = request.cookies.get('session_ip');
    const now = Date.now();
    const currentIP = getClientIP(request);

    console.log('[Session Check]', {
      path: request.nextUrl.pathname,
      hasLastActivity: !!lastActivityCookie,
      hasSessionIp: !!sessionIpCookie,
      currentIP,
      storedIP: sessionIpCookie?.value,
      lastActivity: lastActivityCookie?.value,
      timeNow: now,
    });

    // If user is logged in but has no last_activity cookie, it means:
    // 1. Browser was closed and reopened (session cookie was deleted)
    // 2. User just completed OAuth callback (first time login)
    // We'll allow OAuth callback to continue, but force logout for existing sessions
    const isOAuthCallback = request.cookies.get('oauth_callback');
    if (!lastActivityCookie && !isOAuthCallback) {
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

        return response;
      }
    }

    // Check if this is first login or existing session
    if (lastActivityCookie) {
      // Validate cookie value is a valid number
      const lastActivity = parseInt(lastActivityCookie.value, 10);
      const timeSinceActivity = now - lastActivity;

      console.log('[Timeout Check]', {
        lastActivity,
        timeSinceActivity,
        timeoutThreshold: SESSION_TIMEOUT,
        willTimeout: timeSinceActivity > SESSION_TIMEOUT,
      });

      if (isNaN(lastActivity)) {
        // Invalid cookie value - treat as expired session
        await supabase.auth.signOut();

        if (request.nextUrl.pathname !== '/admin/login') {
          const url = new URL('/admin/login', request.url);
          url.searchParams.set('error', 'session_invalid');
          const response = NextResponse.redirect(url);
          response.cookies.delete('last_activity');
          response.cookies.delete('session_ip');

          // Apply security headers
          const securityHeaders = getSecurityHeaders();
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });

          return response;
        }
      }

      // Check if IP address has changed
      if (sessionIpCookie && sessionIpCookie.value !== currentIP) {
        // IP changed - sign out for security
        await supabase.auth.signOut();

        if (request.nextUrl.pathname !== '/admin/login') {
          const url = new URL('/admin/login', request.url);
          url.searchParams.set('error', 'ip_changed');
          const response = NextResponse.redirect(url);
          response.cookies.delete('last_activity');
          response.cookies.delete('session_ip');

          // Apply security headers
          const securityHeaders = getSecurityHeaders();
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });

          return response;
        }
      }

      // Check if session has timed out
      if (now - lastActivity > SESSION_TIMEOUT) {
        // Sign out the user
        await supabase.auth.signOut();

        // Redirect to login with timeout message
        if (request.nextUrl.pathname !== '/admin/login') {
          const url = new URL('/admin/login', request.url);
          url.searchParams.set('error', 'session_timeout');
          const response = NextResponse.redirect(url);

          // Clear session cookies
          response.cookies.delete('last_activity');
          response.cookies.delete('session_ip');

          // Apply security headers
          const securityHeaders = getSecurityHeaders();
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });

          return response;
        }
      }
    }

    // Update last activity timestamp and session IP (for both first login and session refresh)
    // This happens AFTER timeout check to ensure atomic operation
    // NOTE: No maxAge means session cookie (deleted on browser close)
    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // No maxAge - this makes it a session cookie that expires when browser closes
    });

    supabaseResponse.cookies.set('session_ip', currentIP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // No maxAge - this makes it a session cookie that expires when browser closes
    });

    console.log('[Session Updated]', {
      lastActivity: now,
      sessionIP: currentIP,
      path: request.nextUrl.pathname,
    });

    // Clean up OAuth callback cookie if it exists
    if (isOAuthCallback) {
      supabaseResponse.cookies.delete('oauth_callback');
      console.log('[OAuth] Cleaned up callback cookie');
    }
  }

  // Protected routes (admin) - exclude login page
  if (request.nextUrl.pathname.startsWith('/admin') &&
      request.nextUrl.pathname !== '/admin/login') {
    // If not logged in, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an active admin in the database
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('active')
      .eq('email', user.email)
      .eq('active', true)
      .single();

    // If not an admin, redirect to login with error
    if (error || !adminUser) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // If logged in and accessing login page, redirect to dashboard
  if (request.nextUrl.pathname === '/admin/login' && user) {
    // Check if user is an active admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('active')
      .eq('email', user.email)
      .eq('active', true)
      .single();

    if (adminUser) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
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
