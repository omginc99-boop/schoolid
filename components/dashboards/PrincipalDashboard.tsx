import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge, Avatar } from '@/components/ui/primitives';
import { TrendAreaChart } from '@/components/ui/charts';
import { formatMoney, pct } from '@/lib/format';
import { Users, GraduationCap, ClipboardCheck, Wallet, AlertTriangle, HeartHandshake } from 'lucide-react';

export default async function PrincipalDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;
  const currency = ctx.school?.currency ?? 'NGN';

  const [studentsQ, staffQ, attendanceQ, invoicesQ, incidentsQ, wellbeingQ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('school_id', sid).eq('role', 'student').eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('school_id', sid).eq('status', 'active')
      .in('role', ['teacher', 'school_admin', 'finance', 'librarian', 'transport', 'security', 'counselor', 'registrar']),
    supabase.from('attendance')
      .select('student_profile_id, date, status, profiles!attendance_student_profile_id_fkey(people(full_name))')
      .eq('school_id', sid)
      .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
      .limit(3000),
    supabase.from('invoices').select('total, status, payments(amount)').eq('school_id', sid),
    supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('school_id', sid).eq('status', 'open'),
    supabase.from('wellbeing_cases').select('risk').eq('school_id', sid).eq('status', 'open'),
  ]);

  const attendance = attendanceQ.data ?? [];
  const presentish = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendancePct = pct(presentish, attendance.length);

  // Attendance trend by day
  const byDay = new Map<string, { present: number; total: number }>();
  for (const a of attendance) {
    const d = byDay.get(a.date) ?? { present: 0, total: 0 };
    d.total += 1;
    if (a.status === 'present' || a.status === 'late') d.present += 1;
    byDay.set(a.date, d);
  }
  const trend = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      day: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      rate: pct(v.present, v.total),
    }));

  // At-risk students: attendance below 75% over the window
  const byStudent = new Map<string, { name: string; present: number; total: number }>();
  for (const a of attendance) {
    const name = (a.profiles as { people?: { full_name?: string } } | null)?.people?.full_name ?? 'Student';
    const s = byStudent.get(a.student_profile_id) ?? { name, present: 0, total: 0 };
    s.total += 1;
    if (a.status === 'present' || a.status === 'late') s.present += 1;
    byStudent.set(a.student_profile_id, s);
  }
  const atRisk = [...byStudent.values()]
    .map(s => ({ ...s, rate: pct(s.present, s.total) }))
    .filter(s => s.total >= 5 && s.rate < 75)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 6);

  const invoices = invoicesQ.data ?? [];
  const invoiced = invoices.reduce((s, i) => s + i.total, 0);
  const collected = invoices.reduce(
    (s, i) => s + ((i.payments ?? []) as { amount: number }[]).reduce((p, x) => p + x.amount, 0), 0);
  const collectionPct = pct(collected, invoiced);

  const wellbeing = wellbeingQ.data ?? [];
  const highRisk = wellbeing.filter(w => w.risk === 'high' || w.risk === 'critical').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {ctx.school?.name} · the whole school, at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students enrolled" value={studentsQ.count ?? 0} icon={GraduationCap} />
        <StatCard label="Staff" value={staffQ.count ?? 0} icon={Users} />
        <StatCard label="Attendance (30d)" value={attendance.length ? `${attendancePct}%` : '—'}
          icon={ClipboardCheck} tone={attendancePct >= 90 ? 'ok' : attendancePct >= 75 ? 'warn' : 'bad'} />
        <StatCard label="Fees collected" value={`${collectionPct}%`}
          sub={`${formatMoney(collected, currency)} of ${formatMoney(invoiced, currency)}`}
          icon={Wallet} tone={collectionPct >= 80 ? 'ok' : collectionPct >= 50 ? 'warn' : 'bad'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Attendance trend — last 30 days" className="lg:col-span-2">
          {trend.length ? (
            <TrendAreaChart data={trend} xKey="day" yKey="rate" suffix="%" />
          ) : (
            <EmptyState icon={ClipboardCheck} message="No attendance recorded yet" />
          )}
        </PanelCard>

        <div className="space-y-5">
          <PanelCard title="Open flags">
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle size={15} style={{ color: 'var(--warning)' }} /> Discipline incidents
                </span>
                <span className="font-bold">{incidentsQ.count ?? 0}</span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm font-medium flex items-center gap-2">
                  <HeartHandshake size={15} style={{ color: 'var(--brand)' }} /> Wellbeing cases
                </span>
                <span className="font-bold">{wellbeing.length}</span>
              </li>
              {highRisk > 0 ? (
                <li className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--danger-soft)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>High-risk cases</span>
                  <span className="font-bold" style={{ color: 'var(--danger)' }}>{highRisk}</span>
                </li>
              ) : null}
            </ul>
          </PanelCard>
        </div>
      </div>

      <PanelCard title="Students needing attention — attendance below 75%">
        {atRisk.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Attendance</th><th>Days recorded</th><th>Status</th></tr></thead>
              <tbody>
                {atRisk.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size={28} />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${s.rate < 60 ? 'badge-bad' : 'badge-warn'}`}>{s.rate}%</span></td>
                    <td style={{ color: 'var(--muted)' }}>{s.total}</td>
                    <td><StatusBadge status={s.rate < 60 ? 'high' : 'medium'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ClipboardCheck} message="No at-risk students"
            hint="Students with attendance under 75% will surface here automatically." />
        )}
      </PanelCard>
    </div>
  );
}
