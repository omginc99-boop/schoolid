// Personal welcome email for anyone who joins a school — teacher, parent,
// student or staff. Called once after signup; everything is derived from the
// verified session, nothing is trusted from the request body.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isEmailConfigured, sendUserWelcomeEmail } from '@/lib/email';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';

const INTRO: Record<UserRole, string> = {
  student: 'Your timetable, homework, results and digital ID are all waiting inside — and an AI tutor whenever you get stuck.',
  parent: 'You can follow every child in one place: attendance, results, fees and school news — and message their teachers directly.',
  teacher: 'Take the register in seconds, keep your gradebook in one place, and let AI draft your lesson plans and report comments.',
  principal: 'Your whole school at a glance — enrollment, attendance, fee collection and the students who need attention first.',
  school_admin: 'You manage the school record: academic years, classes, students and staff, all in one place.',
  finance: 'Fees, invoices and collection tracking — you will always know what has come in and what is outstanding.',
  librarian: 'The catalogue, loans and returns — with every borrower verified by their SchoolID.',
  transport: 'Your routes, stops and pickup manifests, so every child is accounted for.',
  security: 'Scan any SchoolID QR code at the gate to verify who a person is before they come in.',
  counselor: 'Your wellbeing caseload, visible only to you and the principal.',
  registrar: 'Admissions, certificates and alumni records — the official memory of the school.',
  super_admin: 'Every school, subscription and audit trail across the SchoolID platform.',
};

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
    .select('role, schoolid_number, people(full_name), schools(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!profile) return NextResponse.json({ sent: false, reason: 'no-profile' });

  const role = profile.role as UserRole;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const result = await sendUserWelcomeEmail({
    to: user.email,
    fullName: (profile.people as { full_name?: string } | null)?.full_name ?? 'there',
    roleLabel: roleMeta(role).label,
    schoolName: (profile.schools as { name?: string } | null)?.name ?? 'SchoolID',
    schoolidNumber: profile.schoolid_number ?? '—',
    intro: INTRO[role] ?? INTRO.student,
    appUrl,
  });

  if (!result.ok) {
    console.error('User welcome email failed:', result.error);
    return NextResponse.json({ sent: false, reason: 'send-failed' });
  }
  return NextResponse.json({ sent: true });
}
