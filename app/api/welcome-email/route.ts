// Sends the branded welcome email after a school registers.
// Auth-guarded: derives recipient, school name and slug from the caller's
// session and their school_admin profile — nothing is trusted from the body.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isEmailConfigured, sendSchoolWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }
  if (!isEmailConfigured()) {
    // Not an error state for the caller — registration succeeded regardless.
    return NextResponse.json({ sent: false, reason: 'email-not-configured' });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  let schoolId: string | undefined;
  try {
    const body = await request.json();
    schoolId = body?.schoolId;
  } catch { /* body optional */ }

  let query = supabase
    .from('profiles')
    .select('school_id, people(full_name), schools(name, slug)')
    .eq('user_id', user.id)
    .eq('role', 'school_admin')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data: profile } = await query.maybeSingle();

  const school = profile?.schools as { name?: string; slug?: string } | null;
  if (!school?.name) {
    return NextResponse.json({ error: 'No school found for this account.' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? new URL(request.url).origin;

  const result = await sendSchoolWelcomeEmail({
    to: user.email,
    adminName: (profile?.people as { full_name?: string } | null)?.full_name ?? 'there',
    schoolName: school.name,
    schoolSlug: school.slug ?? '',
    appUrl,
  });

  if (!result.ok) {
    console.error('Welcome email failed:', result.error);
    return NextResponse.json({ sent: false, reason: 'send-failed' });
  }
  return NextResponse.json({ sent: true });
}
