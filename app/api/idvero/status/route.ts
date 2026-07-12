// Poll the caller's IDVero verification and sync the result onto their
// profile. Works even when the IDVero webhook isn't configured yet.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getVerification, isIdveroConfigured } from '@/lib/idvero';

export async function GET() {
  if (!isSupabaseConfigured() || !isIdveroConfigured()) {
    return NextResponse.json({ error: 'Verification not configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id, idvero_ref, verification_status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (!profile?.idvero_ref) {
    return NextResponse.json({ error: 'No verification in progress.' }, { status: 404 });
  }

  const result = await getVerification(profile.idvero_ref);
  if (!result.ok) {
    console.error('IDVero status failed:', result.error);
    return NextResponse.json({ error: 'Could not reach the identity service.' }, { status: 502 });
  }

  const v = result.verification;
  if (v.status === 'verified' && profile.verification_status !== 'document_verified') {
    await supabase.from('profiles')
      .update({ verification_status: 'document_verified' })
      .eq('id', profile.id);
    if (profile.school_id) {
      await supabase.rpc('log_audit', {
        sid: profile.school_id,
        p_action: 'identity.document_verified',
        p_entity: 'profile',
        p_entity_id: profile.id,
        p_detail: { provider: 'idvero', ref: v.id, trust_score: v.trust_score },
      });
    }
  }

  return NextResponse.json({ status: v.status, trust_score: v.trust_score });
}
