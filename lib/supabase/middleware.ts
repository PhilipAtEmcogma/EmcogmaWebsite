import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSecurityHeaders, getApiSecurityHeaders } from '@/lib/security/headers';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
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
  const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  const lastActivityCookie = request.cookies.get('last_activity');

  if (user && lastActivityCookie) {
    const lastActivity = parseInt(lastActivityCookie.value);
    const now = Date.now();

    // If more than 10 minutes have passed since last activity
    if (now - lastActivity > SESSION_TIMEOUT) {
      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login with timeout message
      if (request.nextUrl.pathname.startsWith('/admin') &&
          request.nextUrl.pathname !== '/admin/login') {
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('error', 'session_timeout');
        const response = NextResponse.redirect(url);

        // Clear the last activity cookie
        response.cookies.delete('last_activity');

        // Apply security headers
        const securityHeaders = getSecurityHeaders();
        Object.entries(securityHeaders).forEach(([key, value]) => {
          if (value) response.headers.set(key, value);
        });

        return response;
      }
    }
  }

  // Update last activity timestamp for authenticated users on admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    supabaseResponse.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TIMEOUT / 1000, // Cookie expires in 10 minutes
    });
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
  const securityHeaders = isApiRoute ? getApiSecurityHeaders() : getSecurityHeaders();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      supabaseResponse.headers.set(key, value);
    }
  });

  return supabaseResponse;
}
