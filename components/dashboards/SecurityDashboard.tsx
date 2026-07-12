import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge } from '@/components/ui/primitives';
import VerifyLauncher from '@/components/security/VerifyLauncher';
import { UserCheck, DoorOpen, ShieldCheck, Clock } from 'lucide-react';

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default async function SecurityDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [visitorsQ, entriesQ] = await Promise.all([
    supabase.from('visitors')
      .select('id, full_name, phone, purpose, badge_number, checked_in_at, checked_out_at, profiles!visitors_host_profile_id_fkey(people(full_name))')
      .eq('school_id', sid)
      .order('checked_in_at', { ascending: false }).limit(20),
    supabase.from('entry_logs')
      .select('id, direction, gate, scanned_at, profiles!entry_logs_profile_id_fkey(role, schoolid_number, people(full_name))')
      .eq('school_id', sid)
      .gte('scanned_at', todayStart.toISOString())
      .order('scanned_at', { ascending: false }).limit(30),
  ]);

  const visitors = visitorsQ.data ?? [];
  const onSite = visitors.filter(v => !v.checked_out_at);
  const entries = entriesQ.data ?? [];
  const insToday = entries.filter(e => e.direction === 'in').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security desk</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Gate activity and visitor management for {ctx.school?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Visitors on site" value={onSite.length} sub="not yet checked out" icon={UserCheck}
          tone={onSite.length > 0 ? 'brand' : 'ok'} />
        <StatCard label="Gate entries today" value={insToday} icon={DoorOpen} />
        <StatCard label="QR scans today" value={entries.length} icon={ShieldCheck} tone="gold" />
      </div>

      <PanelCard title="Verify a SchoolID">
        <VerifyLauncher />
      </PanelCard>

      <div className="grid lg:grid-cols-2 gap-5">
        <PanelCard title="Visitor log">
          {visitors.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Visitor</th><th>Purpose</th><th>Badge</th><th>Status</th></tr></thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>
                        <p className="font-medium">{v.full_name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          Host: {(v.profiles as { people?: { full_name?: string } } | null)?.people?.full_name ?? '—'}
                        </p>
                      </td>
                      <td className="max-w-[160px] truncate" style={{ color: 'var(--muted)' }}>{v.purpose}</td>
                      <td className="font-mono text-[13px]">{v.badge_number}</td>
                      <td>
                        {v.checked_out_at
                          ? <span className="badge badge-muted">checked out</span>
                          : <span className="badge badge-ok">on site</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={UserCheck} message="No visitors logged" />
          )}
        </PanelCard>

        <PanelCard title="Gate activity — today">
          {entries.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Person</th><th>SchoolID</th><th>Gate</th><th>Time</th><th></th></tr></thead>
                <tbody>
                  {entries.map(e => {
                    const p = e.profiles as { role?: string; schoolid_number?: string; people?: { full_name?: string } } | null;
                    return (
                      <tr key={e.id}>
                        <td className="font-medium">{p?.people?.full_name}</td>
                        <td className="font-mono text-[13px]">{p?.schoolid_number}</td>
                        <td style={{ color: 'var(--muted)' }}>{e.gate}</td>
                        <td style={{ color: 'var(--muted)' }}>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {timeOf(e.scanned_at)}
                          </span>
                        </td>
                        <td><StatusBadge status={e.direction === 'in' ? 'present' : 'out'} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={DoorOpen} message="No scans today" hint="QR gate scans will appear here in real time." />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
