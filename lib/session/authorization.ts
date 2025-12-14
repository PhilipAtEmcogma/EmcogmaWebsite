import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if user is an active admin in the database
 */
export async function isActiveAdmin(
  supabase: SupabaseClient,
  email: string | undefined
): Promise<boolean> {
  if (!email) return false;

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('active')
    .eq('email', email)
    .eq('active', true)
    .single();

  return !error && !!adminUser;
}

/**
 * Handle admin route authorization
 * Returns redirect response if user is not authorized
 */
export async function authorizeAdminRoute(
  request: NextRequest,
  user: User | null,
  supabase: SupabaseClient
): Promise<NextResponse | null> {
  // Skip authorization for login page
  if (request.nextUrl.pathname === '/admin/login') {
    // If logged in and is admin, redirect to dashboard
    if (user && (await isActiveAdmin(supabase, user.email))) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return null; // Allow access to login page
  }

  // Protected admin routes - require authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Not logged in - redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Logged in but not an admin - redirect with error
    if (!(await isActiveAdmin(supabase, user.email))) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return null; // Allow access
}
