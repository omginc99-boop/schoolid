import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge, Avatar } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';
import { GraduationCap, Users, BookOpen, Layers, CalendarDays, ToggleRight, UserPlus } from 'lucide-react';
import StudentManager from '@/components/students/StudentManager';

export default async function AdminDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;

  const [studentsQ, parentsQ, staffQ, classesQ, subjectsQ, yearQ, termQ, admissionsQ, staffListQ] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .eq('school_id', sid).eq('role', 'student').eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .eq('school_id', sid).eq('role', 'parent').eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .eq('school_id', sid).eq('status', 'active')
        .in('role', ['teacher', 'principal', 'finance', 'librarian', 'transport', 'security', 'counselor', 'registrar']),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', sid),
      supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('school_id', sid),
      supabase.from('academic_years').select('name').eq('school_id', sid).eq('is_current', true).maybeSingle(),
      supabase.from('terms').select('name, starts_on, ends_on').eq('school_id', sid).eq('is_current', true).maybeSingle(),
      supabase.from('admissions_applications').select('applicant_name, desired_level, status, submitted_at')
        .eq('school_id', sid).order('submitted_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('role, title, schoolid_number, verification_status, people(full_name)')
        .eq('school_id', sid).eq('status', 'active')
        .in('role', ['teacher', 'principal', 'finance', 'librarian', 'transport', 'security', 'counselor', 'registrar'])
        .order('role').limit(12),
    ]);

  const modules = ctx.school?.enabled_modules ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {yearQ.data?.name ?? 'No current academic year'} · {termQ.data?.name ?? 'no current term'}
          {termQ.data ? ` (${formatDate(termQ.data.starts_on)} – ${formatDate(termQ.data.ends_on)})` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Students" value={studentsQ.count ?? 0} icon={GraduationCap} />
        <StatCard label="Parents" value={parentsQ.count ?? 0} icon={Users} />
        <StatCard label="Staff" value={staffQ.count ?? 0} icon={Users} tone="gold" />
        <StatCard label="Classes" value={classesQ.count ?? 0} icon={Layers} />
        <StatCard label="Subjects" value={subjectsQ.count ?? 0} icon={BookOpen} />
      </div>

      {/* Enroll people right from the dashboard: add students one-by-one or in
          bulk, register parents and link families, and add teachers & staff.
          Every person added is issued a verified SchoolID automatically. */}
      <PanelCard
        title="Enroll students & staff"
        action={
          <span className="badge badge-brand"><UserPlus size={12} /> SchoolID issued instantly</span>
        }
      >
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Add students one at a time or in bulk, register parents and link families,
          and add teachers &amp; staff — each person is issued a verified SchoolID automatically.
        </p>
        <StudentManager schoolId={sid} />
      </PanelCard>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Staff directory" className="lg:col-span-2">
          {(staffListQ.data ?? []).length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Role</th><th>SchoolID</th><th>Verification</th></tr></thead>
                <tbody>
                  {(staffListQ.data ?? []).map((s, i) => {
                    const name = (s.people as { full_name?: string } | null)?.full_name ?? '—';
                    return (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} size={28} />
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.title}</p>
                            </div>
                          </div>
                        </td>
                        <td>{roleMeta(s.role as UserRole).label}</td>
                        <td className="font-mono text-[13px]">{s.schoolid_number}</td>
                        <td><StatusBadge status={s.verification_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Users} message="No staff yet" hint="Add teachers and staff to issue their SchoolIDs." />
          )}
        </PanelCard>

        <div className="space-y-5">
          <PanelCard title="Recent admissions">
            {(admissionsQ.data ?? []).length ? (
              <ul className="space-y-2.5">
                {(admissionsQ.data ?? []).map((a, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.applicant_name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{a.desired_level} · {formatDate(a.submitted_at)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={CalendarDays} message="No applications" />
            )}
          </PanelCard>

          <PanelCard title="Enabled modules">
            <div className="flex flex-wrap gap-1.5">
              {modules.map(m => (
                <span key={m} className="badge badge-brand">
                  <ToggleRight size={12} /> {m.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
              Modules can be switched on or off per school — features hide across every dashboard instantly.
            </p>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
