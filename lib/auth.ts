import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient, isSupabaseConfigured } from './supabase/server';
import type { Profile, School } from './types';

export interface SessionContext {
  userId: string;
  email: string | null;
  profile: Profile;
  school: School | null; // null for super_admin
}

/**
 * Server-side guard for every dashboard page. Resolves the signed-in user's
 * profile (and tenant). RLS is the enforcement layer of record — this guard
 * is for routing and UX, not security.
 */
export const requireSession = cache(async (): Promise<SessionContext> => {
  if (!isSupabaseConfigured()) redirect('/login?setup=1');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, people(*), schools(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  const profile = (profiles ?? [])[0] as (Profile & { schools: School | null }) | undefined;
  if (!profile) redirect('/login?unlinked=1');

  return {
    userId: user.id,
    email: user.email ?? null,
    profile,
    school: profile.schools ?? null,
  };
});
