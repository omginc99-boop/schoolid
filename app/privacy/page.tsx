import Link from 'next/link';
import type { Metadata } from 'next';
import Logo, { LogoMark } from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SchoolID collects, uses and protects personal information for schools, staff, parents and students.',
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{children}</p>;
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="btn btn-outline">Back to SchoolID</Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-14">
        <p className="badge badge-brand w-fit mb-4">Privacy</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Effective November 11, 2026 · Applies to schools-id.com and the SchoolID apps on web, iOS and Android (together, the &ldquo;Platform&rdquo;)
        </p>

        <div className="rounded-xl p-5 mb-8" style={{ border: '1px solid var(--border)', background: 'var(--brand-soft)' }}>
          <p className="font-semibold mb-2 flex items-center gap-2">
            <LogoMark size={18} /> The short version
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm" style={{ color: 'var(--text)' }}>
            <li>Your school controls student, staff and parent records. SchoolID processes that data on the school&rsquo;s behalf &mdash; we don&rsquo;t decide what&rsquo;s collected or why.</li>
            <li>We never sell personal information, and we don&rsquo;t run advertising or build ad profiles of students.</li>
            <li>Government ID and biometric identity checks only happen through our verification partners, and only when separately consented to.</li>
            <li>Wellbeing and counselling records are restricted at the database level to counsellors and the principal &mdash; no one else at the school can read them.</li>
            <li>You, or your parent/guardian, can ask your school &mdash; or us directly &mdash; to access, correct or delete your information.</li>
          </ul>
        </div>

        <P>
          SchoolID is built by Agodi Technologies (&ldquo;Agodi Technologies,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), operating through its South African and Nigerian entities, as a digital operating system for schools, colleges and universities. This policy explains what personal information we process, why, and the choices you and your school have about it.
        </P>

        <H2>1. Who is responsible for your data</H2>
        <P>
          Schools sign up for SchoolID, enrol their own students and staff, and decide what records to keep. In data-protection terms, your <strong>school is the data controller</strong> for student, parent and staff information: it determines what is collected and for what purpose, consistent with its own enrolment and consent processes. Agodi Technologies acts as the <strong>data processor / service provider</strong>. We operate the Platform on the school&rsquo;s instructions and don&rsquo;t use student or staff data for our own independent purposes.
        </P>
        <P>
          Where applicable, we rely on the institutional service-provider basis recognised for schools (comparable to FERPA&rsquo;s &ldquo;school official&rdquo; exception in the US), on South Africa&rsquo;s Protection of Personal Information Act (POPIA), and on Nigeria&rsquo;s Data Protection Act / NDPR, depending on where a school operates.
        </P>

        <H2>2. Who uses SchoolID</H2>
        <P>
          Every account on the Platform &mdash; student, parent/guardian, teacher, administrator, counsellor, finance, library, transport, security or principal &mdash; is created and managed by the school, not self-registered from the public internet. Students do not sign themselves up; their school issues their account as part of enrolment.
        </P>

        <H2>3. Information we collect</H2>

        <H3>Identity &amp; contact information</H3>
        <P>Full name, date of birth, gender, nationality, photo, email address and phone number, as entered by the school.</P>

        <H3>Government ID &amp; verified identity</H3>
        <P>
          Some schools choose to verify a person&rsquo;s government-issued ID (national ID, passport) or a biometric selfie match as part of enrolment or staff vetting. This is performed by our identity-verification partners, <strong>AfriID</strong> and <strong>IDVero</strong>, and only proceeds where the record carries an explicit, separately tracked consent flag. We do not run ID or biometric verification silently in the background.
        </P>

        <H3>School-issued digital ID</H3>
        <P>A unique SchoolID number and QR token used for attendance, library, transport and gate-access verification on campus.</P>

        <H3>Academic records</H3>
        <P>Attendance, assignments, exam results, timetable and class/enrolment history.</P>

        <H3>Financial records</H3>
        <P>
          Fee structures, invoices and payment records logged by the school&rsquo;s finance staff. Where a school enables online fee payment, card and payment details are handled directly by a licensed payment processor &mdash; SchoolID does not store full card numbers.
        </P>

        <H3>Library &amp; transport records</H3>
        <P>Book loans and returns; bus routes, stops and pickup manifests.</P>

        <H3>Security &amp; campus records</H3>
        <P>Visitor logs and gate entry/exit logs recorded by campus security staff.</P>

        <H3>Incident reports &amp; wellbeing records</H3>
        <P>
          Disciplinary/incident reports, and &mdash; the most sensitive category on the Platform &mdash; wellbeing and counselling case notes. These carry the strictest access control of any record type: only a school&rsquo;s counsellor and principal accounts can read them, enforced at the database level, not just in the app&rsquo;s interface.
        </P>

        <H3>Communications &amp; AI assistant use</H3>
        <P>
          In-app messages and announcements sent through the Platform. If a user chats with one of SchoolID&rsquo;s AI features (tutoring, lesson planning, report writing and similar), their message content, role and school name are sent to our AI provider, Anthropic, to generate a response. Under Anthropic&rsquo;s standard API terms, this data is not used to train their models.
        </P>

        <H3>Technical data</H3>
        <P>Standard server logs (IP address, device/browser type, timestamps) and an internal audit trail of account actions, kept for security and troubleshooting.</P>

        <H2>4. How we use information</H2>
        <P>
          To operate the Platform and each role&rsquo;s features; to secure accounts and investigate misuse (via the audit trail); to send transactional email (account, invoice and notification emails, via our provider Resend &mdash; we don&rsquo;t send marketing email without consent); to generate AI responses when a user chooses to use an AI feature; to improve the product using aggregated, de-identified usage patterns; and to comply with legal obligations.
        </P>

        <H2>5. Children&rsquo;s data &amp; student accounts</H2>
        <P>
          Many people on SchoolID are minors. Student accounts are provisioned by the school as part of enrolment, under the consent and enrolment agreement the school already has with parents/guardians &mdash; students do not independently sign up from the open internet, and we do not collect information from children outside the school&rsquo;s enrolment process.
        </P>
        <P>
          We do not run behavioural advertising, build advertising profiles of students, or sell any student data, to anyone, ever. A parent or guardian can ask their school &mdash; or contact us directly &mdash; to review, correct or request deletion of their child&rsquo;s information at any time.
        </P>

        <H2>6. Who we share information with</H2>
        <P>We use a small number of service providers to operate the Platform, each only for the purpose described:</P>
        <ul className="list-disc pl-5 space-y-1.5 mb-3 text-sm" style={{ color: 'var(--muted)' }}>
          <li><strong>Supabase</strong> &mdash; database hosting and authentication infrastructure.</li>
          <li><strong>Resend</strong> &mdash; transactional email delivery (welcome emails, notifications).</li>
          <li><strong>AfriID &amp; IDVero</strong> &mdash; government ID and biometric identity verification, only for records a school chooses to verify.</li>
          <li><strong>Anthropic</strong> &mdash; generates responses for SchoolID&rsquo;s AI features, only when a user actively uses them.</li>
        </ul>
        <P>
          We do not sell personal information, and we do not share it with advertisers or data brokers. We may disclose information if required by law, or to protect the safety of a student, staff member or the public.
        </P>

        <H2>7. Data security</H2>
        <P>
          Access to every record is governed by row-level database policies scoped to a person&rsquo;s role and school &mdash; a teacher cannot read another school&rsquo;s records, and wellbeing/counselling records are restricted to counsellors and the principal only. Sensitive actions are written to an append-only audit log. Data is encrypted in transit (HTTPS/TLS) and at rest.
        </P>

        <H2>8. Data retention</H2>
        <P>
          Schools control how long academic and administrative records are kept, consistent with their own policies and any applicable record-keeping law. When a school closes an account or requests deletion, we remove the data within a reasonable period unless we&rsquo;re required to keep it for longer by law.
        </P>

        <H2>9. Your rights</H2>
        <P>
          Depending on where you or your school are located, you may have rights to access, correct, delete or receive a copy of your personal information, to object to or restrict certain processing, and to lodge a complaint with your local data-protection authority (for example, the Information Regulator in South Africa, or the Nigeria Data Protection Commission). Start with your school&rsquo;s administrator, since they control enrolment records &mdash; they can also loop us in directly, or you can email us at the address below.
        </P>

        <H2>10. Cookies</H2>
        <P>
          We use only essential session and authentication cookies needed to keep you signed in. We don&rsquo;t use third-party advertising or analytics cookies.
        </P>

        <H2>11. International data transfers</H2>
        <P>
          Agodi Technologies operates across Africa, and the infrastructure providers listed above may process data outside the country where your school is located. Data is only shared with the providers listed in this policy, under their own security and confidentiality commitments.
        </P>

        <H2>12. Changes to this policy</H2>
        <P>
          We&rsquo;ll update the effective date above when this policy changes, and we&rsquo;ll notify school administrators directly of any material change.
        </P>

        <H2>13. Contact us</H2>
        <P>
          Questions, or a request to access, correct or delete personal information: <a href="mailto:info@agoditechnologies.com" style={{ color: 'var(--brand)' }}>info@agoditechnologies.com</a>.
        </P>
      </article>

      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--muted)' }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span>SchoolID &mdash; an <span className="font-semibold">Agodi Technologies</span> product</span>
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
