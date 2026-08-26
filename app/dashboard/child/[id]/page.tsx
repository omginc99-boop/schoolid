// Full tracking view for one student: attendance history, results, fees and
// conduct. Parents reach it for their own children, staff for any student in
// their school — RLS decides, so an unauthorised id simply returns nothing.
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { StatCard, PanelCard, EmptyState, StatusBadge, Avatar, ProgressRing } from '@/components/ui/primitives';
import { TrendAreaChart } from '@/components/ui/charts';
import { formatDate, formatMoney, pct } from '@/lib/format';
import {
  ClipboardCheck, Trophy, Wallet, ArrowLeft, FileText, AlertTriangle, QrCode,
} from 'lucide-react';

export const metadata = { title: 'Student tracking' };

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();
  const supabase = await createClient();
  const currency = ctx.school?.currency ?? 'NGN';

  const { data: student } = await supabase
    .from('profiles')
    .select('id, schoolid_number, email, verification_status, title, people(full_name, photo_url)')
    .eq('id', id)
    .maybeSingle();
  if (!student) notFound();

  const [enrollmentQ, attendanceQ, resultsQ, invoicesQ, incidentsQ] = await Promise.all([
    supabase.from('enrollments').select('classes(name, level)').eq('student_profile_id', id).eq('status', 'active').maybeSingle(),
    supabase.from('attendance').select('date, status').eq('student_profile_id', id).order('date', { ascending: false }).limit(120),
    supabase.from('exam_results').select('score, max_score, grade_letter, remark, subjects(name)').eq('student_profile_id', id).limit(40),
    supabase.from('invoices').select('id, number, status, due_on, total, payments(amount)').eq('student_profile_id', id),
    supabase.from('incidents').select('category, description, status, occurred_on').eq('student_profile_id', id).order('occurred_on', { ascending: false }).limit(6),
  ]);

  const name = (student.people as { full_name?: string } | null)?.full_name ?? 'Student';
  const photo = (student.people as { photo_url?: string } | null)?.photo_url ?? null;
  const className = (enrollmentQ.data?.classes as { name?: string } | null)?.name ?? 'Not enrolled';

  const attendance = attendanceQ.data ?? [];
  const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendancePct = pct(present, attendance.length);

  // Weekly attendance rate, oldest → newest
  const byWeek = new Map<string, { p: number; t: number }>();
  for (const a of [...attendance].reverse()) {
    const d = new Date(a.date);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const cur = byWeek.get(key) ?? { p: 0, t: 0 };
    cur.t += 1;
    if (a.status === 'present' || a.status === 'late') cur.p += 1;
    byWeek.set(key, cur);
  }
  const trend = [...byWeek.entries()].slice(-12).map(([week, v]) => ({
    week: new Date(week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    rate: pct(v.p, v.t),
  }));

  const results = resultsQ.data ?? [];
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / results.length)
    : null;

  const invoices = invoicesQ.data ?? [];
  const balance = invoices.reduce((sum, inv) => {
    const paid = ((inv.payments ?? []) as { amount: number }[]).reduce((p, x) => p + x.amount, 0);
    return sum + Math.max(0, inv.total - paid);
  }, 0);

  const absences = attendance.filter(a => a.status === 'absent').length;
  const lates = attendance.filter(a => a.status === 'late').length;

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: 'var(--brand)' }}>
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center gap-4">
        <Avatar name={name} src={photo} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {className} · <span className="font-mono">{student.schoolid_number}</span>
          </p>
          <div className="flex gap-1.5 mt-2">
            <StatusBadge status={student.verification_status} />
          </div>
        </div>
        {attendance.length ? (
          <ProgressRing value={attendancePct} size={88} label="attendance"
            tone={attendancePct >= 90 ? 'ok' : attendancePct >= 75 ? 'warn' : 'bad'} />
        ) : null}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={attendance.length ? `${attendancePct}%` : '—'}
          sub={`${attendance.length} days recorded`} icon={ClipboardCheck}
          tone={attendancePct >= 90 ? 'ok' : attendancePct >= 75 ? 'warn' : 'bad'} />
        <StatCard label="Days absent" value={absences} sub={`${lates} late`} icon={AlertTriangle}
          tone={absences > 5 ? 'bad' : absences > 2 ? 'warn' : 'ok'} />
        <StatCard label="Average score" value={avg !== null ? `${avg}%` : '—'}
          sub={`${results.length} results`} icon={Trophy} tone="gold" />
        <StatCard label="Fees outstanding" value={formatMoney(balance, currency)} icon={Wallet}
          tone={balance > 0 ? 'warn' : 'ok'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Attendance trend — by week" className="lg:col-span-2">
          {trend.length ? <TrendAreaChart data={trend} xKey="week" yKey="rate" suffix="%" />
            : <EmptyState icon={ClipboardCheck} message="No attendance recorded yet" />}
        </PanelCard>

        <PanelCard title="Recent days">
          {attendance.length ? (
            <ul className="space-y-2">
              {attendance.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <span className="text-[13px]">{formatDate(a.date)}</span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          ) : <EmptyState message="Nothing recorded" />}
        </PanelCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Results" className="lg:col-span-2">
          {results.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="font-medium">{(r.subjects as { name?: string } | null)?.name}</td>
                      <td>{Math.round(r.score)}/{Math.round(r.max_score)}</td>
                      <td><span className={`badge ${['A', 'B'].includes(r.grade_letter ?? '') ? 'badge-ok' : r.grade_letter === 'F' ? 'badge-bad' : 'badge-brand'}`}>{r.grade_letter}</span></td>
                      <td style={{ color: 'var(--muted)' }}>{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon={FileText} message="No results published yet" />}
        </PanelCard>

        <div className="space-y-5">
          <PanelCard title="Fees">
            {invoices.length ? (
              <ul className="space-y-2.5">
                {invoices.map(inv => {
                  const paid = ((inv.payments ?? []) as { amount: number }[]).reduce((p, x) => p + x.amount, 0);
                  const due = Math.max(0, inv.total - paid);
                  return (
                    <li key={inv.id} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[13px]">{inv.number}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm font-semibold mt-1">{formatMoney(due, currency)} due</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>by {formatDate(inv.due_on)}</p>
                    </li>
                  );
                })}
              </ul>
            ) : <EmptyState icon={Wallet} message="No invoices" />}
          </PanelCard>

          <PanelCard title="Conduct">
            {(incidentsQ.data ?? []).length ? (
              <ul className="space-y-2.5">
                {(incidentsQ.data ?? []).map((i, k) => (
                  <li key={k} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{i.category}</span>
                      <StatusBadge status={i.status} />
                    </div>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{i.description}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{formatDate(i.occurred_on)}</p>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={QrCode} message="No incidents — all good" />}
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
