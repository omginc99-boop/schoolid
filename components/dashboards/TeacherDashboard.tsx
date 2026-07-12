import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { formatTime, relativeDay } from '@/lib/format';
import { BookOpen, Users, ClipboardCheck, Sparkles, FileCheck2, CalendarDays } from 'lucide-react';

export default async function TeacherDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const me = ctx.profile.id;
  const isoDow = ((new Date().getDay() + 6) % 7) + 1;
  const todayIso = new Date().toISOString().slice(0, 10);

  const [classSubjectsQ, todaySlotsQ, assignmentsQ] = await Promise.all([
    supabase.from('class_subjects')
      .select('class_id, subject_id, classes(name), subjects(name)')
      .eq('teacher_profile_id', me),
    supabase.from('timetable_slots')
      .select('starts_at, ends_at, room, classes(name), subjects(name)')
      .eq('teacher_profile_id', me).eq('day_of_week', isoDow)
      .order('starts_at'),
    supabase.from('assignments')
      .select('id, title, kind, due_at, classes(name), subjects(name), submissions(id, graded_at)')
      .eq('teacher_profile_id', me)
      .order('due_at', { ascending: false }).limit(8),
  ]);

  const classSubjects = classSubjectsQ.data ?? [];
  const myClassIds = [...new Set(classSubjects.map(c => c.class_id))];

  const [studentsQ, attendanceTodayQ] = await Promise.all([
    myClassIds.length
      ? supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('class_id', myClassIds).eq('status', 'active')
      : Promise.resolve({ count: 0 }),
    myClassIds.length
      ? supabase.from('attendance').select('status, class_id').in('class_id', myClassIds).eq('date', todayIso)
      : Promise.resolve({ data: [] }),
  ]);

  const assignments = assignmentsQ.data ?? [];
  const ungraded = assignments.reduce(
    (n, a) => n + ((a.submissions ?? []) as { graded_at: string | null }[]).filter(s => !s.graded_at).length, 0);

  const attToday = attendanceTodayQ.data ?? [];
  const presentToday = attToday.filter(a => a.status === 'present' || a.status === 'late').length;

  const slots = todaySlotsQ.data ?? [];
  const classNames = [...new Set(classSubjects.map(c => (c.classes as { name?: string } | null)?.name))].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {ctx.profile.people?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {classNames.length ? `Teaching ${classNames.join(', ')}` : 'Your teaching day at a glance.'}
          </p>
        </div>
        <Link href="/dashboard/ai" className="btn btn-primary">
          <Sparkles size={15} /> AI Lesson Planner
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My classes" value={myClassIds.length} sub={`${classSubjects.length} subject slots`} icon={BookOpen} />
        <StatCard label="My students" value={studentsQ.count ?? 0} icon={Users} />
        <StatCard label="Present today" value={attToday.length ? `${presentToday}/${attToday.length}` : '—'}
          sub={attToday.length ? 'marked so far' : 'no register yet today'} icon={ClipboardCheck}
          tone={attToday.length && presentToday / attToday.length < 0.8 ? 'warn' : 'ok'} />
        <StatCard label="To grade" value={ungraded} sub="submissions waiting" icon={FileCheck2}
          tone={ungraded > 0 ? 'warn' : 'ok'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <PanelCard title="Today’s periods">
          {slots.length ? (
            <ul className="space-y-2.5">
              {slots.map((s, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <span className="font-mono text-[13px] font-semibold shrink-0" style={{ color: 'var(--brand)' }}>
                    {formatTime(s.starts_at)}–{formatTime(s.ends_at)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{(s.subjects as { name?: string } | null)?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{(s.classes as { name?: string } | null)?.name}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{s.room}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} message="No periods today" hint="A good day for marking and planning." />
          )}
        </PanelCard>

        <PanelCard title="My assignments">
          {assignments.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Title</th><th>Class</th><th>Due</th><th>Ungraded</th></tr></thead>
                <tbody>
                  {assignments.map(a => {
                    const waiting = ((a.submissions ?? []) as { graded_at: string | null }[]).filter(s => !s.graded_at).length;
                    return (
                      <tr key={a.id}>
                        <td className="font-medium max-w-[200px] truncate">{a.title}</td>
                        <td>{(a.classes as { name?: string } | null)?.name}</td>
                        <td style={{ color: 'var(--muted)' }}>{relativeDay(a.due_at)}</td>
                        <td>{waiting > 0
                          ? <span className="badge badge-warn">{waiting} waiting</span>
                          : <StatusBadge status="resolved" />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={BookOpen} message="No assignments yet"
              hint="Create assignments and they'll appear here with grading progress." />
          )}
        </PanelCard>
      </div>

      <PanelCard title="AI teaching tools"
        action={<Link href="/dashboard/ai" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>Open →</Link>}>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            ['AI Lesson Planner', 'A full lesson plan from one sentence'],
            ['AI Exam Generator', 'Question papers with marking schemes'],
            ['AI Report Writer', 'Notes and grades → polished comments'],
          ].map(([name, desc]) => (
            <Link key={name} href="/dashboard/ai"
              className="p-4 rounded-xl hover:-translate-y-0.5 transition-transform"
              style={{ background: 'var(--brand-soft)' }}>
              <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--brand)' }}>
                <Sparkles size={14} /> {name}
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{desc}</p>
            </Link>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
