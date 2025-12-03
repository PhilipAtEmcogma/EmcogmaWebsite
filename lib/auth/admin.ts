import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current authenticated user is an admin
 * Uses the admin_users table to verify admin status
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  // Query admin_users table to check if user is an active admin
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('active')
    .eq('email', user.email)
    .eq('active', true)
    .single();

  if (error || !adminUser) {
    return false;
  }

  return true;
}

/**
 * Require admin access, throw error if not admin
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Get the current admin user if they are an active admin
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  // Verify user is an active admin in the database
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('active', true)
    .single();

  if (error || !adminUser) {
    return null;
  }

  return user;
}
