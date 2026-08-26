'use client';

// School setup: academic years → terms → subjects → classes → teaching
// assignments. Everything writes straight to Postgres; RLS allows only
// school_admin / principal (and registrar where relevant) to make changes.
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import {
  CalendarRange, CalendarDays, BookOpen, Layers, UserCog,
  Loader2, Plus, Check, AlertCircle,
} from 'lucide-react';

type Tab = 'years' | 'terms' | 'subjects' | 'classes' | 'teaching';

interface Row { id: string; [k: string]: unknown }

const TABS: { key: Tab; label: string; icon: typeof CalendarRange }[] = [
  { key: 'years', label: 'Academic years', icon: CalendarRange },
  { key: 'terms', label: 'Terms', icon: CalendarDays },
  { key: 'subjects', label: 'Subjects', icon: BookOpen },
  { key: 'classes', label: 'Classes', icon: Layers },
  { key: 'teaching', label: 'Who teaches what', icon: UserCog },
];

export default function SchoolSetup({ schoolId }: { schoolId: string }) {
  const [tab, setTab] = useState<Tab>('years');
  const [years, setYears] = useState<Row[]>([]);
  const [terms, setTerms] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<Row[]>([]);
  const [classes, setClasses] = useState<Row[]>([]);
  const [teachers, setTeachers] = useState<Row[]>([]);
  const [assignments, setAssignments] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [y, t, s, c, te, cs] = await Promise.all([
      supabase.from('academic_years').select('*').eq('school_id', schoolId).order('starts_on', { ascending: false }),
      supabase.from('terms').select('*, academic_years(name)').eq('school_id', schoolId).order('starts_on'),
      supabase.from('subjects').select('*').eq('school_id', schoolId).order('name'),
      supabase.from('classes').select('*, academic_years(name), profiles!classes_homeroom_teacher_id_fkey(people(full_name))').eq('school_id', schoolId).order('name'),
      supabase.from('profiles').select('id, people(full_name)').eq('school_id', schoolId).eq('role', 'teacher').eq('status', 'active'),
      supabase.from('class_subjects').select('*, classes(name), subjects(name), profiles!class_subjects_teacher_profile_id_fkey(people(full_name))').eq('school_id', schoolId),
    ]);
    setYears(y.data ?? []); setTerms(t.data ?? []); setSubjects(s.data ?? []);
    setClasses(c.data ?? []); setTeachers(te.data ?? []); setAssignments(cs.data ?? []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function insert(table: string, values: Record<string, unknown>, label: string) {
    setBusy(true); setError(null); setOk(null);
    const supabase = createClient();
    const { error } = await supabase.from(table).insert({ school_id: schoolId, ...values });
    if (error) setError(error.message);
    else { setOk(`${label} added.`); await refresh(); }
    setBusy(false);
  }

  async function makeCurrent(table: 'academic_years' | 'terms', id: string) {
    setBusy(true); setError(null);
    const supabase = createClient();
    await supabase.from(table).update({ is_current: false }).eq('school_id', schoolId).eq('is_current', true);
    const { error } = await supabase.from(table).update({ is_current: true }).eq('id', id);
    if (error) setError(error.message); else { setOk('Updated.'); await refresh(); }
    setBusy(false);
  }

  const currentYear = years.find(y => y.is_current) ?? years[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setOk(null); setError(null); }}
              className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'} !py-2 !px-3.5 !text-[13px]`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</p> : null}
      {ok ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}><Check size={15} className="shrink-0 mt-0.5" />{ok}</p> : null}

      {loading ? (
        <div className="card flex justify-center py-12"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} /></div>
      ) : (
        <>
          {tab === 'years' && (
            <Section title="Academic years" hint="The school year, e.g. 2026/2027. Mark one as current.">
              <Form busy={busy} onSubmit={v => insert('academic_years', {
                name: v.name, starts_on: v.starts_on, ends_on: v.ends_on,
                is_current: years.length === 0,
              }, 'Academic year')} fields={[
                { name: 'name', label: 'Name', placeholder: '2026/2027', required: true },
                { name: 'starts_on', label: 'Starts', type: 'date', required: true },
                { name: 'ends_on', label: 'Ends', type: 'date', required: true },
              ]} />
              <List rows={years} empty="No academic years yet" cols={['Name', 'Starts', 'Ends', '']}
                render={r => [
                  String(r.name),
                  formatDate(r.starts_on as string),
                  formatDate(r.ends_on as string),
                  r.is_current
                    ? <span className="badge badge-ok">current</span>
                    : <button className="btn btn-outline !py-1 !px-2.5 !text-xs" disabled={busy}
                        onClick={() => makeCurrent('academic_years', r.id)}>Make current</button>,
                ]} />
            </Section>
          )}

          {tab === 'terms' && (
            <Section title="Terms" hint="Terms sit inside an academic year — First, Second, Third.">
              {years.length === 0 ? (
                <Note>Create an academic year first.</Note>
              ) : (
                <Form busy={busy} onSubmit={v => insert('terms', {
                  academic_year_id: v.academic_year_id, name: v.name,
                  starts_on: v.starts_on, ends_on: v.ends_on, is_current: terms.length === 0,
                }, 'Term')} fields={[
                  { name: 'academic_year_id', label: 'Academic year', type: 'select', required: true,
                    options: years.map(y => ({ value: y.id, label: String(y.name) })) },
                  { name: 'name', label: 'Term name', placeholder: 'First Term', required: true },
                  { name: 'starts_on', label: 'Starts', type: 'date', required: true },
                  { name: 'ends_on', label: 'Ends', type: 'date', required: true },
                ]} />
              )}
              <List rows={terms} empty="No terms yet" cols={['Term', 'Year', 'Starts', 'Ends', '']}
                render={r => [
                  String(r.name),
                  String((r.academic_years as { name?: string } | null)?.name ?? '—'),
                  formatDate(r.starts_on as string),
                  formatDate(r.ends_on as string),
                  r.is_current
                    ? <span className="badge badge-ok">current</span>
                    : <button className="btn btn-outline !py-1 !px-2.5 !text-xs" disabled={busy}
                        onClick={() => makeCurrent('terms', r.id)}>Make current</button>,
                ]} />
            </Section>
          )}

          {tab === 'subjects' && (
            <Section title="Subjects" hint="Everything taught at the school — Mathematics, English, Basic Science…">
              <Form busy={busy} onSubmit={v => insert('subjects', { name: v.name, code: v.code || null }, 'Subject')}
                fields={[
                  { name: 'name', label: 'Subject', placeholder: 'Mathematics', required: true },
                  { name: 'code', label: 'Code (optional)', placeholder: 'MTH' },
                ]} />
              <List rows={subjects} empty="No subjects yet" cols={['Subject', 'Code']}
                render={r => [String(r.name), String(r.code ?? '—')]} />
            </Section>
          )}

          {tab === 'classes' && (
            <Section title="Classes" hint="Each class belongs to an academic year and can have a homeroom teacher.">
              {years.length === 0 ? (
                <Note>Create an academic year first.</Note>
              ) : (
                <Form busy={busy} onSubmit={v => insert('classes', {
                  academic_year_id: v.academic_year_id, name: v.name, level: v.level || null,
                  homeroom_teacher_id: v.homeroom_teacher_id || null,
                }, 'Class')} fields={[
                  { name: 'name', label: 'Class name', placeholder: 'JSS 1A', required: true },
                  { name: 'level', label: 'Level (optional)', placeholder: 'JSS 1' },
                  { name: 'academic_year_id', label: 'Academic year', type: 'select', required: true,
                    options: years.map(y => ({ value: y.id, label: String(y.name) })),
                    defaultValue: currentYear ? String(currentYear.id) : undefined },
                  { name: 'homeroom_teacher_id', label: 'Homeroom teacher', type: 'select',
                    options: [{ value: '', label: '— none —' }, ...teachers.map(t => ({
                      value: t.id, label: String((t.people as { full_name?: string } | null)?.full_name ?? 'Teacher') }))] },
                ]} />
              )}
              <List rows={classes} empty="No classes yet" cols={['Class', 'Level', 'Year', 'Homeroom teacher']}
                render={r => [
                  String(r.name), String(r.level ?? '—'),
                  String((r.academic_years as { name?: string } | null)?.name ?? '—'),
                  String((r.profiles as { people?: { full_name?: string } } | null)?.people?.full_name ?? '—'),
                ]} />
            </Section>
          )}

          {tab === 'teaching' && (
            <Section title="Who teaches what" hint="Assign a subject and teacher to a class. This is what puts classes on a teacher's register.">
              {classes.length === 0 || subjects.length === 0 ? (
                <Note>Create at least one class and one subject first.</Note>
              ) : (
                <Form busy={busy} onSubmit={v => insert('class_subjects', {
                  class_id: v.class_id, subject_id: v.subject_id,
                  teacher_profile_id: v.teacher_profile_id || null,
                }, 'Teaching assignment')} fields={[
                  { name: 'class_id', label: 'Class', type: 'select', required: true,
                    options: classes.map(c => ({ value: c.id, label: String(c.name) })) },
                  { name: 'subject_id', label: 'Subject', type: 'select', required: true,
                    options: subjects.map(s => ({ value: s.id, label: String(s.name) })) },
                  { name: 'teacher_profile_id', label: 'Teacher', type: 'select',
                    options: [{ value: '', label: '— unassigned —' }, ...teachers.map(t => ({
                      value: t.id, label: String((t.people as { full_name?: string } | null)?.full_name ?? 'Teacher') }))] },
                ]} />
              )}
              <List rows={assignments} empty="Nothing assigned yet" cols={['Class', 'Subject', 'Teacher']}
                render={r => [
                  String((r.classes as { name?: string } | null)?.name ?? '—'),
                  String((r.subjects as { name?: string } | null)?.name ?? '—'),
                  String((r.profiles as { people?: { full_name?: string } } | null)?.people?.full_name ?? 'unassigned'),
                ]} />
            </Section>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] rounded-xl p-3" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
      {children}
    </p>
  );
}

