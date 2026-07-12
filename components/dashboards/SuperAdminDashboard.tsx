import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import { Building2, Users, Wallet, Activity, Globe2 } from 'lucide-react';

export default async function SuperAdminDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();

  const [schoolsQ, profilesQ, subscriptionsQ, auditQ] = await Promise.all([
    supabase.from('schools')
      .select('id, name, slug, school_type, city, country, plan, billing_status, created_at')
      .order('created_at', { ascending: false }).limit(30),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('plan, status, price_per_student, currency'),
    supabase.from('audit_logs')
      .select('id, action, entity, detail, created_at, schools(name)')
      .order('created_at', { ascending: false }).limit(12),
  ]);

  const schools = schoolsQ.data ?? [];
  const subs = subscriptionsQ.data ?? [];
  const active = subs.filter(s => s.status === 'active').length;
  const trials = subs.filter(s => s.status === 'trial').length;
  const pastDue = subs.filter(s => s.status === 'past_due').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe2 size={22} style={{ color: 'var(--brand)' }} /> Platform control
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Every school, subscription and audit trail on SchoolID.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Schools" value={schools.length} icon={Building2} />
        <StatCard label="Active identities" value={profilesQ.count ?? 0} sub="across all schools" icon={Users} />
        <StatCard label="Paying subscriptions" value={active} sub={`${trials} on trial`} icon={Wallet} tone="ok" />
        <StatCard label="Past due" value={pastDue} icon={Activity} tone={pastDue > 0 ? 'bad' : 'ok'} />
      </div>

      <PanelCard title="Schools">
        {schools.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>School</th><th>Type</th><th>Location</th><th>Plan</th><th>Billing</th><th>Joined</th></tr></thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id}>
                    <td>
                      <p className="font-medium">{s.name}</p>
                      <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>/{s.slug}</p>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{s.school_type.replace(/_/g, ' ')}</td>
                    <td style={{ color: 'var(--muted)' }}>{[s.city, s.country].filter(Boolean).join(', ')}</td>
                    <td><span className="badge badge-brand">{s.plan}</span></td>
                    <td><StatusBadge status={s.billing_status} /></td>
                    <td style={{ color: 'var(--muted)' }}>{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Building2} message="No schools yet" hint="Schools appear here the moment they register." />
        )}
      </PanelCard>

      <PanelCard title="Platform audit feed">
        {(auditQ.data ?? []).length ? (
          <ul className="space-y-2.5">
            {(auditQ.data ?? []).map(a => (
              <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                <Activity size={15} className="shrink-0" style={{ color: 'var(--brand)' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    <span className="font-mono text-[13px]">{a.action}</span>
                    {a.entity ? <span style={{ color: 'var(--muted)' }}> · {a.entity}</span> : null}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {(a.schools as { name?: string } | null)?.name ?? 'Platform'} · {formatDate(a.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Activity} message="No audit events yet"
            hint="Privileged actions across all tenants are recorded here, append-only." />
        )}
      </PanelCard>
    </div>
  );
}
