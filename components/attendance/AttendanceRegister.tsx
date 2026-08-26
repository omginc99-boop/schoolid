'use client';

// Daily register. A teacher picks a class and date, taps a status per student
// and saves. Writes go straight to Postgres — RLS decides whether this person
// is allowed to mark this school's register, not the UI.
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, EmptyState } from '@/components/ui/primitives';
import type { AttendanceStatus } from '@/lib/types';
import { Check, Clock, Loader2, Save, UserX, FileText, ClipboardCheck } from 'lucide-react';

interface ClassOption { id: string; name: string; level: string | null }
interface StudentRow { profileId: string; name: string; schoolidNumber: string | null }

const STATUSES: { value: AttendanceStatus; label: string; icon: typeof Check; tone: string }[] = [
  { value: 'present', label: 'Present', icon: Check, tone: 'ok' },
  { value: 'late', label: 'Late', icon: Clock, tone: 'warn' },
  { value: 'absent', label: 'Absent', icon: UserX, tone: 'bad' },
  { value: 'excused', label: 'Excused', icon: FileText, tone: 'brand' },
];

const TONE_BG: Record<string, string> = {
  ok: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger)', brand: 'var(--brand)',
};

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AttendanceRegister({
  classes, schoolId, myProfileId,
}: { classes: ClassOption[]; schoolId: string; myProfileId: string }) {
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const [date, setDate] = useState(todayIso());
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();

    const [{ data: enrolled, error: e1 }, { data: existing }] = await Promise.all([
      supabase
        .from('enrollments')
        .select('student_profile_id, profiles!enrollments_student_profile_id_fkey(schoolid_number, people(full_name))')
        .eq('class_id', classId)
        .eq('status', 'active'),
      supabase
        .from('attendance')
        .select('student_profile_id, status')
        .eq('class_id', classId)
        .eq('date', date),
    ]);

    if (e1) {
      setError(e1.message);
      setLoading(false);
      return;
    }

    const rows: StudentRow[] = (enrolled ?? []).map(r => {
      const p = r.profiles as { schoolid_number?: string; people?: { full_name?: string } } | null;
      return {
        profileId: r.student_profile_id,
        name: p?.people?.full_name ?? 'Student',
        schoolidNumber: p?.schoolid_number ?? null,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Prefill: whatever is already recorded for this class/date, else Present.
    const prefill: Record<string, AttendanceStatus> = {};
    for (const r of rows) prefill[r.profileId] = 'present';
    for (const a of existing ?? []) prefill[a.student_profile_id] = a.status as AttendanceStatus;

    setStudents(rows);
    setMarks(prefill);
    if ((existing ?? []).length) {
      setMessage(`Register already taken for this date — showing what was saved. Change anything and save again.`);
    }
    setLoading(false);
  }, [classId, date]);

  useEffect(() => { load(); }, [load]);

  function setAll(status: AttendanceStatus) {
    setMarks(Object.fromEntries(students.map(s => [s.profileId, status])));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const rows = students.map(s => ({
      school_id: schoolId,
      student_profile_id: s.profileId,
      class_id: classId,
      date,
      status: marks[s.profileId] ?? 'present',
      recorded_by: myProfileId,
    }));
    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_profile_id,class_id,date' });
    if (error) setError(error.message);
    else setMessage(`Register saved — ${rows.length} students marked for ${date}.`);
    setSaving(false);
  }

  const counts = STATUSES.map(s => ({
    ...s,
    n: students.filter(st => (marks[st.profileId] ?? 'present') === s.value).length,
  }));

  if (!classes.length) {
    return (
      <div className="card">
        <EmptyState icon={ClipboardCheck} message="No classes assigned to you"
          hint="Ask your administrator to assign you to a class before taking a register." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div>
          <label htmlFor="cls" className="text-sm font-medium">Class</label>
          <select id="cls" className="input mt-1.5" value={classId}
            onChange={e => setClassId(e.target.value)} disabled={loading || saving}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="dt" className="text-sm font-medium">Date</label>
          <input id="dt" type="date" className="input mt-1.5" value={date} max={todayIso()}
            onChange={e => setDate(e.target.value)} disabled={loading || saving} />
        </div>
        <button onClick={save} className="btn btn-primary !py-2.5" disabled={loading || saving || !students.length}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save register
        </button>
      </div>

      {message ? (
        <p className="text-[13px] rounded-xl p-3" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{message}</p>
      ) : null}
      {error ? (
        <p className="text-[13px] rounded-xl p-3" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>{error}</p>
      ) : null}

      {/* Summary + bulk actions */}
      <div className="card p-4 flex flex-wrap items-center gap-2">
        {counts.map(c => (
          <span key={c.value} className={`badge badge-${c.tone === 'ok' ? 'ok' : c.tone === 'warn' ? 'warn' : c.tone === 'bad' ? 'bad' : 'brand'}`}>
            {c.label}: {c.n}
          </span>
        ))}
        <span className="ml-auto text-[13px]" style={{ color: 'var(--muted)' }}>Mark all:</span>
        <button className="btn btn-outline !py-1.5 !px-3 !text-xs" onClick={() => setAll('present')} disabled={loading}>Present</button>
        <button className="btn btn-outline !py-1.5 !px-3 !text-xs" onClick={() => setAll('absent')} disabled={loading}>Absent</button>
      </div>

      {/* Register */}
      <div className="card p-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} /></div>
        ) : students.length ? (
          <ul>
            {students.map((s, i) => {
              const current = marks[s.profileId] ?? 'present';
              return (
                <li key={s.profileId}
                  className="flex flex-wrap items-center gap-3 p-3"
                  style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <Avatar name={s.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    <p className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>{s.schoolidNumber}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUSES.map(st => {
                      const active = current === st.value;
                      const Icon = st.icon;
                      return (
                        <button key={st.value}
                          onClick={() => setMarks(m => ({ ...m, [s.profileId]: st.value }))}
                          aria-pressed={active}
                          aria-label={`${st.label} — ${s.name}`}
                          className="btn !py-1.5 !px-3 !text-xs"
                          style={active
                            ? { background: TONE_BG[st.tone], color: '#fff', borderColor: 'transparent' }
                            : { background: 'transparent', color: 'var(--muted)', borderColor: 'var(--border)' }}>
                          <Icon size={13} /> {st.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={ClipboardCheck} message="No students enrolled in this class"
            hint="Enroll students first, then their names will appear here." />
        )}
      </div>
    </div>
  );
}
