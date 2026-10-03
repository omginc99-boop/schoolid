'use client';

// Add students (one at a time or pasted in bulk), enroll them into a class,
// and link parents. Every student created here is issued a SchoolID number
// and QR token automatically by the database trigger.
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, EmptyState, StatusBadge } from '@/components/ui/primitives';
import {
  Loader2, UserPlus, Users, Upload, Check, AlertCircle, GraduationCap, Briefcase,
} from 'lucide-react';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';

interface Opt { id: string; name: string }
interface StudentRow {
  id: string; schoolid_number: string | null; email: string | null;
  verification_status: string; name: string; className: string;
}
interface StaffRow {
  id: string; name: string; role: UserRole; title: string | null;
  email: string | null; schoolid_number: string | null;
}

const NEW_CLASS = '__new__';

const STAFF_ROLES: UserRole[] = [
  'teacher', 'principal', 'school_admin', 'finance', 'librarian',
  'transport', 'security', 'counselor', 'registrar',
];

type Tab = 'list' | 'add' | 'bulk' | 'parent' | 'staff';

export default function StudentManager({ schoolId }: { schoolId: string }) {
  const [tab, setTab] = useState<Tab>('list');
  const [classes, setClasses] = useState<Opt[]>([]);
  const [yearId, setYearId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [parents, setParents] = useState<Opt[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [{ data: cls }, { data: yr }, { data: profs }, { data: enr }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
      supabase.from('academic_years').select('id, is_current').eq('school_id', schoolId).order('starts_on', { ascending: false }),
      supabase.from('profiles').select('id, role, title, schoolid_number, email, verification_status, people(full_name)')
        .eq('school_id', schoolId).eq('status', 'active'),
      supabase.from('enrollments').select('student_profile_id, classes(name)').eq('school_id', schoolId).eq('status', 'active'),
    ]);

    const classMap = new Map((enr ?? []).map(e => [e.student_profile_id, (e.classes as { name?: string } | null)?.name ?? '—']));
    const all = profs ?? [];
    setClasses((cls ?? []).map(c => ({ id: c.id, name: c.name })));
    setYearId(((yr ?? []).find(y => y.is_current) ?? (yr ?? [])[0])?.id ?? null);
    setStudents(all.filter(p => p.role === 'student').map(p => ({
      id: p.id, schoolid_number: p.schoolid_number, email: p.email,
      verification_status: p.verification_status,
      name: (p.people as { full_name?: string } | null)?.full_name ?? 'Student',
      className: classMap.get(p.id) ?? 'not enrolled',
    })).sort((a, b) => a.name.localeCompare(b.name)));
    setParents(all.filter(p => p.role === 'parent').map(p => ({
      id: p.id, name: (p.people as { full_name?: string } | null)?.full_name ?? 'Parent',
    })));
    setStaff(all.filter(p => STAFF_ROLES.includes(p.role as UserRole)).map(p => ({
      id: p.id, role: p.role as UserRole, title: p.title as string | null,
      email: p.email, schoolid_number: p.schoolid_number,
      name: (p.people as { full_name?: string } | null)?.full_name ?? 'Staff',
    })).sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { refresh(); }, [refresh]);

  /** Resolves a class picker value to a real class_id, creating the class
   *  first if the school typed a brand-new name instead of picking one. */
  async function ensureClassId(classId: string, newClassName?: string): Promise<string> {
    if (classId !== NEW_CLASS) return classId;
    const name = (newClassName ?? '').trim();
    if (!name) throw new Error('Enter a name for the new class');
    if (!yearId) throw new Error('Set up an academic year first, in School setup → Academic years');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('classes')
      .insert({ school_id: schoolId, academic_year_id: yearId, name })
      .select('id')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Could not create class');
    setClasses(prev => [...prev, { id: data.id, name }].sort((a, b) => a.name.localeCompare(b.name)));
    return data.id;
  }

  /** Creates person → profile (SchoolID issued by trigger) → optional enrollment. */
  async function createPerson(opts: {
    fullName: string; role: UserRole; email?: string;
    classId?: string; title?: string;
  }): Promise<string> {
    const supabase = createClient();
    const { data: person, error: e1 } = await supabase
      .from('people').insert({ full_name: opts.fullName }).select('id').single();
    if (e1 || !person) throw new Error(e1?.message ?? 'Could not create person record');

    const { data: profile, error: e2 } = await supabase
      .from('profiles').insert({
        person_id: person.id, school_id: schoolId, role: opts.role,
        email: opts.email || null, verification_status: 'school_verified',
        title: opts.title ?? (opts.role === 'student' ? 'Student' : 'Parent'),
      }).select('id').single();
    if (e2 || !profile) throw new Error(e2?.message ?? 'Could not create profile');

    if (opts.role === 'student' && opts.classId && yearId) {
      const { error: e3 } = await supabase.from('enrollments').insert({
        school_id: schoolId, student_profile_id: profile.id,
        class_id: opts.classId, academic_year_id: yearId,
      });
      if (e3) throw new Error(`Student created but not enrolled: ${e3.message}`);
    }
    return profile.id;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {([
          ['list', 'Students', Users], ['add', 'Add student', UserPlus],
          ['bulk', 'Bulk add', Upload], ['parent', 'Parents', GraduationCap],
          ['staff', 'Staff & teachers', Briefcase],
        ] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => { setTab(k as Tab); setOk(null); setError(null); }}
            className={`btn ${tab === k ? 'btn-primary' : 'btn-outline'} !py-2 !px-3.5 !text-[13px]`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {error ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</p> : null}
      {ok ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}><Check size={15} className="shrink-0 mt-0.5" />{ok}</p> : null}

      {loading ? (
        <div className="card flex justify-center py-12"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} /></div>
      ) : tab === 'list' ? (
        students.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>SchoolID</th><th>Class</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td><div className="flex items-center gap-2.5"><Avatar name={s.name} size={28} /><span className="font-medium">{s.name}</span></div></td>
                    <td className="font-mono text-[13px]">{s.schoolid_number}</td>
                    <td>{s.className}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.email ?? '—'}</td>
                    <td><StatusBadge status={s.verification_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card"><EmptyState icon={Users} message="No students yet"
            hint="Use 'Add student' for one, or 'Bulk add' to paste a whole class at once." /></div>
        )
      ) : tab === 'add' ? (
        <AddStudentForm classes={classes} busy={busy} onSubmit={async v => {
          setBusy(true); setError(null); setOk(null);
          try {
            const classId = v.classId ? await ensureClassId(v.classId, v.newClassName) : undefined;
            await createPerson({ fullName: v.name, role: 'student', email: v.email, classId, title: v.title });
            setOk(`${v.name} added and issued a SchoolID.`);
            await refresh();
          } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
          setBusy(false);
        }} />
      ) : tab === 'bulk' ? (
        <BulkAdd classes={classes} busy={busy} onSubmit={async (lines, classId, newClassName) => {
          setBusy(true); setError(null); setOk(null);
          try {
            const realClassId = await ensureClassId(classId, newClassName);
            let added = 0; const failures: string[] = [];
            for (const line of lines) {
              const [name, email] = line.split(',').map(p => p.trim());
              if (!name) continue;
              try { await createPerson({ fullName: name, role: 'student', email, classId: realClassId }); added++; }
              catch (e) { failures.push(`${name}: ${e instanceof Error ? e.message : 'failed'}`); }
            }
            setOk(`${added} student${added === 1 ? '' : 's'} added${failures.length ? `; ${failures.length} failed` : ''}.`);
            if (failures.length) setError(failures.slice(0, 3).join(' · '));
            await refresh();
          } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
          setBusy(false);
        }} />
      ) : tab === 'staff' ? (
        <StaffPanel staff={staff} busy={busy} onAdd={async (name, email, role, title) => {
          setBusy(true); setError(null); setOk(null);
          try {
            await createPerson({ fullName: name, role, email, title });
            setOk(`${name} added as ${roleMeta(role).label}. They sign in with ${email || 'their email'} and their profile links automatically.`);
            await refresh();
          } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
          setBusy(false);
        }} />
      ) : (
        <ParentLink parents={parents} students={students} busy={busy} schoolId={schoolId}
          onCreateParent={async (name, email) => {
            setBusy(true); setError(null); setOk(null);
            try { await createPerson({ fullName: name, role: 'parent', email }); setOk(`${name} added as a parent.`); await refresh(); }
            catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
            setBusy(false);
          }}
          onLink={async (parentId, studentId, relationship) => {
            setBusy(true); setError(null); setOk(null);
            const supabase = createClient();
            const { error } = await supabase.from('guardians').insert({
              school_id: schoolId, parent_profile_id: parentId,
              student_profile_id: studentId, relationship,
            });
            if (error) setError(error.message); else setOk('Parent linked to child.');
            setBusy(false);
          }} />
      )}
    </div>
  );
}

