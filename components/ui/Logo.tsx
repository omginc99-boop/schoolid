import Link from 'next/link';

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="48" height="48" rx="12" fill="var(--brand)" />
      {/* mortarboard over an ID card */}
      <rect x="12" y="21" width="24" height="16" rx="3" fill="white" opacity="0.92" />
      <rect x="15.5" y="25" width="7" height="7" rx="1.5" fill="var(--brand)" opacity="0.85" />
      <rect x="25" y="26" width="8.5" height="2" rx="1" fill="var(--brand)" opacity="0.6" />
      <rect x="25" y="30" width="6" height="2" rx="1" fill="var(--brand)" opacity="0.4" />
      <path d="M24 8 L38 14 L24 20 L10 14 Z" fill="var(--gold)" />
      <path d="M33 16.2 V21 a1.2 1.2 0 0 1-2.4 0 v-3.8 Z" fill="var(--gold)" opacity="0.9" />
    </svg>
  );
}

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="SchoolID home">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">
        School<span style={{ color: 'var(--brand)' }}>ID</span>
      </span>
    </Link>
  );
}
