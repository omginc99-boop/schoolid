import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import StudentManager from '@/components/students/StudentManager';

export const metadata = { title: 'Students' };

export default async function StudentsPage() {
  const ctx = await requireSession();
  const allowed = ['school_admin', 'principal', 'registrar'];
  if (!allowed.includes(ctx.profile.role) || !ctx.profile.school_id) redirect('/dashboard');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students &amp; parents</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Enroll students, add parents and link families. Every person added is issued a verified SchoolID.
        </p>
      </div>
      <StudentManager schoolId={ctx.profile.school_id} />
    </div>
  );
}
