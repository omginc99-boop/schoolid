import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import type { AdmissionStatus } from '@/lib/types';
import { ScrollText, Award, GraduationCap, Inbox } from 'lucide-react';

const PIPELINE: { status: AdmissionStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'review', label: 'In review' },
  { status: 'interview', label: 'Interview' },
  { status: 'admitted', label: 'Admitted' },
  { status: 'rejected', label: 'Rejected' },
];

export default async function RegistrarDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;

  const [applicationsQ, certificatesQ, alumniQ] = await Promise.all([
    supabase.from('admissions_applications')
      .select('id, applicant_name, guardian_name, guardian_phone, desired_level, status, submitted_at')
      .eq('school_id', sid)
      .order('submitted_at', { ascending: false }).limit(30),
    supabase.from('certificates')
      .select('id, title, kind, serial, issued_on, profiles!certificates_student_profile_id_fkey(people(full_name))')
      .eq('school_id', sid)
      .order('issued_on', { ascending: false }).limit(8),
    supabase.from('alumni').select('id', { count: 'exact', head: true }).eq('school_id', sid),
  ]);

  const applications = applicationsQ.data ?? [];
  const counts = Object.fromEntries(
    PIPELINE.map(p => [p.status, applications.filter(a => a.status === p.status).length]),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrar</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Admissions, certificates and alumni for {ctx.school?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={applications.length} icon={Inbox} />
        <StatCard label="Awaiting action" value={(counts.pending ?? 0) + (counts.review ?? 0)}
          icon={ScrollText} tone={(counts.pending ?? 0) > 0 ? 'warn' : 'ok'} />
        <StatCard label="Admitted" value={counts.admitted ?? 0} icon={GraduationCap} tone="ok" />
        <StatCard label="Alumni" value={alumniQ.count ?? 0} icon={Award} tone="gold" />
      </div>

      {/* Pipeline */}
      <PanelCard title="Admissions pipeline">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PIPELINE.map(p => (
            <div key={p.status} className="p-4 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
              <p className="text-2xl font-bold">{counts[p.status] ?? 0}</p>
              <p className="text-xs font-medium mt-1" style={{ color: 'var(--muted)' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </PanelCard>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Applications" className="lg:col-span-2">
          {applications.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Applicant</th><th>Level</th><th>Guardian</th><th>Submitted</th><th>Status</th></tr></thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.applicant_name}</td>
                      <td>{a.desired_level}</td>
                      <td style={{ color: 'var(--muted)' }}>
                        {a.guardian_name}
                        <span className="block text-xs">{a.guardian_phone}</span>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{formatDate(a.submitted_at)}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Inbox} message="No applications yet" />
          )}
        </PanelCard>

        <PanelCard title="Certificates issued">
          {(certificatesQ.data ?? []).length ? (
            <ul className="space-y-3">
              {(certificatesQ.data ?? []).map(c => (
                <li key={c.id} className="p-3 rounded-xl" style={{ background: 'var(--gold-soft)' }}>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                    <Award size={14} /> {c.title}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {(c.profiles as { people?: { full_name?: string } } | null)?.people?.full_name}
                    {' · '}{formatDate(c.issued_on)}
                  </p>
                  <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>{c.serial}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Award} message="No certificates issued" />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
