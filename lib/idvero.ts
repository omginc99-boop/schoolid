// IDVero — Agodi's identity-verification infrastructure (api.getidvero.com).
// Server-side only. Verifications run through Smile ID document checks;
// results arrive via webhook or polling GET /v3/verifications/{id}.

export type IdveroDocType = 'identity' | 'passport' | 'drivers_licence' | 'national_id';
export type IdveroStatus = 'pending' | 'verified' | 'rejected' | 'manual_review';

export interface IdveroVerification {
  id: string;                 // ver_xxx
  verification_id: string;    // uuid
  status: IdveroStatus;
  trust_score: number | null;
  type: IdveroDocType;
  country: string;
  message?: string;
  created_at: string;
  completed_at: string | null;
}

const BASE = (process.env.IDVERO_API_URL ?? 'https://api.getidvero.com').replace(/\/+$/, '');

export function isIdveroConfigured(): boolean {
  return Boolean(process.env.IDVERO_API_KEY);
}

async function idveroFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.IDVERO_API_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export async function createVerification(opts: {
  type: IdveroDocType;
  country: string;          // ISO 3166-1 alpha-2
  userRef: string;          // SchoolID profile id
  userEmail?: string | null;
  userName?: string | null;
  selfieB64: string;        // data:image/...;base64,...
  documentB64: string;
}): Promise<{ ok: true; verification: IdveroVerification } | { ok: false; error: string; status: number }> {
  const res = await idveroFetch('/v3/verifications', {
    method: 'POST',
    body: JSON.stringify({
      type: opts.type,
      country: opts.country,
      user_ref: opts.userRef,
      user_email: opts.userEmail ?? undefined,
      user_name: opts.userName ?? undefined,
      selfie_b64: opts.selfieB64,
      document_b64: opts.documentB64,
      channel: 'API',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: `IDVero ${res.status}: ${detail.slice(0, 300)}` };
  }
  return { ok: true, verification: await res.json() };
}

export async function getVerification(
  id: string,
): Promise<{ ok: true; verification: IdveroVerification } | { ok: false; error: string; status: number }> {
  const res = await idveroFetch(`/v3/verifications/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: `IDVero ${res.status}: ${detail.slice(0, 300)}` };
  }
  return { ok: true, verification: await res.json() };
}
