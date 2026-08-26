// The role router: one URL, twelve dashboards. The user's profile role
// decides what renders — RLS in the database decides what data it can see.
import { requireSession } from '@/lib/auth';
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

export default async function DashboardPage() {
  const ctx = await requireSession();
  const Dashboard = DASHBOARDS[ctx.profile.role] ?? StudentDashboard;
  const fullName = ctx.profile.people?.full_name ?? 'there';

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
