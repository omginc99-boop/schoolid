// The role router: one URL, twelve dashboards. The user's profile role
// decides what renders — RLS in the database decides what data it can see.
import { headers } from 'next/headers';
import { requireSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { scheduleWelcomeEmailIfDue } from '@/lib/welcome';
import type { UserRole } from '@/lib/types';
import type { SessionContext } from '@/lib/auth';
import type { ComponentType } from 'react';
import WelcomeBanner from '@/components/onboarding/WelcomeBanner';

import StudentDashboard from '@/components/dashboards/StudentDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import PrincipalDashboard from '@/components/dashboards/PrincipalDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import FinanceDashboard from '@/components/dashboards/FinanceDashboard';
import LibrarianDashboard from '@/components/dashboards/LibrarianDashboard';
import TransportDashboard from '@/components/dashboards/TransportDashboard';
import SecurityDashboard from '@/components/dashboards/SecurityDashboard';
import CounselorDashboard from '@/components/dashboards/CounselorDashboard';
import RegistrarDashboard from '@/components/dashboards/RegistrarDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';

const DASHBOARDS: Record<UserRole, ComponentType<{ ctx: SessionContext }>> = {
  student: StudentDashboard,
  parent: ParentDashboard,
  teacher: TeacherDashboard,
  principal: PrincipalDashboard,
  school_admin: AdminDashboard,
  finance: FinanceDashboard,
  librarian: LibrarianDashboard,
  transport: TransportDashboard,
  security: SecurityDashboard,
  counselor: CounselorDashboard,
  registrar: RegistrarDashboard,
  super_admin: SuperAdminDashboard,
};

async function currentAppUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('host') ?? 'localhost:3027';
  return `${proto}://${host}`;
}

export default async function DashboardPage() {
  const ctx = await requireSession();
  const Dashboard = DASHBOARDS[ctx.profile.role] ?? StudentDashboard;
  const fullName = ctx.profile.people?.full_name ?? 'there';

  // First time this person ever reaches a dashboard, greet them by email —
  // works whether they got an instant session at signup or had to confirm
  // their email first. Runs after the response is sent; never blocks render.
  const supabase = await createClient();
  scheduleWelcomeEmailIfDue(supabase, ctx, await currentAppUrl());

  return (
    <div className="space-y-5">
      <WelcomeBanner
        profileId={ctx.profile.id}
        role={ctx.profile.role}
        firstName={fullName.split(/\s+/)[0]}
        schoolName={ctx.school?.name ?? 'SchoolID Platform'}
        schoolidNumber={ctx.profile.schoolid_number ?? '—'}
      />
      <Dashboard ctx={ctx} />
    </div>
  );
}
