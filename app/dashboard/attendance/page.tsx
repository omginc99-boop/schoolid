import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import AttendanceRegister from '@/components/attendance/AttendanceRegister';

export const metadata = { title: 'Attendance' };

export default async function AttendancePage() {
  const ctx = await requireSession();
  const allowed = ['teacher', 'school_admin', 'principal'];
  if (!allowed.includes(ctx.profile.role) || !ctx.profile.school_id) redirect('/dashboard');

  const supabase = await createClient();
  const schoolId = ctx.profile.school_id;

  // Teachers see the classes they teach or are homeroom for; leadership sees all.
  let classes: { id: string; name: string; level: string | null }[] = [];
  if (ctx.profile.role === 'teacher') {
    const [{ data: taught }, { data: homeroom }] = await Promise.all([
      supabase.from('class_subjects').select('classes(id, name, level)').eq('teacher_profile_id', ctx.profile.id),
      supabase.from('classes').select('id, name, level').eq('homeroom_teacher_id', ctx.profile.id),
    ]);
    const map = new Map<string, { id: string; name: string; level: string | null }>();
    for (const row of taught ?? []) {
      // Supabase types an embedded relation as an array; normalise either shape.
      const rel = row.classes as unknown;
      const c = (Array.isArray(rel) ? rel[0] : rel) as { id: string; name: string; level: string | null } | null;
      if (c) map.set(c.id, c);
    }
    for (const c of homeroom ?? []) map.set(c.id, c);
    classes = [...map.values()];
  } else {
    const { data } = await supabase.from('classes').select('id, name, level').eq('school_id', schoolId).order('name');
    classes = data ?? [];
  }
  classes.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Take the register</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Mark today&apos;s attendance — parents see it the moment you save.
        </p>
      </div>
      <AttendanceRegister classes={classes} schoolId={schoolId} myProfileId={ctx.profile.id} />
    </div>
  );
}
