import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge, ProgressRing } from '@/components/ui/primitives';
import { formatDate, formatMoney, formatTime, relativeDay, pct } from '@/lib/format';
import {
  ClipboardCheck, BookOpen, Trophy, Wallet, CalendarDays, Megaphone, FileText,
} from 'lucide-react';

export default async function StudentDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const me = ctx.profile.id;
  const currency = ctx.school?.currency ?? 'NGN';
  const today = new Date();
  const isoDow = ((today.getDay() + 6) % 7) + 1; // 1 = Monday

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('class_id, classes(name)')
    .eq('student_profile_id', me)
    .eq('status', 'active')
    .maybeSingle();

  const classId = enrollment?.class_id as string | undefined;
  const className = (enrollment?.classes as { name?: string } | null)?.name ?? '—';

  const [attendanceQ, timetableQ, assignmentsQ, resultsQ, invoicesQ, announcementsQ, eventsQ] =
    await Promise.all([
      supabase.from('attendance').select('status').eq('student_profile_id', me).limit(500),
      classId
        ? supabase.from('timetable_slots')
            .select('starts_at, ends_at, room, subjects(name)')
            .eq('class_id', classId).eq('day_of_week', isoDow)
            .order('starts_at')
        : Promise.resolve({ data: [] }),
      classId
        ? supabase.from('assignments')
            .select('id, title, kind, due_at, subjects(name)')
            .eq('class_id', classId)
            .gte('due_at', new Date(Date.now() - 86400000).toISOString())
            .order('due_at').limit(6)
        : Promise.resolve({ data: [] }),
      supabase.from('exam_results')
        .select('score, max_score, grade_letter, remark, subjects(name)')
        .eq('student_profile_id', me)
        .order('created_at', { ascending: false }).limit(8),
      supabase.from('invoices')
        .select('id, number, status, due_on, total, payments(amount)')
        .eq('student_profile_id', me),
      supabase.from('announcements')
        .select('id, title, body, published_at, is_emergency')
        .contains('audience_roles', ['student'])
        .order('published_at', { ascending: false }).limit(4),
      supabase.from('events')
        .select('id, title, kind, starts_at, location')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at').limit(4),
    ]);

  const attendance = attendanceQ.data ?? [];
  const presentish = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendancePct = pct(presentish, attendance.length);

  const results = resultsQ.data ?? [];
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / results.length)
    : null;

  const invoices = invoicesQ.data ?? [];
  const balance = invoices.reduce((sum, inv) => {
    const paid = (inv.payments ?? []).reduce((p: number, x: { amount: number }) => p + x.amount, 0);
    return sum + Math.max(0, inv.total - paid);
  }, 0);

  const assignments = assignmentsQ.data ?? [];
  const slots = timetableQ.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, {ctx.profile.people?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {className} · here&apos;s your day at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={attendance.length ? `${attendancePct}%` : '—'}
          sub={`${presentish} of ${attendance.length} days`} icon={ClipboardCheck}
          tone={attendancePct >= 90 ? 'ok' : attendancePct >= 75 ? 'warn' : 'bad'} />
        <StatCard label="Homework due" value={assignments.length} sub="upcoming tasks" icon={BookOpen} />
        <StatCard label="Average score" value={avgScore !== null ? `${avgScore}%` : '—'}
          sub="last examinations" icon={Trophy} tone="gold" />
        <StatCard label="Balance due" value={formatMoney(balance, currency)}
          sub={balance > 0 ? 'ask a parent to pay online' : 'all paid up 🎉'} icon={Wallet}
          tone={balance > 0 ? 'warn' : 'ok'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <PanelCard title="Today’s classes">
          {slots.length ? (
            <ul className="space-y-2.5">
              {slots.map((s, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <span className="font-mono text-[13px] font-semibold shrink-0" style={{ color: 'var(--brand)' }}>
                    {formatTime(s.starts_at)}–{formatTime(s.ends_at)}
                  </span>
                  <span className="font-medium text-sm flex-1 truncate">
                    {(s.subjects as { name?: string } | null)?.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.room}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} message="No classes scheduled today" hint="Enjoy your free day!" />
          )}
        </PanelCard>

        <PanelCard title="Homework & assignments">
          {assignments.length ? (
            <ul className="space-y-2.5">
              {assignments.map(a => (
                <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {(a.subjects as { name?: string } | null)?.name} · {a.kind}
                    </p>
                  </div>
                  <span className="badge badge-brand shrink-0">{relativeDay(a.due_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={BookOpen} message="Nothing due" hint="New homework will appear here." />
          )}
        </PanelCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Recent results" className="lg:col-span-2">
          {results.length ? (
            <div className="flex items-start gap-5 flex-wrap">
              {avgScore !== null ? (
                <div className="hidden sm:block pt-2">
                  <ProgressRing value={avgScore} label="average" tone={avgScore >= 70 ? 'ok' : avgScore >= 50 ? 'warn' : 'bad'} />
                </div>
              ) : null}
              <div className="table-wrap flex-1 min-w-0">
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
            </div>
          ) : (
            <EmptyState icon={FileText} message="No results yet" hint="Your exam results will appear here once published." />
          )}
        </PanelCard>

        <div className="space-y-5">
          <PanelCard title="School news">
            {(announcementsQ.data ?? []).length ? (
              <ul className="space-y-3">
                {(announcementsQ.data ?? []).map(a => (
                  <li key={a.id}>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      {a.is_emergency ? <StatusBadge status="critical" /> : <Megaphone size={13} style={{ color: 'var(--brand)' }} />}
                      {a.title}
                    </p>
                    <p className="text-[13px] mt-0.5 line-clamp-2" style={{ color: 'var(--muted)' }}>{a.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Megaphone} message="No announcements" />
            )}
          </PanelCard>

          <PanelCard title="Upcoming">
            {(eventsQ.data ?? []).length ? (
              <ul className="space-y-2.5">
                {(eventsQ.data ?? []).map(e => (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="badge badge-gold shrink-0">{formatDate(e.starts_at, { year: undefined })}</span>
                    <span className="text-sm font-medium truncate">{e.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={CalendarDays} message="No upcoming events" />
            )}
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
