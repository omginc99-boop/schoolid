// Guarantees the first-login welcome email fires exactly once per person,
// no matter which path they signed up through (instant session, or
// sign-in after confirming their email). Called from the dashboard page —
// the one place every role passes through after authenticating.
import { after } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isEmailConfigured, sendUserWelcomeEmail, WELCOME_EMAIL_INTRO } from './email';
import { roleMeta } from './roles';
import type { SessionContext } from './auth';

export function scheduleWelcomeEmailIfDue(supabase: SupabaseClient, ctx: SessionContext, appUrl: string): void {
  if (ctx.profile.welcome_email_sent || !isEmailConfigured() || !ctx.email) return;

  // Atomic claim: only the request that flips false -> true actually sends.
  // A second concurrent request finds no row to update and does nothing.
  const claim = supabase
    .from('profiles')
    .update({ welcome_email_sent: true })
    .eq('id', ctx.profile.id)
    .eq('welcome_email_sent', false)
    .select('id')
    .maybeSingle();

  after(async () => {
    const { data: claimed, error } = await claim;
    if (error || !claimed) return; // lost the race, or update failed — don't send
    const role = ctx.profile.role;
    const result = await sendUserWelcomeEmail({
      to: ctx.email!,
      fullName: ctx.profile.people?.full_name ?? 'there',
      roleLabel: roleMeta(role).label,
      schoolName: ctx.school?.name ?? 'SchoolID',
      schoolidNumber: ctx.profile.schoolid_number ?? '—',
      intro: WELCOME_EMAIL_INTRO[role] ?? WELCOME_EMAIL_INTRO.student,
      appUrl,
    });
    if (!result.ok) console.error('Welcome email failed:', result.error);
  });
}
