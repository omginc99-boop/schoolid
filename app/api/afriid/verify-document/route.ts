// Submit document + selfie verification to AfriID (Smile ID job_type 6).
// Matches a live selfie to ID document photo with liveness + authenticity checks.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { verifyDocument, isAfriIDConfigured, type AfriIDDocType } from '@/lib/afriid';

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
    selfieImage?: string;
    idImage?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const idType = ID_TYPES.includes(body.idType as AfriIDDocType) ? (body.idType as AfriIDDocType) : 'NATIONAL_ID';
  const country = /^[A-Za-z]{2}$/.test(body.country ?? '') ? body.country!.toUpperCase() : 'NG';
  if (!body.selfieImage?.startsWith('data:image/') || !body.idImage?.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Both a selfie and an ID photo are required as data-URLs.' }, { status: 400 });
  }

  const result = await verifyDocument({
    country,
    idType,
    selfieImage: body.selfieImage,
    idImage: body.idImage,
    userId: profile.id,
  });

  if (!result.ok) {
    console.error('AfriID document verification failed:', result.error);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Update verification status if verified (liveness + face match passed).
  if (result.verified && result.liveness && result.faceMatch) {
    await supabase.from('profiles')
      .update({ verification_status: 'document_verified', afriid_ref: profile.id })
      .eq('id', profile.id);
  }

  return NextResponse.json({
    verified: result.verified,
    liveness: result.liveness,
    faceMatch: result.faceMatch,
    resultText: result.resultText,
    confidence: result.confidence,
  });
}
