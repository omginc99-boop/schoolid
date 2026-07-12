import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, Avatar, ProgressRing } from '@/components/ui/primitives';
import { formatDate, formatMoney, pct } from '@/lib/format';
import { Users, Wallet, Megaphone, MessageSquare, CalendarDays, GraduationCap } from 'lucide-react';

interface ChildSummary {
  profileId: string;
  name: string;
  className: string;
  attendancePct: number | null;
  avgScore: number | null;
  balance: number;
}

export default async function ParentDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const me = ctx.profile.id;
  const currency = ctx.school?.currency ?? 'NGN';

  const { data: links } = await supabase
    .from('guardians')
    .select('student_profile_id, relationship, profiles!guardians_student_profile_id_fkey(id, schoolid_number, people(full_name))')
    .eq('parent_profile_id', me);

  const childIds = (links ?? []).map(l => l.student_profile_id);

  const [attendanceQ, resultsQ, invoicesQ, enrollmentsQ, announcementsQ, eventsQ, messagesQ] =
    await Promise.all([
      childIds.length
        ? supabase.from('attendance').select('student_profile_id, status').in('student_profile_id', childIds).limit(1500)
        : Promise.resolve({ data: [] }),
      childIds.length
        ? supabase.from('exam_results').select('student_profile_id, score, max_score').in('student_profile_id', childIds).limit(500)
        : Promise.resolve({ data: [] }),
      childIds.length
        ? supabase.from('invoices').select('student_profile_id, number, status, due_on, total, payments(amount)').in('student_profile_id', childIds)
        : Promise.resolve({ data: [] }),
      childIds.length
        ? supabase.from('enrollments').select('student_profile_id, classes(name)').in('student_profile_id', childIds).eq('status', 'active')
        : Promise.resolve({ data: [] }),
      supabase.from('announcements')
        .select('id, title, body, published_at, is_emergency')
        .contains('audience_roles', ['parent'])
        .order('published_at', { ascending: false }).limit(4),
      supabase.from('events')
        .select('id, title, starts_at, location')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at').limit(4),
      supabase.from('messages')
        .select('id, body, created_at, read_at, sender_profile_id')
        .eq('recipient_profile_id', me)
        .order('created_at', { ascending: false }).limit(5),
    ]);

  const attendance = attendanceQ.data ?? [];
  const results = resultsQ.data ?? [];
  const invoices = invoicesQ.data ?? [];
  const enrollments = enrollmentsQ.data ?? [];

  const children: ChildSummary[] = (links ?? []).map(l => {
    const prof = l.profiles as { people?: { full_name?: string } } | null;
    const att = attendance.filter(a => a.student_profile_id === l.student_profile_id);
    const present = att.filter(a => a.status === 'present' || a.status === 'late').length;
    const res = results.filter(r => r.student_profile_id === l.student_profile_id);
    const avg = res.length
      ? Math.round(res.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / res.length)
      : null;
    const invs = invoices.filter(i => i.student_profile_id === l.student_profile_id);
    const balance = invs.reduce((sum, inv) => {
      const paid = (inv.payments ?? []).reduce((p: number, x: { amount: number }) => p + x.amount, 0);
      return sum + Math.max(0, inv.total - paid);
    }, 0);
    const enr = enrollments.find(e => e.student_profile_id === l.student_profile_id);
    return {
      profileId: l.student_profile_id,
      name: prof?.people?.full_name ?? 'Child',
      className: (enr?.classes as { name?: string } | null)?.name ?? '—',
      attendancePct: att.length ? pct(present, att.length) : null,
      avgScore: avg,
      balance,
    };
  });

  const totalBalance = children.reduce((s, c) => s + c.balance, 0);
  const unread = (messagesQ.data ?? []).filter(m => !m.read_at).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {ctx.profile.people?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {children.length} {children.length === 1 ? 'child' : 'children'} on SchoolID · everything in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Children" value={children.length} icon={Users} />
        <StatCard label="Total fees due" value={formatMoney(totalBalance, currency)}
          sub={totalBalance > 0 ? 'pay online below' : 'all settled 🎉'} icon={Wallet}
          tone={totalBalance > 0 ? 'warn' : 'ok'} />
        <StatCard label="Unread messages" value={unread} sub="from teachers" icon={MessageSquare}
          tone={unread > 0 ? 'brand' : 'ok'} />
      </div>

      {/* Per-child cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {children.length ? children.map(c => (
          <div key={c.profileId} className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{c.name}</p>
                <p className="text-[13px]" style={{ color: 'var(--muted)' }}>{c.className}</p>
              </div>
              {c.attendancePct !== null ? (
                <ProgressRing value={c.attendancePct} size={62} label="attend."
                  tone={c.attendancePct >= 90 ? 'ok' : c.attendancePct >= 75 ? 'warn' : 'bad'} />
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Average score</p>
                <p className="text-lg font-bold">{c.avgScore !== null ? `${c.avgScore}%` : '—'}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: c.balance > 0 ? 'var(--warning-soft)' : 'var(--success-soft)' }}>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Fees outstanding</p>
                <p className="text-lg font-bold" style={{ color: c.balance > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  {formatMoney(c.balance, currency)}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="card md:col-span-2">
            <EmptyState icon={GraduationCap} message="No children linked yet"
              hint="Ask the school administrator to link your children to your account." />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <PanelCard title="School announcements">
          {(announcementsQ.data ?? []).length ? (
            <ul className="space-y-3">
              {(announcementsQ.data ?? []).map(a => (
                <li key={a.id}>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Megaphone size={13} style={{ color: a.is_emergency ? 'var(--danger)' : 'var(--brand)' }} />
                    {a.title}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>{a.body}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{formatDate(a.published_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Megaphone} message="No announcements yet" />
          )}
        </PanelCard>

        <PanelCard title="Upcoming school events">
          {(eventsQ.data ?? []).length ? (
            <ul className="space-y-2.5">
              {(eventsQ.data ?? []).map(e => (
                <li key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <span className="badge badge-gold shrink-0">{formatDate(e.starts_at, { year: undefined })}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    {e.location ? <p className="text-xs" style={{ color: 'var(--muted)' }}>{e.location}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} message="No upcoming events" />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