interface Field {
  name: string; label: string; type?: 'text' | 'date' | 'select';
  placeholder?: string; required?: boolean; defaultValue?: string;
  options?: { value: string; label: string }[];
}

function Form({ fields, onSubmit, busy }: {
  fields: Field[]; onSubmit: (values: Record<string, string>) => void; busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? (f.type === 'select' ? (f.options?.[0]?.value ?? '') : '')])));

  return (
    <form className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end"
      onSubmit={e => { e.preventDefault(); onSubmit(values); }}>
      {fields.map(f => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-sm font-medium">{f.label}</label>
          {f.type === 'select' ? (
            <select id={f.name} className="input mt-1.5" value={values[f.name] ?? ''} required={f.required}
              onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} disabled={busy}>
              {(f.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input id={f.name} type={f.type ?? 'text'} className="input mt-1.5" placeholder={f.placeholder}
              value={values[f.name] ?? ''} required={f.required}
              onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} disabled={busy} />
          )}
        </div>
      ))}
      <button type="submit" className="btn btn-primary !py-2.5" disabled={busy}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
      </button>
    </form>
  );
}

function List({ rows, cols, render, empty }: {
  rows: Row[]; cols: string[]; render: (r: Row) => React.ReactNode[]; empty: string;
}) {
  if (!rows.length) return <div className="card"><EmptyState message={empty} /></div>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>{render(r).map((cell, i) => <td key={i}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
