'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import type { SchoolType } from '@/lib/types';
import { AFRICAN_CURRENCIES, INTERNATIONAL_CURRENCIES, currencyForCountry } from '@/lib/currencies';
import { AlertCircle, Building2, Loader2 } from 'lucide-react';

const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
  { value: 'nursery', label: 'Nursery School' },
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'college', label: 'College' },
  { value: 'university', label: 'University' },
  { value: 'nursing_school', label: 'Nursing School' },
  { value: 'law_school', label: 'Law School' },
  { value: 'technical_college', label: 'Technical College' },
  { value: 'vocational', label: 'Vocational Institution' },
  { value: 'corporate_academy', label: 'Corporate Academy' },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

export default function RegisterSchoolPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  // account fields (shown when not signed in)
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // school fields
  const [schoolName, setSchoolName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<SchoolType>('secondary');
  const [country, setCountry] = useState('Nigeria');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [currencyTouched, setCurrencyTouched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) { setChecking(false); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setChecking(false);
    });
  }, [configured]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    try {
      if (!signedIn) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw new Error(signUpError.message);
        if (!data.session) {
          setError(
            'Account created, but your project requires email confirmation. Confirm your email, sign in, then return to this page to finish registering your school.',
          );
          setBusy(false);
          return;
        }
      }

      const { data: schoolId, error: rpcError } = await supabase.rpc('register_school', {
        p_name: schoolName,
        p_slug: slug || slugify(schoolName),
        p_type: type,
        p_admin_name: adminName || 'School Administrator',
        p_country: country,
        p_city: city,
        p_currency: currency,
      });
      if (rpcError) throw new Error(rpcError.message);
      if (!schoolId) throw new Error('School registration failed — please try again.');

      // Fire-and-forget: a welcome-email hiccup must never block onboarding.
      fetch('/api/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId }),
      }).catch(() => {});

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 h-16 max-w-6xl mx-auto w-full">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-lg">
          <div className="card p-8">
            <div className="p-2.5 rounded-xl w-fit mb-4" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
              <Building2 size={22} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Register your school</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
              You become the school administrator — then enroll students, invite staff,
              and issue everyone a verified SchoolID.
            </p>

            {!configured ? (
              <p className="mt-4 text-sm rounded-xl p-3 flex items-start gap-2" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                Database not connected yet — see the setup steps on the sign-in page.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm rounded-xl p-3 flex items-start gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
              </p>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {!checking && !signedIn ? (
                <fieldset className="space-y-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <legend className="text-xs font-semibold uppercase tracking-wide pb-2" style={{ color: 'var(--muted)' }}>
                    Your administrator account
                  </legend>
                  <div>
                    <label htmlFor="adminName" className="text-sm font-medium">Your full name</label>
                    <input id="adminName" required className="input mt-1.5" placeholder="e.g. Adaeze Nwosu"
                      value={adminName} onChange={e => setAdminName(e.target.value)} disabled={busy} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input id="email" type="email" required className="input mt-1.5" placeholder="you@school.edu"
                        value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
                    </div>
                    <div>
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <input id="password" type="password" required minLength={8} className="input mt-1.5" placeholder="Min. 8 characters"
                        value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
                    </div>
                  </div>
                </fieldset>
              ) : null}

              <div>
                <label htmlFor="schoolName" className="text-sm font-medium">School name</label>
                <input id="schoolName" required className="input mt-1.5" placeholder="e.g. Sunrise International College"
                  value={schoolName}
                  onChange={e => {
                    setSchoolName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  disabled={busy} />
              </div>
              <div>
                <label htmlFor="slug" className="text-sm font-medium">School URL name</label>
                <input id="slug" required pattern="[a-z0-9-]{2,40}" className="input mt-1.5 font-mono" placeholder="sunrise-college"
                  value={slug}
                  onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  disabled={busy} />
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Lowercase letters, numbers and dashes. Used in your school&apos;s links.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label htmlFor="type" className="text-sm font-medium">Type</label>
                  <select id="type" className="input mt-1.5" value={type}
                    onChange={e => setType(e.target.value as SchoolType)} disabled={busy}>
                    {SCHOOL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="country" className="text-sm font-medium">Country</label>
                  <input id="country" required className="input mt-1.5" value={country}
                    onChange={e => {
                      setCountry(e.target.value);
                      if (!currencyTouched) setCurrency(currencyForCountry(e.target.value));
                    }}
                    disabled={busy} />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <input id="city" className="input mt-1.5" placeholder="e.g. Lagos" value={city}
                    onChange={e => setCity(e.target.value)} disabled={busy} />
                </div>
              </div>
              <div>
                <label htmlFor="currency" className="text-sm font-medium">Billing currency</label>
                <select id="currency" className="input mt-1.5" value={currency}
                  onChange={e => { setCurrencyTouched(true); setCurrency(e.target.value); }}
                  disabled={busy}>
                  <optgroup label="African currencies">
                    {AFRICAN_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>
                    ))}
                  </optgroup>
                  <optgroup label="International">
                    {INTERNATIONAL_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Auto-matched to your country — every fee, invoice and dashboard uses this currency.
                </p>
              </div>

              <button type="submit" className="btn btn-primary w-full !py-3" disabled={!configured || busy || checking}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
                Create my school
              </button>
            </form>
          </div>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--muted)' }}>
            Already on SchoolID?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
