import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { initials } from '@/lib/format';

/* ---------- StatCard ---------- */
export function StatCard({
  label, value, sub, icon: Icon, tone = 'brand',
}: {
  label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon;
  tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'gold';
}) {
  const toneVar = {
    brand: 'var(--brand)', ok: 'var(--success)', warn: 'var(--warning)',
    bad: 'var(--danger)', gold: 'var(--gold)',
  }[tone];
  const softVar = {
    brand: 'var(--brand-soft)', ok: 'var(--success-soft)', warn: 'var(--warning-soft)',
    bad: 'var(--danger-soft)', gold: 'var(--gold-soft)',
  }[tone];
  return (
    <div className="card p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="stat-label">{label}</p>
        <p className="stat-value mt-1">{value}</p>
        {sub ? <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{sub}</p> : null}
      </div>
      {Icon ? (
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ background: softVar, color: toneVar }}
        >
          <Icon size={20} />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- PanelCard ---------- */
export function PanelCard({
  title, action, children, className = '',
}: {
  title: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="section-title">{title}</h2>
        {action}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  icon: Icon, message, hint,
}: { icon?: LucideIcon; message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
      {Icon ? <Icon size={28} style={{ color: 'var(--muted)' }} /> : null}
      <p className="text-sm font-medium">{message}</p>
      {hint ? <p className="text-[13px]" style={{ color: 'var(--muted)' }}>{hint}</p> : null}
    </div>
  );
}

/* ---------- ProgressRing ---------- */
export function ProgressRing({
  value, size = 84, label, tone = 'brand',
}: { value: number; size?: number; label?: string; tone?: 'brand' | 'ok' | 'warn' | 'bad' }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const toneVar = {
    brand: 'var(--brand)', ok: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger)',
  }[tone];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" stroke="var(--surface-2)" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          stroke={toneVar} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-lg font-bold">{Math.round(clamped)}%</span>
        {label ? <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{label}</p> : null}
      </div>
    </div>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({
  name, src, size = 36,
}: { name: string; src?: string | null; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: 'var(--brand-soft)', color: 'var(--brand)',
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

/* ---------- Status badge helpers ---------- */
const STATUS_TONES: Record<string, string> = {
  present: 'badge-ok', paid: 'badge-ok', active: 'badge-ok', admitted: 'badge-ok',
  returned: 'badge-ok', resolved: 'badge-ok', document_verified: 'badge-ok',
  school_verified: 'badge-brand', trial: 'badge-brand', review: 'badge-brand',
  sent: 'badge-brand', out: 'badge-brand', interview: 'badge-brand', open: 'badge-brand',
  late: 'badge-warn', partial: 'badge-warn', pending: 'badge-warn', excused: 'badge-warn',
  past_due: 'badge-warn', medium: 'badge-warn',
  absent: 'badge-bad', overdue: 'badge-bad', rejected: 'badge-bad', suspended: 'badge-bad',
  high: 'badge-bad', critical: 'badge-bad', cancelled: 'badge-bad', lost: 'badge-bad',
  unverified: 'badge-muted', draft: 'badge-muted', void: 'badge-muted', low: 'badge-muted',
  inactive: 'badge-muted', graduated: 'badge-gold', alumni: 'badge-gold',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? 'badge-muted';
  return <span className={`badge ${tone}`}>{status.replace(/_/g, ' ')}</span>;
}
