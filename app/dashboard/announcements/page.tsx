import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import Announcements from '@/components/messages/Announcements';

export const metadata = { title: 'Announcements' };

const STAFF = [
  'teacher', 'principal', 'school_admin', 'finance', 'librarian',
  'transport', 'security', 'counselor', 'registrar',
];

export default async function AnnouncementsPage() {
  const ctx = await requireSession();
  if (!ctx.profile.school_id) redirect('/dashboard');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          School-wide news, class notices and emergency alerts.
        </p>
      </div>
      <Announcements
        schoolId={ctx.profile.school_id}
        myProfileId={ctx.profile.id}
        canPublish={STAFF.includes(ctx.profile.role)}
      />
    </div>
  );
}
