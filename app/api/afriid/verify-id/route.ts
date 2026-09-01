// Submit an ID verification to AfriID (KYC via Smile ID job_type 5).
// User provides ID number, name, DOB — AfriID returns verified status + extracted name/DOB.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { verifyIdNumber, isAfriIDConfigured, type AfriIDDocType } from '@/lib/afriid';

export const maxDuration = 60;

const ID_TYPES: AfriIDDocType[] = ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENCE', 'VOTER_ID'];

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }
  if (!isAfriIDConfigured()) {
    return NextResponse.json(
      { error: 'Identity verification is not configured yet (AFRIID_URL or AFRIID_API_KEY missing).' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, verification_status, people(full_name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'No active profile.' }, { status: 403 });
  if (profile.verification_status === 'document_verified') {
    return NextResponse.json({ error: 'You are already fully verified.' }, { status: 409 });
  }

  let body: {
    country?: string;
    idType?: string;
    idNumber?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const idType = ID_TYPES.includes(body.idType as AfriIDDocType) ? (body.idType as AfriIDDocType) : 'NATIONAL_ID';
  const country = /^[A-Za-z]{2}$/.test(body.country ?? '') ? body.country!.toUpperCase() : 'NG';
  if (!body.idNumber) {
    return NextResponse.json({ error: 'ID number is required.' }, { status: 400 });
  }

  const result = await verifyIdNumber({
    country,
    idType,
    idNumber: body.idNumber,
    firstName: body.firstName,
    lastName: body.lastName,
    dob: body.dob,
    userId: profile.id,
  });

  if (!result.ok) {
    console.error('AfriID KYC failed:', result.error);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Remember the AfriID reference and update verification status if verified.
  if (result.verified) {
    await supabase.from('profiles')
      .update({ verification_status: 'document_verified', afriid_ref: profile.id })
      .eq('id', profile.id);
  }

  return NextResponse.json({
    verified: result.verified,
    fullName: result.fullName,
    dob: result.dob,
    resultText: result.resultText,
  });
}
