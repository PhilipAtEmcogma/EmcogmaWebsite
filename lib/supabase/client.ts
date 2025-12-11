import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create browser client with cookie support for SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Function export (for new code and hooks)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
