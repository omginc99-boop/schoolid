// IDVero webhook receiver. IDVero signs each delivery with
// x-idvero-signature = HMAC-SHA256(body, webhook secret). On a verified
// result we upgrade the matching profile to document_verified.
// Uses the service-role client: webhooks have no user session.
import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const secret = process.env.IDVERO_WEBHOOK_SECRET;
  if (!secret || !isAdminConfigured()) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get('x-idvero-signature') ?? '';
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: { id?: string; user_ref?: string; status?: string; trust_score?: number | null };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const data = event.data ?? (event as Record<string, unknown>);
  const userRef = (data as { user_ref?: string }).user_ref;
  const status = (data as { status?: string }).status;
  const ref = (data as { id?: string }).id;
  if (!userRef || !status) return NextResponse.json({ received: true });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, school_id, verification_status')
    .eq('id', userRef)
    .maybeSingle();
  if (!profile) return NextResponse.json({ received: true });

  if (status === 'verified' && profile.verification_status !== 'document_verified') {
    await admin.from('profiles')
      .update({ verification_status: 'document_verified', idvero_ref: ref ?? undefined })
      .eq('id', profile.id);
    if (profile.school_id) {
      await admin.from('audit_logs').insert({
        school_id: profile.school_id,
        actor_profile_id: null,
        action: 'identity.document_verified',
        entity: 'profile',
        entity_id: profile.id,
        detail: { provider: 'idvero', ref, via: 'webhook' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
