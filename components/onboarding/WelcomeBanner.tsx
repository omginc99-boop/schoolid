'use client';

// First-login greeting. Tells a new person what SchoolID is for *them* and
// the two or three things worth doing first. Dismissed per person, per device.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface Step { label: string; href: string }

const GREETINGS: Record<UserRole, { line: string; steps: Step[] }> = {
  student: {
    line: 'Everything about your school life lives here — your timetable, homework, results and your digital ID.',
    steps: [
      { label: 'See your ID card', href: '/dashboard/id' },
      { label: 'Ask the AI Tutor', href: '/dashboard/ai' },
    ],
  },
  parent: {
    line: 'Every child, in one place. Tap a child to see attendance, results and fees — and message their teacher any time.',
    steps: [
      { label: 'Message a teacher', href: '/dashboard/messages' },
      { label: 'Read school news', href: '/dashboard/announcements' },
    ],
  },
  teacher: {
    line: 'Your classes, your register and your marking — plus AI that writes lesson plans and report comments for you.',
    steps: [
      { label: 'Take today’s register', href: '/dashboard/attendance' },
      { label: 'Plan a lesson with AI', href: '/dashboard/ai' },
    ],
  },
  principal: {
    line: 'The whole school at a glance — enrollment, attendance, fee collection, and the students who need attention first.',
    steps: [
      { label: 'Publish an announcement', href: '/dashboard/announcements' },
      { label: 'Ask AI about your school', href: '/dashboard/ai' },
    ],
  },
  school_admin: {
    line: 'You run the school’s records. Start by building the year, then bring your people on board.',
    steps: [
      { label: 'Set up the school year', href: '/dashboard/setup' },
      { label: 'Add students & staff', href: '/dashboard/students' },
    ],
  },
  finance: {
    line: 'Fees, invoices and collection — see exactly what has come in and what is still outstanding.',
    steps: [{ label: 'Announce a fee reminder', href: '/dashboard/announcements' }],
  },
  librarian: {
    line: 'Your catalogue, loans and overdue books — with every borrower verified by their SchoolID.',
    steps: [{ label: 'See your SchoolID', href: '/dashboard/id' }],
  },
  transport: {
    line: 'Your routes, stops and pickup manifests — so every child is accounted for.',
    steps: [{ label: 'See your SchoolID', href: '/dashboard/id' }],
  },
  security: {
    line: 'The gate is yours. Scan any SchoolID QR to verify who a person is before they come in.',
    steps: [{ label: 'Verify a SchoolID', href: '/dashboard' }],
  },
  counselor: {
    line: 'Your wellbeing caseload — visible only to you and the principal, and to nobody else.',
    steps: [{ label: 'Get AI risk insights', href: '/dashboard/ai' }],
  },
  registrar: {
    line: 'Admissions, certificates and alumni — the school’s official record keeper.',
    steps: [
      { label: 'Add students', href: '/dashboard/students' },
      { label: 'Set up the year', href: '/dashboard/setup' },
    ],
  },
  super_admin: {
    line: 'Every school, subscription and audit trail on the SchoolID platform.',
    steps: [{ label: 'See the platform ID', href: '/dashboard/id' }],
  },
};

export default function WelcomeBanner({
  profileId, role, firstName, schoolName, schoolidNumber,
}: {
  profileId: string; role: UserRole; firstName: string;
  schoolName: string; schoolidNumber: string;
}) {
  const [show, setShow] = useState(false);
  const key = `schoolid-welcome-${profileId}`;

  useEffect(() => {
    try { setShow(localStorage.getItem(key) !== 'seen'); }
    catch { setShow(true); }
  }, [key]);

  function dismiss() {
    try { localStorage.setItem(key, 'seen'); } catch { /* private mode */ }
    setShow(false);
  }

  if (!show) return null;
  const g = GREETINGS[role] ?? GREETINGS.student;

  return (
    <section className="card p-5 md:p-6 relative overflow-hidden rise"
      style={{ background: 'var(--brand)', border: 'none' }}>
      <button onClick={dismiss} aria-label="Dismiss welcome message"
        className="absolute top-3 right-3 p-2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
        <X size={15} />
      </button>

      <p className="badge mb-3 w-fit" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
        <Sparkles size={12} /> Welcome to SchoolID
      </p>

      <h2 className="text-xl md:text-2xl font-bold text-white">
        Welcome, {firstName} 👋
      </h2>
      <p className="text-white/85 text-sm mt-1.5 max-w-2xl leading-relaxed">
        You&apos;re signed in to <strong className="text-white">{schoolName}</strong> as{' '}
        <strong className="text-white">{roleMeta(role).label}</strong>. {g.line}
      </p>

      <p className="text-white/70 text-[13px] mt-3">
        Your SchoolID is <span className="font-mono text-white">{schoolidNumber}</span> — it&apos;s yours for life.
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        {g.steps.map(s => (
          <Link key={s.href} href={s.href}
            className="btn !bg-white !text-[#3730a3] !py-2 !px-4 !text-[13px] font-bold">
            {s.label} <ArrowRight size={14} />
          </Link>
        ))}
        <button onClick={dismiss} className="btn !py-2 !px-4 !text-[13px]"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'transparent' }}>
          Got it
        </button>
      </div>
    </section>
  );
}
