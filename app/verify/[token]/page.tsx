// PUBLIC identity verification — what a QR scan opens. Backed by the
// security-definer verify_identity() function: reveals only name, photo,
// role, school and status. No login required, no sensitive data exposed.
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/primitives';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { roleMeta } from '@/lib/roles';
import type { VerifiedIdentity } from '@/lib/types';
import { ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';

export const metadata = { title: 'Verify identity' };

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let identity: VerifiedIdentity | null = null;
  let configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.rpc('verify_identity', { token });
    identity = (Array.isArray(data) ? data[0] : data) ?? null;
  }

  const active = identity?.status === 'active';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 h-16 max-w-6xl mx-auto w-full">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          {!configured ? (
            <div className="card p-8 text-center">
              <ShieldAlert size={40} className="mx-auto" style={{ color: 'var(--warning)' }} />
              <h1 className="text-xl font-bold mt-4">Verification unavailable</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                This SchoolID instance is not connected to its database yet.
              </p>
            </div>
          ) : identity ? (
            <div className="card overflow-hidden">
              <div
                className="p-6 text-center"
                style={{ background: active ? (identity.school_primary_color || 'var(--brand)') : 'var(--danger)' }}
              >
                {active ? (
                  <ShieldCheck size={40} className="mx-auto text-white" />
                ) : (
                  <ShieldX size={40} className="mx-auto text-white" />
                )}
                <p className="text-white font-bold text-lg mt-2">
                  {active ? 'Identity verified' : `Identity ${identity.status}`}
                </p>
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <Avatar name={identity.full_name} src={identity.photo_url} size={72} />
                <h1 className="text-xl font-bold mt-3">{identity.full_name}</h1>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {roleMeta(identity.role).label} · {identity.school_name}
                </p>
                <p className="font-mono text-sm mt-3">{identity.schoolid_number}</p>
                <span className={`badge mt-3 ${identity.verification_status !== 'unverified' ? 'badge-gold' : 'badge-muted'}`}>
                  <ShieldCheck size={12} />
                  {identity.verification_status === 'document_verified' ? 'Fully verified'
                    : identity.verification_status === 'school_verified' ? 'School verified' : 'Unverified'}
                </span>
                <p className="text-[11px] mt-5" style={{ color: 'var(--muted)' }}>
                  Verified live against the SchoolID identity network.
                  This page shows no academic, financial or contact records.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <ShieldX size={40} className="mx-auto" style={{ color: 'var(--danger)' }} />
              <h1 className="text-xl font-bold mt-4">Not a valid SchoolID</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                This code doesn&apos;t match any identity. The card may be fake, expired,
                or the QR token may have been rotated.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
