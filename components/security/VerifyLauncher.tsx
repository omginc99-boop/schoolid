'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ScanLine } from 'lucide-react';

/**
 * Gate verification launcher. Camera QR scanners on phones open the encoded
 * /verify/<token> URL directly; this input is the manual fallback when an
 * officer types the code printed under the QR.
 */
export default function VerifyLauncher() {
  const [token, setToken] = useState('');
  const router = useRouter();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const t = token.trim().split('/').pop();
        if (t) router.push(`/verify/${encodeURIComponent(t)}`);
      }}
      className="space-y-3"
    >
      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--brand-soft)' }}>
        <ScanLine size={22} style={{ color: 'var(--brand)' }} />
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          Scan any SchoolID QR with a phone camera — it opens the verification page instantly.
          Or enter the ID token manually below.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          className="input font-mono"
          placeholder="e.g. demo-qr-s01"
          value={token}
          onChange={e => setToken(e.target.value)}
          aria-label="SchoolID QR token"
        />
        <button type="submit" className="btn btn-primary shrink-0" disabled={!token.trim()}>
          <QrCode size={15} /> Verify
        </button>
      </div>
    </form>
  );
}
