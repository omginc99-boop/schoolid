// AfriID — identity verification via Smile ID, proxied through afriid.africa.
// SchoolID calls AfriID's /api/verify or /api/verify-document endpoints.
// Set AFRIID_URL + AFRIID_API_SECRET in .env.local to activate.

export type AfriIDDocType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENCE' | 'VOTER_ID';

export interface AfriIDVerifyResponse {
  ok: true;
  verified: boolean;
  fullName: string | null;
  dob: string | null;
  resultText: string | null;
  actions: Record<string, unknown>;
}

export interface AfriIDDocumentResponse {
  ok: true;
  verified: boolean;
  liveness: boolean;
  faceMatch: boolean;
  resultText: string | null;
  confidence: number | null;
  actions: Record<string, unknown>;
}

export interface AfriIDError {
  ok: false;
  error: string;
  status?: number;
}

const BASE = (process.env.AFRIID_URL ?? 'https://afriid.africa').replace(/\/+$/, '');
const KEY = process.env.AFRIID_API_SECRET;

export function isAfriIDConfigured(): boolean {
  return Boolean(KEY && BASE);
}

async function afriidFetch(path: string, body: Record<string, unknown>): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (KEY) headers['x-afriid-key'] = KEY;

  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * Enhanced KYC — ID number lookup + name/DOB match (Smile ID job_type 5).
 * Returns verified status + extracted full name & DOB.
 */
export async function verifyIdNumber(opts: {
  country: string;
  idType: AfriIDDocType;
  idNumber: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // YYYY-MM-DD
  userId?: string;
}): Promise<AfriIDVerifyResponse | AfriIDError> {
  if (!isAfriIDConfigured()) {
    return { ok: false, error: 'AfriID not configured (AFRIID_URL or AFRIID_API_SECRET missing).' };
  }

  try {
    const res = await afriidFetch('/api/verify', {
      country: opts.country,
      idType: opts.idType,
      idNumber: opts.idNumber,
      firstName: opts.firstName,
      lastName: opts.lastName,
      dob: opts.dob,
      userId: opts.userId,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `AfriID ${res.status}: ${detail.slice(0, 300)}` };
    }

    const data = await res.json();
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Verification failed' };
  }
}

/**
 * Document verification — selfie ↔ ID document biometric match (Smile ID job_type 6).
 * Returns verified status + liveness + face match result.
 */
export async function verifyDocument(opts: {
  country: string;
  idType: AfriIDDocType;
  selfieImage: string; // base64 or data-URL
  idImage: string; // base64 or data-URL
  userId?: string;
}): Promise<AfriIDDocumentResponse | AfriIDError> {
  if (!isAfriIDConfigured()) {
    return { ok: false, error: 'AfriID not configured (AFRIID_URL or AFRIID_API_SECRET missing).' };
  }

  try {
    const res = await afriidFetch('/api/verify-document', {
      country: opts.country,
      idType: opts.idType,
      selfieImage: opts.selfieImage,
      idImage: opts.idImage,
      userId: opts.userId,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `AfriID ${res.status}: ${detail.slice(0, 300)}` };
    }

    const data = await res.json();
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Verification failed' };
  }
}
