import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import SchoolSetup from '@/components/setup/SchoolSetup';

export const metadata = { title: 'School setup' };

export default async function SetupPage() {
  const ctx = await requireSession();
  const allowed = ['school_admin', 'principal', 'registrar', 'teacher'];
  if (!allowed.includes(ctx.profile.role) || !ctx.profile.school_id) redirect('/dashboard');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School setup</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Build your school year: academic years, terms, subjects, classes and who teaches what.
        </p>
      </div>
      <SchoolSetup schoolId={ctx.profile.school_id} />
    </div>
  );
}
