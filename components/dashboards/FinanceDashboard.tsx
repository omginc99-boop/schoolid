import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge, ProgressRing } from '@/components/ui/primitives';
import { SimpleBarChart } from '@/components/ui/charts';
import { formatDate, formatMoney, pct } from '@/lib/format';
import { Wallet, Receipt, AlertTriangle, Award } from 'lucide-react';

export default async function FinanceDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;
  const currency = ctx.school?.currency ?? 'NGN';

  const [invoicesQ, paymentsQ, scholarshipsQ] = await Promise.all([
    supabase.from('invoices')
      .select('id, number, status, due_on, total, profiles!invoices_student_profile_id_fkey(schoolid_number, people(full_name)), payments(amount)')
      .eq('school_id', sid)
      .order('due_on').limit(50),
    supabase.from('payments')
      .select('amount, method, reference, paid_at')
      .eq('school_id', sid)
      .order('paid_at', { ascending: false }).limit(60),
    supabase.from('scholarships')
      .select('name, percent, amount, profiles!scholarships_student_profile_id_fkey(people(full_name))')
      .eq('school_id', sid).limit(6),
  ]);

  const invoices = invoicesQ.data ?? [];
  const invoiced = invoices.reduce((s, i) => s + i.total, 0);
  const collected = invoices.reduce(
    (s, i) => s + ((i.payments ?? []) as { amount: number }[]).reduce((p, x) => p + x.amount, 0), 0);
  const outstanding = Math.max(0, invoiced - collected);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const collectionPct = pct(collected, invoiced);

  // Collections by week (last 6 weeks)
  const payments = paymentsQ.data ?? [];
  const weeks: { label: string; amount: number }[] = [];
  for (let w = 5; w >= 0; w--) {
    const start = new Date(Date.now() - (w + 1) * 7 * 86400000);
    const end = new Date(Date.now() - w * 7 * 86400000);
    const amount = payments
      .filter(p => new Date(p.paid_at) >= start && new Date(p.paid_at) < end)
      .reduce((s, p) => s + p.amount, 0);
    weeks.push({
      label: end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      amount,
    });
  }

  const outstandingInvoices = invoices
    .map(i => {
      const paid = ((i.payments ?? []) as { amount: number }[]).reduce((p, x) => p + x.amount, 0);
      return { ...i, paid, due: Math.max(0, i.total - paid) };
    })
    .filter(i => i.due > 0 && i.status !== 'void')
    .sort((a, b) => (a.status === 'overdue' ? -1 : 1) - (b.status === 'overdue' ? -1 : 1))
    .slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Fee collection for {ctx.school?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Invoiced" value={formatMoney(invoiced, currency)} sub={`${invoices.length} invoices`} icon={Receipt} />
        <StatCard label="Collected" value={formatMoney(collected, currency)} sub={`${collectionPct}% of invoiced`} icon={Wallet} tone="ok" />
        <StatCard label="Outstanding" value={formatMoney(outstanding, currency)} icon={Wallet}
          tone={outstanding > 0 ? 'warn' : 'ok'} />
        <StatCard label="Overdue invoices" value={overdueCount} icon={AlertTriangle}
          tone={overdueCount > 0 ? 'bad' : 'ok'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Collections — last 6 weeks" className="lg:col-span-2">
          <SimpleBarChart data={weeks} xKey="label" yKey="amount" prefix={currency === 'NGN' ? '₦' : ''} />
        </PanelCard>

        <PanelCard title="Collection rate">
          <div className="flex flex-col items-center gap-3 py-2">
            <ProgressRing value={collectionPct} size={130}
              tone={collectionPct >= 80 ? 'ok' : collectionPct >= 50 ? 'warn' : 'bad'} label="collected" />
            <p className="text-[13px] text-center" style={{ color: 'var(--muted)' }}>
              {formatMoney(collected, currency)} collected of {formatMoney(invoiced, currency)} invoiced this term.
            </p>
          </div>
        </PanelCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Outstanding balances" className="lg:col-span-2">
          {outstandingInvoices.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Invoice</th><th>Student</th><th>Due date</th><th>Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {outstandingInvoices.map(i => (
                    <tr key={i.id}>
                      <td className="font-mono text-[13px]">{i.number}</td>
                      <td className="font-medium">
                        {(i.profiles as { people?: { full_name?: string } } | null)?.people?.full_name}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{formatDate(i.due_on)}</td>
                      <td className="font-semibold">{formatMoney(i.due, currency)}</td>
                      <td><StatusBadge status={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Wallet} message="Nothing outstanding" hint="Every invoice is fully paid. Excellent." />
          )}
        </PanelCard>

        <PanelCard title="Scholarships">
          {(scholarshipsQ.data ?? []).length ? (
            <ul className="space-y-3">
              {(scholarshipsQ.data ?? []).map((s, i) => (
                <li key={i} className="p-3 rounded-xl" style={{ background: 'var(--gold-soft)' }}>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                    <Award size={14} /> {s.name}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {(s.profiles as { people?: { full_name?: string } } | null)?.people?.full_name}
                    {' · '}{s.percent ? `${s.percent}%` : formatMoney(s.amount ?? 0, currency)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Award} message="No scholarships" />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
