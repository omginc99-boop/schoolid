import Link from 'next/link';
import Logo, { LogoMark } from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROLE_LIST } from '@/lib/roles';
import {
  ArrowRight, Sparkles, QrCode, ShieldCheck, Wallet, MessageSquare,
  CalendarDays, ClipboardCheck, BookOpen, Bus, Library, Award,
  BarChart3, Fingerprint, Check, GraduationCap, Building2,
} from 'lucide-react';

const STAGES = [
  'Nursery', 'Primary', 'Secondary', 'Colleges', 'Universities',
  'Nursing Schools', 'Law Schools', 'Technical Colleges', 'Vocational', 'Corporate Academies',
];

const MODULES = [
  { icon: ClipboardCheck, name: 'Attendance', desc: 'One-tap registers, instant parent visibility' },
  { icon: BookOpen, name: 'Academics & Exams', desc: 'Gradebook, assignments, results, transcripts' },
  { icon: Wallet, name: 'Fees & Payments', desc: 'Invoices, installments, online payments, receipts' },
  { icon: CalendarDays, name: 'Timetable & Calendar', desc: 'Clash-free scheduling, events, terms' },
  { icon: QrCode, name: 'Digital Identity', desc: 'Verified QR ID cards for every person' },
  { icon: MessageSquare, name: 'Communication', desc: 'Announcements, chat, emergency alerts' },
  { icon: Library, name: 'Library', desc: 'Catalogue, lending, returns, fines' },
  { icon: Bus, name: 'Transport', desc: 'Routes, stops, pickup manifests' },
  { icon: ShieldCheck, name: 'Security', desc: 'Visitor management, QR gate verification' },
  { icon: Award, name: 'Certificates & Alumni', desc: 'Verifiable awards, graduation, lifelong records' },
  { icon: BarChart3, name: 'Analytics', desc: 'Enrollment, performance and revenue insight' },
  { icon: Sparkles, name: 'AI Everywhere', desc: 'Tutoring, lesson plans, reports, early warnings' },
];

const AI_FEATURES = [
  ['AI Tutor', 'Every student gets a patient teacher, any hour'],
  ['AI Lesson Planner', 'A full lesson plan from one sentence'],
  ['AI Exam Generator', 'Question papers with marking schemes'],
  ['AI Report Writer', 'Grades and notes become polished comments'],
  ['AI Risk Detection', 'Attendance and grade dips flagged early'],
  ['AI School Analytics', 'Ask your school anything, in plain language'],
];

