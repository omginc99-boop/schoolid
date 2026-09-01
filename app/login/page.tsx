'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { AlertCircle, Loader2, LogIn, UserPlus } from 'lucide-react';

function SetupNotice() {
  return (
    <div className="card p-6 mt-6 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
      <p className="font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <AlertCircle size={16} style={{ color: 'var(--warning)' }} /> Database not connected yet
      </p>
      <p className="mt-2">
        SchoolID needs a Supabase project before anyone can sign in. Three steps:
      </p>
      <ol className="list-decimal ml-5 mt-2 space-y-1">
        <li>Create a project at supabase.com, then run <code className="font-mono">supabase/schema.sql</code> and <code className="font-mono">seed.sql</code> in the SQL Editor.</li>
        <li>Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="font-mono">.env.local</code> (and Vercel).</li>
        <li>Restart the app. Sign up with a seeded email (e.g. <code className="font-mono">principal@demo.schoolid.africa</code>) to explore Demo Academy.</li>
      </ol>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    params.get('unlinked')
      ? 'Your account is not linked to any school profile yet. Ask your school administrator to add you (with this email), or register a new school.'
      : null,
  );
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      if (data.session) {
        // The dashboard page sends the welcome email itself on first load —
        // it fires regardless of which signup path got someone here.
        router.push('/dashboard');
        router.refresh();
      } else {
        setNotice(
          'Account created. We sent a confirmation link to your email — open it, then come back and sign in. ' +
          'If it does not arrive within a few minutes, check your spam folder or ask your school to confirm your account.',
        );
        setMode('signin');
        setBusy(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 h-16 max-w-6xl mx-auto w-full">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Join your school on SchoolID'}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
              {mode === 'signin'
                ? 'One login for every role — SchoolID opens the right dashboard for you.'
                : 'Use the email address your school has for you. Your profile links itself, and your dashboard — student, parent, teacher or staff — opens automatically.'}
            </p>

            {notice ? (
              <p className="mt-4 text-sm rounded-xl p-3" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                {notice}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm rounded-xl p-3 flex items-start gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
              </p>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email" type="email" required className="input mt-1.5"
                  placeholder="you@school.edu" value={email}
                  onChange={e => setEmail(e.target.value)} disabled={!configured || busy}
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password" type="password" required minLength={8} className="input mt-1.5"
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} disabled={!configured || busy}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full !py-3" disabled={!configured || busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className="mt-5 text-sm text-center" style={{ color: 'var(--muted)' }}>
              {mode === 'signin' ? (
                <>New here?{' '}
                  <button className="font-semibold hover:opacity-70" style={{ color: 'var(--brand)' }}
                    onClick={() => { setMode('signup'); setError(null); }}>
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button className="font-semibold hover:opacity-70" style={{ color: 'var(--brand)' }}
                    onClick={() => { setMode('signin'); setError(null); }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--muted)' }}>
            Running a school?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--brand)' }}>
              Register it on SchoolID
            </Link>
          </p>

          {!configured || params.get('setup') ? <SetupNotice /> : null}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
