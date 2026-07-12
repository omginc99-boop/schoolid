// Service-role Supabase client — bypasses RLS. Server-only, used exclusively
// by webhook handlers that have no user session (e.g. IDVero callbacks).
// Never import from client components.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function isAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
