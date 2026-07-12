'use client';

// Recharts wrappers themed with the design tokens. Client-only; server
// dashboards pass plain data props.
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontSize: 13,
  color: 'var(--text)',
};

export function TrendAreaChart({
  data, xKey, yKey, suffix = '',
}: {
  data: Record<string, string | number>[]; xKey: string; yKey: string; suffix?: string;
}) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => `${v}${suffix}`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}${suffix}`]} />
          <Area type="monotone" dataKey={yKey} stroke="var(--brand)" strokeWidth={2.5}
            fill="url(#brandFill)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({
  data, xKey, yKey, prefix = '',
}: {
  data: Record<string, string | number>[]; xKey: string; yKey: string; prefix?: string;
}) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => `${prefix}${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }}
            formatter={(v) => [`${prefix}${Number(v).toLocaleString()}`]} />
          <Bar dataKey={yKey} fill="var(--brand)" radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
