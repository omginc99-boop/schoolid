// Manual trigger for the personal welcome email — teacher, parent, student
// or staff. The dashboard page fires this automatically on first login;
// this route exists for a future "resend welcome email" action. Everything
// is derived from the verified session, nothing is trusted from the body.
// Idempotency matches lib/welcome.ts: only the caller that flips
// welcome_email_sent false -> true actually sends.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isEmailConfigured, sendUserWelcomeEmail, WELCOME_EMAIL_INTRO } from '@/lib/email';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ sent: false, reason: 'email-not-configured' });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, schoolid_number, welcome_email_sent, people(full_name), schools(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!profile) return NextResponse.json({ sent: false, reason: 'no-profile' });

  const { data: claimed } = await supabase
    .from('profiles')
    .update({ welcome_email_sent: true })
    .eq('id', profile.id)
    .eq('welcome_email_sent', false)
    .select('id')
    .maybeSingle();
  if (!claimed) return NextResponse.json({ sent: false, reason: 'already-sent' });

  const role = profile.role as UserRole;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const result = await sendUserWelcomeEmail({
    to: user.email,
    fullName: (profile.people as { full_name?: string } | null)?.full_name ?? 'there',
    roleLabel: roleMeta(role).label,
    schoolName: (profile.schools as { name?: string } | null)?.name ?? 'SchoolID',
    schoolidNumber: profile.schoolid_number ?? '—',
    intro: WELCOME_EMAIL_INTRO[role] ?? WELCOME_EMAIL_INTRO.student,
    appUrl,
  });

  if (!result.ok) {
    console.error('User welcome email failed:', result.error);
    return NextResponse.json({ sent: false, reason: 'send-failed' });
  }
  return NextResponse.json({ sent: true });
}
