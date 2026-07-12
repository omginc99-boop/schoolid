'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LogoMark } from '@/components/ui/Logo';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { initials } from '@/lib/format';
import type { VerificationStatus } from '@/lib/types';

interface IdCardProps {
  schoolName: string;
  schoolMotto?: string | null;
  primaryColor?: string;
  personName: string;
  roleLabel: string;
  title?: string | null;
  schoolidNumber: string;
  qrToken: string;
  verificationStatus: VerificationStatus;
  photoUrl?: string | null;
}

export default function IdCard({
  schoolName, schoolMotto, primaryColor = '#4f46e5', personName, roleLabel,
  title, schoolidNumber, qrToken, verificationStatus, photoUrl,
}: IdCardProps) {
  const [verifyUrl, setVerifyUrl] = useState(`/verify/${qrToken}`);
  useEffect(() => {
    setVerifyUrl(`${window.location.origin}/verify/${qrToken}`);
  }, [qrToken]);

  const verified = verificationStatus !== 'unverified';

  return (
    <div className="card overflow-hidden w-full max-w-sm mx-auto" role="img"
      aria-label={`SchoolID card for ${personName}, ${roleLabel} at ${schoolName}`}>
      {/* School-branded header */}
      <div className="p-5 flex items-center gap-3" style={{ background: primaryColor }}>
        <LogoMark size={32} />
        <div className="text-white min-w-0">
          <p className="font-bold leading-tight truncate">{schoolName}</p>
          <p className="text-xs opacity-80 truncate">{schoolMotto || `${roleLabel} Identity Card`}</p>
        </div>
      </div>

      <div className="p-5 flex gap-4">
        {/* Photo */}
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="w-20 h-24 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-20 h-24 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: 'var(--brand-soft)', color: primaryColor }}>
            {initials(personName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg leading-tight">{personName}</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{title || roleLabel}</p>
          <p className="font-mono text-sm mt-2 tracking-tight">{schoolidNumber}</p>
          <span className={`badge mt-2 ${verified ? 'badge-gold' : 'badge-muted'}`}>
            {verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            {verificationStatus === 'document_verified' ? 'Fully verified'
              : verificationStatus === 'school_verified' ? 'Verified' : 'Unverified'}
          </span>
        </div>

        {/* QR — scans to the public verification page */}
        <div className="shrink-0 p-1.5 rounded-lg h-fit" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <QRCodeSVG value={verifyUrl} size={72} level="M" marginSize={0} fgColor="#0e1330" />
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
        <span>Scan QR to verify identity</span>
        <span className="font-mono">{qrToken.slice(0, 12)}</span>
      </div>
    </div>
  );
}