function StaffPanel({ staff, busy, onAdd }: {
  staff: StaffRow[]; busy: boolean;
  onAdd: (name: string, email: string, role: UserRole, title: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [title, setTitle] = useState('');
  return (
    <div className="space-y-4">
      <form className="card p-5 space-y-4"
        onSubmit={e => { e.preventDefault(); onAdd(name, email, role, title || roleMeta(role).label); setName(''); setEmail(''); setTitle(''); }}>
        <h3 className="section-title">Add a staff member</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="stname" className="text-sm font-medium">Full name</label>
            <input id="stname" required className="input mt-1.5" placeholder="e.g. David Adekunle"
              value={name} onChange={e => setName(e.target.value)} disabled={busy} />
          </div>
          <div>
            <label htmlFor="stemail" className="text-sm font-medium">Email</label>
            <input id="stemail" type="email" className="input mt-1.5" placeholder="teacher@school.edu"
              value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
          </div>
          <div>
            <label htmlFor="strole" className="text-sm font-medium">Role</label>
            <select id="strole" className="input mt-1.5" value={role}
              onChange={e => setRole(e.target.value as UserRole)} disabled={busy}>
              {STAFF_ROLES.map(r => <option key={r} value={r}>{roleMeta(r).label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sttitle" className="text-sm font-medium">Job title (optional)</label>
            <input id="sttitle" className="input mt-1.5" placeholder="Mathematics Teacher"
              value={title} onChange={e => setTitle(e.target.value)} disabled={busy} />
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Give the email they will sign in with — when they create an account with that address,
          this profile links to them automatically and opens their role&apos;s dashboard.
        </p>
        <button type="submit" className="btn btn-primary" disabled={busy || !name}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add staff member
        </button>
      </form>

      {staff.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Role</th><th>SchoolID</th><th>Email</th></tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size={28} />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.title}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-brand">{roleMeta(s.role).label}</span></td>
                  <td className="font-mono text-[13px]">{s.schoolid_number}</td>
                  <td style={{ color: 'var(--muted)' }}>{s.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card"><EmptyState icon={Briefcase} message="No staff yet"
          hint="Add teachers first — they're needed before you can assign who teaches what." /></div>
      )}
    </div>
  );
}

function AddStudentForm({ classes, busy, onSubmit }: {
  classes: Opt[]; busy: boolean;
  onSubmit: (v: { name: string; email?: string; classId?: string; newClassName?: string; title?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id ?? NEW_CLASS);
  const [newClassName, setNewClassName] = useState('');
  const creatingNew = classId === NEW_CLASS;
  return (
    <form className="card p-5 space-y-4" onSubmit={e => {
      e.preventDefault();
      onSubmit({ name, email, classId, newClassName: creatingNew ? newClassName : undefined });
      setName(''); setEmail(''); setNewClassName('');
    }}>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sname" className="text-sm font-medium">Full name</label>
          <input id="sname" required className="input mt-1.5" placeholder="e.g. Chidera Okafor"
            value={name} onChange={e => setName(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label htmlFor="semail" className="text-sm font-medium">Email (optional)</label>
          <input id="semail" type="email" className="input mt-1.5" placeholder="student@school.edu"
            value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label htmlFor="sclass" className="text-sm font-medium">Class</label>
          <select id="sclass" className="input mt-1.5" value={classId} onChange={e => setClassId(e.target.value)} disabled={busy}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value={NEW_CLASS}>+ Create new class…</option>
          </select>
        </div>
      </div>
      {creatingNew && (
        <div>
          <label htmlFor="snewclass" className="text-sm font-medium">New class name</label>
          <input id="snewclass" required className="input mt-1.5" placeholder="e.g. Kindergarten, KG1, Reception"
            value={newClassName} onChange={e => setNewClassName(e.target.value)} disabled={busy} />
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        The student is issued a SchoolID number and QR card automatically. If you give an email,
        they can sign in with it and their profile links itself.
      </p>
      <button type="submit" className="btn btn-primary" disabled={busy || !name || (creatingNew && !newClassName.trim())}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add student
      </button>
    </form>
  );
}

function BulkAdd({ classes, busy, onSubmit }: {
  classes: Opt[]; busy: boolean; onSubmit: (lines: string[], classId: string, newClassName?: string) => void;
}) {
  const [text, setText] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id ?? NEW_CLASS);
  const [newClassName, setNewClassName] = useState('');
  const creatingNew = classId === NEW_CLASS;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <form className="card p-5 space-y-4" onSubmit={e => {
      e.preventDefault();
      onSubmit(lines, classId, creatingNew ? newClassName : undefined);
      setText(''); setNewClassName('');
    }}>
      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label htmlFor="bclass" className="text-sm font-medium">Enroll all into class</label>
          <select id="bclass" className="input mt-1.5" value={classId} onChange={e => setClassId(e.target.value)} disabled={busy}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value={NEW_CLASS}>+ Create new class…</option>
          </select>
        </div>
        {creatingNew && (
          <div>
            <label htmlFor="bnewclass" className="text-sm font-medium">New class name</label>
            <input id="bnewclass" required className="input mt-1.5" placeholder="e.g. Kindergarten, KG1, Reception"
              value={newClassName} onChange={e => setNewClassName(e.target.value)} disabled={busy} />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="blist" className="text-sm font-medium">Paste students — one per line</label>
        <textarea id="blist" className="input mt-1.5 font-mono" rows={10} disabled={busy}
          placeholder={"Chidera Okafor\nAmina Bello, amina@school.edu\nTunde Adeyemi"}
          value={text} onChange={e => setText(e.target.value)} />
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Format: <code className="font-mono">Full Name</code> or <code className="font-mono">Full Name, email</code>.
          Straight from a spreadsheet column works.
        </p>
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy || !lines.length || (creatingNew && !newClassName.trim())}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        Add {lines.length || ''} student{lines.length === 1 ? '' : 's'}
      </button>
    </form>
  );
}

function ParentLink({ parents, students, busy, onCreateParent, onLink }: {
  parents: Opt[]; students: StudentRow[]; busy: boolean; schoolId: string;
  onCreateParent: (name: string, email: string) => void;
  onLink: (parentId: string, studentId: string, relationship: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [parentId, setParentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [rel, setRel] = useState('parent');
  return (
    <div className="space-y-4">
      <form className="card p-5 space-y-4" onSubmit={e => { e.preventDefault(); onCreateParent(name, email); setName(''); setEmail(''); }}>
        <h3 className="section-title">Add a parent</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pname" className="text-sm font-medium">Full name</label>
            <input id="pname" required className="input mt-1.5" placeholder="e.g. Nnamdi Okafor"
              value={name} onChange={e => setName(e.target.value)} disabled={busy} />
          </div>
          <div>
            <label htmlFor="pemail" className="text-sm font-medium">Email</label>
            <input id="pemail" type="email" className="input mt-1.5" placeholder="parent@example.com"
              value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !name}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add parent
        </button>
      </form>

      <form className="card p-5 space-y-4" onSubmit={e => { e.preventDefault(); onLink(parentId, studentId, rel); }}>
        <h3 className="section-title">Link a parent to a child</h3>
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          Once linked, the parent sees that child&apos;s attendance, results and fees — and nothing else.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="lp" className="text-sm font-medium">Parent</label>
            <select id="lp" className="input mt-1.5" value={parentId} onChange={e => setParentId(e.target.value)} disabled={busy}>
              <option value="">— choose —</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ls" className="text-sm font-medium">Child</label>
            <select id="ls" className="input mt-1.5" value={studentId} onChange={e => setStudentId(e.target.value)} disabled={busy}>
              <option value="">— choose —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lr" className="text-sm font-medium">Relationship</label>
            <select id="lr" className="input mt-1.5" value={rel} onChange={e => setRel(e.target.value)} disabled={busy}>
              {['parent', 'mother', 'father', 'guardian'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !parentId || !studentId}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Link
        </button>
      </form>
    </div>
  );
}
