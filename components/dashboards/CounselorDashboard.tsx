import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge, Avatar } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import { HeartHandshake, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

export default async function CounselorDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;

  const { data: cases } = await supabase
    .from('wellbeing_cases')
    .select('id, risk, summary, notes, status, opened_on, profiles!wellbeing_cases_student_profile_id_fkey(schoolid_number, people(full_name))')
    .eq('school_id', sid)
    .order('opened_on', { ascending: false })
    .limit(30);

  const all = cases ?? [];
  const open = all.filter(c => c.status === 'open');
  const high = open.filter(c => c.risk === 'high' || c.risk === 'critical');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wellbeing caseload</h1>
        <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
          <Lock size={13} /> Restricted — visible only to counselors and the principal.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Open cases" value={open.length} icon={HeartHandshake} />
        <StatCard label="High risk" value={high.length} icon={AlertTriangle}
          tone={high.length > 0 ? 'bad' : 'ok'} />
        <StatCard label="Resolved" value={all.filter(c => c.status === 'resolved').length}
          icon={ShieldCheck} tone="ok" />
      </div>

      <PanelCard title="Cases">
        {all.length ? (
          <ul className="space-y-3">
            {all.map(c => {
              const p = c.profiles as { schoolid_number?: string; people?: { full_name?: string } } | null;
              const name = p?.people?.full_name ?? 'Student';
              return (
                <li key={c.id} className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Avatar name={name} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{name}
                        <span className="font-mono text-xs ml-2" style={{ color: 'var(--muted)' }}>{p?.schoolid_number}</span>
                      </p>
                      <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                        Opened {formatDate(c.opened_on)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <StatusBadge status={c.risk} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-3">{c.summary}</p>
                  {c.notes ? (
                    <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>{c.notes}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={HeartHandshake} message="No wellbeing cases"
            hint="Cases you open are visible only to you and the principal." />
        )}
      </PanelCard>
    </div>
  );
}
