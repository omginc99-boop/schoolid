// Submit a document verification to IDVero for the signed-in person.
// Selfie + document images travel as base64 (client downscales first) and
// are forwarded to IDVero — SchoolID stores only the verification reference.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createVerification, isIdveroConfigured, type IdveroDocType } from '@/lib/idvero';

export const maxDuration = 60;

const DOC_TYPES: IdveroDocType[] = ['identity', 'passport', 'drivers_licence', 'national_id'];

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }
  if (!isIdveroConfigured()) {
    return NextResponse.json(
      { error: 'Identity verification is not configured yet (IDVERO_API_KEY missing).' },
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

  let body: { type?: string; country?: string; selfie_b64?: string; document_b64?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const type = DOC_TYPES.includes(body.type as IdveroDocType) ? (body.type as IdveroDocType) : 'national_id';
  const country = /^[A-Za-z]{2}$/.test(body.country ?? '') ? body.country!.toUpperCase() : 'NG';
  if (!body.selfie_b64?.startsWith('data:image/') || !body.document_b64?.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Both a selfie and a document photo are required.' }, { status: 400 });
  }

  const result = await createVerification({
    type,
    country,
    userRef: profile.id,
    userEmail: profile.email ?? user.email,
    userName: (profile.people as { full_name?: string } | null)?.full_name,
    selfieB64: body.selfie_b64,
    documentB64: body.document_b64,
  });

  if (!result.ok) {
    console.error('IDVero create failed:', result.error);
    const friendly =
      result.status === 402 ? 'The verification quota for this month is used up — contact your school.'
      : result.status === 401 ? 'Identity service credentials are invalid — contact support.'
      : 'The identity service could not accept the verification. Please try again.';
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  // Remember the IDVero reference on the caller's own profile (RLS self-update).
  await supabase.from('profiles').update({ idvero_ref: result.verification.id }).eq('id', profile.id);

  return NextResponse.json({
    id: result.verification.id,
    status: result.verification.status,
    message: result.verification.message ?? null,
  });
}
