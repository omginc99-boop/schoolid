import type { ReactNode } from 'react';
import { requireSession } from '@/lib/auth';
import Shell from '@/components/shell/Shell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const ctx = await requireSession();
  const { profile, school } = ctx;

  return (
    <Shell
      role={profile.role}
      personName={profile.people?.full_name ?? 'User'}
      schoolName={school?.name ?? 'SchoolID Platform'}
      schoolidNumber={profile.schoolid_number ?? '—'}
      hasAi={
        (school?.enabled_modules?.includes('ai') ?? true) &&
        profile.role !== 'librarian' && profile.role !== 'transport' && profile.role !== 'security'
      }
    >
      {children}
    </Shell>
  );
}
