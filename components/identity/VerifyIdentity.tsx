'use client';

// Document verification flow, powered by IDVero (Agodi identity infrastructure).
// Captures a selfie + ID document, downscales them client-side, and submits
// to /api/idvero/verify. Status can be re-checked until the result lands.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck, Camera, FileImage, Loader2, RefreshCw, ShieldCheck, ShieldAlert,
} from 'lucide-react';

const DOC_TYPES = [
  { value: 'national_id', label: 'National ID card' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_licence', label: 'Driver’s licence' },
  { value: 'identity', label: 'Other identity document' },
];

const COUNTRIES = [
  ['NG', 'Nigeria'], ['ZA', 'South Africa'], ['GH', 'Ghana'], ['KE', 'Kenya'],
  ['EG', 'Egypt'], ['ET', 'Ethiopia'], ['TZ', 'Tanzania'], ['UG', 'Uganda'],
  ['RW', 'Rwanda'], ['SN', 'Senegal'], ['CI', 'Côte d’Ivoire'], ['CM', 'Cameroon'],
  ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'], ['BW', 'Botswana'], ['NA', 'Namibia'],
  ['MA', 'Morocco'], ['DZ', 'Algeria'], ['TN', 'Tunisia'], ['US', 'United States'],
  ['GB', 'United Kingdom'],
];

async function downscale(file: File, maxDim = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

type Phase = 'idle' | 'submitting' | 'pending' | 'manual_review' | 'verified' | 'rejected';

export default function VerifyIdentity({
  hasPending, defaultCountry,
}: { hasPending: boolean; defaultCountry: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(hasPending ? 'pending' : 'idle');
  const [docType, setDocType] = useState('national_id');
  const [country, setCountry] = useState(defaultCountry);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!selfie || !doc) return;
    setPhase('submitting');
    setError(null);
    try {
      const [selfieB64, docB64] = await Promise.all([downscale(selfie), downscale(doc)]);
      const res = await fetch('/api/idvero/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: docType, country, selfie_b64: selfieB64, document_b64: docB64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Verification failed.');
      setPhase(data.status === 'verified' ? 'verified' : data.status === 'rejected' ? 'rejected' : 'pending');
      if (data.status === 'verified') router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPhase('idle');
    }
  }

  async function checkStatus() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch('/api/idvero/status');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not check status.');
      setPhase(data.status === 'verified' ? 'verified'
        : data.status === 'rejected' ? 'rejected'
        : data.status === 'manual_review' ? 'manual_review' : 'pending');
      if (data.status === 'verified') router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setChecking(false);
    }
  }

  if (phase === 'verified') {
    return (
      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--success-soft)' }}>
        <BadgeCheck size={20} style={{ color: 'var(--success)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
          Document verified — your SchoolID now carries the highest trust level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phase === 'pending' || phase === 'manual_review' ? (
        <div className="p-4 rounded-xl" style={{ background: 'var(--brand-soft)' }}>
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--brand)' }}>
            <ShieldCheck size={16} />
            {phase === 'manual_review'
              ? 'Your documents are with a human reviewer.'
              : 'Verification in progress — usually takes a few minutes.'}
          </p>
          <button onClick={checkStatus} disabled={checking} className="btn btn-outline mt-3 !py-2 !text-[13px]">
            {checking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Check status
          </button>
        </div>
      ) : (
        <>
          {phase === 'rejected' ? (
            <div className="p-3.5 rounded-xl flex items-start gap-2 text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              The check didn’t pass. Retake both photos in good light and try again.
            </div>
          ) : null}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="vDocType" className="text-sm font-medium">Document type</label>
              <select id="vDocType" className="input mt-1.5" value={docType} onChange={e => setDocType(e.target.value)}>
                {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="vCountry" className="text-sm font-medium">Issuing country</label>
              <select id="vCountry" className="input mt-1.5" value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => selfieRef.current?.click()}
              className="btn btn-outline !py-3 w-full">
              <Camera size={16} /> {selfie ? '✓ Selfie added' : 'Take a selfie'}
            </button>
            <button type="button" onClick={() => docRef.current?.click()}
              className="btn btn-outline !py-3 w-full">
              <FileImage size={16} /> {doc ? '✓ Document added' : 'Photo of your document'}
            </button>
            <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden"
              onChange={e => setSelfie(e.target.files?.[0] ?? null)} />
            <input ref={docRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => setDoc(e.target.files?.[0] ?? null)} />
          </div>
          <button onClick={submit} disabled={!selfie || !doc || phase === 'submitting'}
            className="btn btn-primary w-full !py-3">
            {phase === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Verify my identity
          </button>
          <p className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>
            Checked against official records by IDVero, Agodi’s identity infrastructure.
            Photos are used only for this verification.
          </p>
        </>
      )}
      {error ? (
        <p className="text-[13px] rounded-xl p-3" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>{error}</p>
      ) : null}
    </div>
  );
}
