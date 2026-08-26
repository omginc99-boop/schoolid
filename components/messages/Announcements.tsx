'use client';

// School announcements. Staff publish to chosen audiences (optionally a
// single class, optionally as an emergency alert); everyone in the school
// reads what targets their role.
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/primitives';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { Loader2, Megaphone, Send, TriangleAlert, Check, AlertCircle } from 'lucide-react';

interface Row {
  id: string; title: string; body: string; is_emergency: boolean;
  audience_roles: UserRole[]; published_at: string; class_id: string | null;
  profiles?: { people?: { full_name?: string } } | null;
  classes?: { name?: string } | null;
}

const AUDIENCES: UserRole[] = ['student', 'parent', 'teacher', 'school_admin', 'finance', 'librarian', 'transport', 'security', 'counselor', 'registrar', 'principal'];

export default function Announcements({
  schoolId, myProfileId, canPublish,
}: { schoolId: string; myProfileId: string; canPublish: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<UserRole[]>(['student', 'parent', 'teacher']);
  const [classId, setClassId] = useState('');
  const [emergency, setEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data }, { data: cls }] = await Promise.all([
      supabase.from('announcements')
        .select('id, title, body, is_emergency, audience_roles, published_at, class_id, profiles!announcements_author_profile_id_fkey(people(full_name)), classes(name)')
        .eq('school_id', schoolId).order('published_at', { ascending: false }).limit(50),
      supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
    ]);
    setRows((data ?? []) as unknown as Row[]);
    setClasses(cls ?? []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !audience.length) return;
    setBusy(true); setError(null); setOk(null);
    const supabase = createClient();
    const { error } = await supabase.from('announcements').insert({
      school_id: schoolId, title: title.trim(), body: body.trim(),
      audience_roles: audience, class_id: classId || null,
      is_emergency: emergency, author_profile_id: myProfileId,
    });
    if (error) setError(error.message);
    else {
      setOk(emergency ? 'Emergency alert published.' : 'Announcement published.');
      setTitle(''); setBody(''); setEmergency(false); setClassId('');
      await load();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      {canPublish ? (
        <form className="card p-5 space-y-4" onSubmit={publish}>
          <h2 className="section-title">Publish an announcement</h2>

          <div>
            <label htmlFor="atitle" className="text-sm font-medium">Title</label>
            <input id="atitle" required className="input mt-1.5" placeholder="e.g. PTA meeting — Saturday 9am"
              value={title} onChange={e => setTitle(e.target.value)} disabled={busy} />
          </div>
          <div>
            <label htmlFor="abody" className="text-sm font-medium">Message</label>
            <textarea id="abody" required rows={3} className="input mt-1.5" placeholder="What do you want everyone to know?"
              value={body} onChange={e => setBody(e.target.value)} disabled={busy} />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Who should see this?</p>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCES.map(r => {
                const on = audience.includes(r);
                return (
                  <button key={r} type="button" disabled={busy}
                    onClick={() => setAudience(a => on ? a.filter(x => x !== r) : [...a, r])}
                    className="btn !py-1.5 !px-3 !text-xs"
                    style={on
                      ? { background: 'var(--brand)', color: '#fff', borderColor: 'transparent' }
                      : { background: 'transparent', color: 'var(--muted)', borderColor: 'var(--border)' }}>
                    {on ? <Check size={12} /> : null} {roleMeta(r).label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="acls" className="text-sm font-medium">Limit to one class (optional)</label>
              <select id="acls" className="input mt-1.5" value={classId}
                onChange={e => setClassId(e.target.value)} disabled={busy}>
                <option value="">Whole school</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer"
              style={{ background: emergency ? 'var(--danger-soft)' : 'var(--surface-2)' }}>
              <input type="checkbox" checked={emergency} disabled={busy}
                onChange={e => setEmergency(e.target.checked)} />
              <span className="text-sm font-medium flex items-center gap-1.5"
                style={{ color: emergency ? 'var(--danger)' : 'var(--text)' }}>
                <TriangleAlert size={15} /> Emergency alert
              </span>
            </label>
          </div>

          {error ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}><AlertCircle size={15} className="shrink-0 mt-0.5" />{error}</p> : null}
          {ok ? <p className="text-[13px] rounded-xl p-3 flex gap-2" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}><Check size={15} className="shrink-0 mt-0.5" />{ok}</p> : null}

          <button type="submit" className={`btn ${emergency ? 'btn-gold' : 'btn-primary'}`}
            disabled={busy || !title.trim() || !body.trim() || !audience.length}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {emergency ? 'Send emergency alert' : 'Publish announcement'}
          </button>
        </form>
      ) : null}

      {loading ? (
        <div className="card flex justify-center py-12"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} /></div>
      ) : rows.length ? (
        <div className="space-y-3">
          {rows.map(a => (
            <article key={a.id} className="card p-5"
              style={a.is_emergency ? { borderColor: 'var(--danger)' } : undefined}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h3 className="font-bold flex items-center gap-2">
                  {a.is_emergency
                    ? <TriangleAlert size={16} style={{ color: 'var(--danger)' }} />
                    : <Megaphone size={16} style={{ color: 'var(--brand)' }} />}
                  {a.title}
                </h3>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(a.published_at)}</span>
              </div>
              <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{a.body}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {a.classes?.name ? <span className="badge badge-gold">{a.classes.name}</span> : null}
                {(a.audience_roles ?? []).map(r => (
                  <span key={r} className="badge badge-muted">{roleMeta(r).label}</span>
                ))}
              </div>
              {a.profiles?.people?.full_name ? (
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>— {a.profiles.people.full_name}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="card"><EmptyState icon={Megaphone} message="No announcements yet"
          hint={canPublish ? 'Publish the first one above.' : 'School news will appear here.'} /></div>
      )}
    </div>
  );
}
