import { createClient } from '@/lib/supabase/server';

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  return user.email === adminEmail;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }

  return user;
}
