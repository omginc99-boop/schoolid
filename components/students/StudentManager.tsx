'use client';

// Add students (one at a time or pasted in bulk), enroll them into a class,
// and link parents. Every student created here is issued a SchoolID number
// and QR token automatically by the database trigger.
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, EmptyState, StatusBadge } from '@/components/ui/primitives';
import {
  Loader2, UserPlus, Users, Upload, Check, AlertCircle, GraduationCap,
} from 'lucide-react';

interface Opt { id: string; name: string }
interface StudentRow {
  id: string; schoolid_number: string | null; email: string | null;
  verification_status: string; name: string; className: string;
}

type Tab = 'list' | 'add' | 'bulk' | 'parent';

export default function StudentManager({ schoolId }: { schoolId: string }) {
  const [tab, setTab] = useState<Tab>('list');
  const [classes, setClasses] = useState<Opt[]>([]);
  const [yearId, setYearId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [parents, setParents] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [{ data: cls }, { data: yr }, { data: profs }, { data: enr }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
      supabase.from('academic_years').select('id, is_current').eq('school_id', schoolId).order('starts_on', { ascending: false }),
      supabase.from('profiles').select('id, role, schoolid_number, email, verification_status, people(full_name)')
        .eq('school_id', schoolId).in('role', ['student', 'parent']).eq('status', 'active'),
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
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { refresh(); }, [refresh]);

  /** Creates person → profile (SchoolID issued by trigger) → optional enrollment. */
  async function createPerson(opts: {
    fullName: string; role: 'student' | 'parent'; email?: string;
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
            await createPerson({ fullName: v.name, role: 'student', email: v.email, classId: v.classId, title: v.title });
            setOk(`${v.name} added and issued a SchoolID.`);
            await refresh();
          } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
          setBusy(false);
        }} />
      ) : tab === 'bulk' ? (
        <BulkAdd classes={classes} busy={busy} onSubmit={async (lines, classId) => {
          setBusy(true); setError(null); setOk(null);
          let added = 0; const failures: string[] = [];
          for (const line of lines) {
            const [name, email] = line.split(',').map(p => p.trim());
            if (!name) continue;
            try { await createPerson({ fullName: name, role: 'student', email, classId }); added++; }
            catch (e) { failures.push(`${name}: ${e instanceof Error ? e.message : 'failed'}`); }
          }
          setOk(`${added} student${added === 1 ? '' : 's'} added${failures.length ? `; ${failures.length} failed` : ''}.`);
          if (failures.length) setError(failures.slice(0, 3).join(' · '));
          await refresh(); setBusy(false);
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

function AddStudentForm({ classes, busy, onSubmit }: {
  classes: Opt[]; busy: boolean;
  onSubmit: (v: { name: string; email?: string; classId?: string; title?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  return (
    <form className="card p-5 space-y-4" onSubmit={e => { e.preventDefault(); onSubmit({ name, email, classId }); setName(''); setEmail(''); }}>
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
            {classes.length ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              : <option value="">— create a class first —</option>}
          </select>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        The student is issued a SchoolID number and QR card automatically. If you give an email,
        they can sign in with it and their profile links itself.
      </p>
      <button type="submit" className="btn btn-primary" disabled={busy || !name}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add student
      </button>
    </form>
  );
}

function BulkAdd({ classes, busy, onSubmit }: {
  classes: Opt[]; busy: boolean; onSubmit: (lines: string[], classId: string) => void;
}) {
  const [text, setText] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <form className="card p-5 space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(lines, classId); setText(''); }}>
      <div>
        <label htmlFor="bclass" className="text-sm font-medium">Enroll all into class</label>
        <select id="bclass" className="input mt-1.5 max-w-xs" value={classId} onChange={e => setClassId(e.target.value)} disabled={busy}>
          {classes.length ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            : <option value="">— create a class first —</option>}
        </select>
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
      <button type="submit" className="btn btn-primary" disabled={busy || !lines.length}>
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
