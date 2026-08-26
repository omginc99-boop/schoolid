'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogoMark } from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/primitives';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';
import { LayoutDashboard, QrCode, Sparkles, LogOut, ClipboardCheck, Users, Settings2 } from 'lucide-react';

interface ShellProps {
  role: UserRole;
  personName: string;
  schoolName: string;
  schoolidNumber: string;
  hasAi: boolean;
  children: ReactNode;
}

export default function Shell({
  role, personName, schoolName, schoolidNumber, hasAi, children,
}: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const meta = roleMeta(role);
  const RoleIcon = meta.icon;

  const canRegister = ['teacher', 'school_admin', 'principal'].includes(role);
  const canManage = ['school_admin', 'principal', 'registrar'].includes(role);

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ...(canRegister ? [{ href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck }] : []),
    ...(canManage ? [
      { href: '/dashboard/students', label: 'Students', icon: Users },
      { href: '/dashboard/setup', label: 'School setup', icon: Settings2 },
    ] : []),
    { href: '/dashboard/id', label: 'My SchoolID', icon: QrCode },
    ...(hasAi ? [{ href: '/dashboard/ai', label: 'AI Assistant', icon: Sparkles }] : []),
  ];

  async function signOut() {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen p-4"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2" aria-label="SchoolID dashboard">
          <LogoMark size={30} />
          <span className="text-[17px] font-bold tracking-tight">
            School<span style={{ color: 'var(--brand)' }}>ID</span>
          </span>
        </Link>

        <div className="mt-4 mb-2 px-3 py-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <p className="text-xs font-medium truncate" style={{ color: 'var(--muted)' }}>{schoolName}</p>
          <p className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
            <RoleIcon size={14} style={{ color: 'var(--brand)' }} /> {meta.label}
          </p>
        </div>

        <nav className="flex flex-col gap-1 mt-2" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`nav-item ${pathname === href ? 'active' : ''}`}
              aria-current={pathname === href ? 'page' : undefined}>
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar name={personName} size={34} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{personName}</p>
              <p className="text-[11px] font-mono truncate" style={{ color: 'var(--muted)' }}>{schoolidNumber}</p>
            </div>
          </div>
          <button onClick={signOut} className="nav-item w-full" aria-label="Sign out">
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 h-14 flex items-center justify-between gap-3 px-4 md:px-6 backdrop-blur-xl"
          style={{
            background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2.5 md:hidden">
            <LogoMark size={26} />
            <div className="leading-tight">
              <p className="text-sm font-bold">{schoolName}</p>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{meta.label}</p>
            </div>
          </div>
          <p className="hidden md:block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            {schoolName}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={signOut} className="btn btn-outline !p-2.5 !rounded-full md:hidden" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-6xl w-full mx-auto">{children}</main>

        {/* Bottom nav (mobile) */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around overflow-x-auto backdrop-blur-xl"
          style={{
            background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
            borderTop: '1px solid var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          aria-label="Mobile navigation"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-1 py-2.5 px-4 text-[11px] font-medium"
                style={{ color: active ? 'var(--brand)' : 'var(--muted)' }}
                aria-current={active ? 'page' : undefined}>
                <Icon size={20} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