const TIERS = [
  {
    name: 'Starter', price: 'Free', period: 'first term',
    features: ['Up to 200 students', 'Attendance & academics', 'Digital ID cards', 'Parent portal', 'Community support'],
    cta: 'Start free', highlight: false,
  },
  {
    name: 'Growth', price: '$1.50', period: 'per student / term',
    features: ['Unlimited students', 'All modules incl. fees & payments', 'AI features included', 'WhatsApp & SMS add-ons', 'Priority support'],
    cta: 'Choose Growth', highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'universities & groups',
    features: ['Custom domain & branding', 'Database isolation options', 'SSO & advanced compliance', 'Onboarding & SLA', 'Dedicated manager'],
    cta: 'Talk to us', highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--muted)' }}>
            <a href="#roles" className="hover:opacity-70">Roles</a>
            <a href="#modules" className="hover:opacity-70">Modules</a>
            <a href="#ai" className="hover:opacity-70">AI</a>
            <a href="#identity" className="hover:opacity-70">Identity</a>
            <a href="#pricing" className="hover:opacity-70">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn btn-outline max-sm:!hidden">Sign in</Link>
            <Link href="/register" className="btn btn-primary whitespace-nowrap">
              <span className="sm:hidden">Register</span>
              <span className="hidden sm:inline">Register your school</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <p className="badge badge-gold rise mx-auto w-fit mb-5">
          <Sparkles size={13} /> The Digital Operating System for Education
        </p>
        <h1 className="rise rise-1 text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto">
          One Platform.<br />Every School.<br />
          <span style={{ color: 'var(--brand)' }}>Every Stage.</span>
        </h1>
        <p className="rise rise-2 mt-6 text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
          Student records, learning, fees, verified identity, AI and communication —
          unified in one app for everyone in your school. From nursery to university.
        </p>
        <div className="rise rise-3 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn btn-primary !px-6 !py-3 !text-base">
            Register your school <ArrowRight size={17} />
          </Link>
          <Link href="/login" className="btn btn-outline !px-6 !py-3 !text-base">Sign in</Link>
        </div>
        <div className="rise rise-4 mt-12 flex flex-wrap justify-center gap-2">
          {STAGES.map(s => (
            <span key={s} className="badge badge-muted">{s}</span>
          ))}
        </div>
      </section>

      {/* One app, every role */}
      <section id="roles" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">One app. Twelve roles.</h2>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Everyone downloads the same app. SchoolID detects who you are at login
            and opens the dashboard built for your job.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ROLE_LIST.map(({ role, label, icon: Icon, description }) => (
            <div key={role} className="card p-5 hover:-translate-y-0.5 transition-transform">
              <div className="p-2.5 rounded-xl w-fit mb-3" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-[15px]">{label}</h3>
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-16" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Everything a school runs on</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              SIS + LMS + finance + identity + communication. Each module can be switched
              on or off per school — start small, grow into the whole OS.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="p-2.5 rounded-xl h-fit shrink-0" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  <Icon size={19} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]">{name}</h3>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="badge badge-brand w-fit mb-4"><Sparkles size={13} /> Claude-powered</p>
            <h2 className="text-3xl font-bold tracking-tight">AI woven into the school day</h2>
            <p className="mt-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Not a chatbot bolted on the side. Each role gets AI built for its job —
              tutoring that teaches instead of answering, lesson plans in seconds,
              report-card comments that sound like the teacher wrote them, and early
              warnings before a student slips through the cracks.
            </p>
            <ul className="mt-6 space-y-3">
              {AI_FEATURES.map(([name, desc]) => (
                <li key={name} className="flex gap-3 items-start">
                  <Check size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--success)' }} />
                  <p className="text-sm"><span className="font-semibold">{name}</span>
                    <span style={{ color: 'var(--muted)' }}> — {desc}</span></p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>AI Tutor · live example</p>
            <div className="space-y-3">
              <div className="rounded-2xl rounded-br-md p-3.5 text-sm ml-8" style={{ background: 'var(--brand)', color: '#fff' }}>
                I don&apos;t understand fractions 😩
              </div>
              <div className="rounded-2xl rounded-bl-md p-3.5 text-sm mr-8" style={{ background: 'var(--surface-2)' }}>
                No wahala — let&apos;s use suya sticks! 🍢 If you buy 8 sticks and share them
                equally with your friend, you each get 4. That&apos;s ½ of 8 = 4.
                <br /><br />Now you try: what is ½ of 10 sticks?
              </div>
              <div className="rounded-2xl rounded-br-md p-3.5 text-sm ml-8" style={{ background: 'var(--brand)', color: '#fff' }}>
                5!
              </div>
              <div className="rounded-2xl rounded-bl-md p-3.5 text-sm mr-8" style={{ background: 'var(--surface-2)' }}>
                Exactly right! 🎉 You just did fractions. Ready for ⅓?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity */}
      <section id="identity" className="py-16" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-10 items-center">
          {/* ID card mock */}
          <div className="mx-auto w-full max-w-sm">
            <div className="card overflow-hidden">
              <div className="p-5 flex items-center gap-3" style={{ background: 'var(--brand)' }}>
                <LogoMark size={30} />
                <div className="text-white">
                  <p className="font-bold leading-tight">Demo Academy</p>
                  <p className="text-xs opacity-80">Student Identity Card</p>
                </div>
              </div>
              <div className="p-5 flex gap-4">
                <div className="w-20 h-24 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
                  style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>CO</div>
                <div className="min-w-0">
                  <p className="font-bold text-lg leading-tight">Chidera Okafor</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>JSS 1A Student</p>
                  <p className="font-mono text-sm mt-2">SID-DEM-00013</p>
                  <span className="badge badge-gold mt-2"><ShieldCheck size={12} /> Verified</span>
                </div>
                <div className="ml-auto p-1.5 rounded-lg shrink-0 h-fit" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                  <QrCode size={44} color="#0e1330" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="badge badge-gold w-fit mb-4"><Fingerprint size={13} /> The identity layer</p>
            <h2 className="text-3xl font-bold tracking-tight">A verified SchoolID for every person</h2>
            <p className="mt-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Students, parents, teachers, drivers, security — every person gets a unique,
              QR-verifiable digital ID. Gates scan it. Certificates carry it. Records follow it.
            </p>
            <p className="mt-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
              And it&apos;s built for life: when a student graduates, their SchoolID can migrate
              into a <span className="font-semibold" style={{ color: 'var(--text)' }}>Citizen ID</span> —
              with the person&apos;s explicit consent controlling exactly what carries over.
              First stage of a lifelong digital identity. No starting over, ever.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="badge badge-brand"><QrCode size={12} /> QR verification</span>
              <span className="badge badge-brand"><GraduationCap size={12} /> Lifelong records</span>
              <span className="badge badge-brand"><Building2 size={12} /> Gate & visitor security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Simple, per-student pricing</h2>
          <p className="mt-3" style={{ color: 'var(--muted)' }}>Start free. Pay as you grow. Cancel any term.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {TIERS.map(tier => (
            <div key={tier.name}
              className="card p-6 flex flex-col"
              style={tier.highlight ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 1px var(--brand), var(--shadow)' } : undefined}>
              {tier.highlight ? <span className="badge badge-brand w-fit mb-3">Most popular</span> : null}
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="mt-2"><span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-sm ml-1.5" style={{ color: 'var(--muted)' }}>{tier.period}</span></p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-sm items-start">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--success)' }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`btn mt-6 ${tier.highlight ? 'btn-primary' : 'btn-outline'}`}>{tier.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="card p-10 md:p-14 text-center" style={{ background: 'var(--brand)', border: 'none' }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Bring your school onto SchoolID today</h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">Register in minutes. Enroll your first class this week. Your parents will thank you.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn !bg-white !text-[#3730a3] !px-6 !py-3 !text-base font-bold">
              Register your school <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--muted)' }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span>SchoolID — an <span className="font-semibold">Agodi Technologies</span> product</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:opacity-70">Privacy Policy</Link>
            <a href="mailto:info@agoditechnologies.com" className="hover:opacity-70">info@agoditechnologies.com</a>
            <a href="https://agoditechnologies.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">agoditechnologies.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
