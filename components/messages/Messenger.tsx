'use client';

// Teacher ↔ parent (and staff) messaging. RLS guarantees a message row is
// only ever readable by its sender and recipient — no thread can leak.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, EmptyState } from '@/components/ui/primitives';
import { roleMeta } from '@/lib/roles';
import type { UserRole } from '@/lib/types';
import { Loader2, MessageSquare, Send, PenSquare, ArrowLeft } from 'lucide-react';

interface Msg {
  id: string; body: string; created_at: string; read_at: string | null;
  sender_profile_id: string; recipient_profile_id: string;
}
interface Person { id: string; name: string; role: UserRole; title: string | null }

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Messenger({ myProfileId, schoolId }: { myProfileId: string; schoolId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [directory, setDirectory] = useState<Person[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: msgs, error: e1 }, { data: profs }] = await Promise.all([
      supabase.from('messages')
        .select('id, body, created_at, read_at, sender_profile_id, recipient_profile_id')
        .or(`sender_profile_id.eq.${myProfileId},recipient_profile_id.eq.${myProfileId}`)
        .order('created_at', { ascending: true }).limit(500),
      supabase.from('profiles')
        .select('id, role, title, people(full_name)')
        .eq('school_id', schoolId).eq('status', 'active').limit(500),
    ]);
    if (e1) setError(e1.message);

    const dir: Person[] = (profs ?? []).map(p => ({
      id: p.id, role: p.role as UserRole, title: p.title as string | null,
      name: (p.people as { full_name?: string } | null)?.full_name ?? 'Member',
    }));
    setPeople(Object.fromEntries(dir.map(p => [p.id, p])));
    setDirectory(dir.filter(p => p.id !== myProfileId).sort((a, b) => a.name.localeCompare(b.name)));
    setMessages(msgs ?? []);
    setLoading(false);
  }, [myProfileId, schoolId]);

  useEffect(() => { load(); }, [load]);

  // Group into conversations keyed by the other person.
  const threads = useMemo(() => {
    const map = new Map<string, Msg[]>();
    for (const m of messages) {
      const other = m.sender_profile_id === myProfileId ? m.recipient_profile_id : m.sender_profile_id;
      map.set(other, [...(map.get(other) ?? []), m]);
    }
    return [...map.entries()]
      .map(([id, msgs]) => ({
        id, msgs,
        last: msgs[msgs.length - 1],
        unread: msgs.filter(m => m.recipient_profile_id === myProfileId && !m.read_at).length,
      }))
      .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }, [messages, myProfileId]);

  const active = threads.find(t => t.id === activeId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Mark this thread's incoming messages as read.
    if (!activeId) return;
    const unread = (active?.msgs ?? []).filter(m => m.recipient_profile_id === myProfileId && !m.read_at);
    if (!unread.length) return;
    const supabase = createClient();
    supabase.from('messages').update({ read_at: new Date().toISOString() })
      .in('id', unread.map(m => m.id)).then(() => {
        setMessages(ms => ms.map(m => unread.some(u => u.id === m.id) ? { ...m, read_at: new Date().toISOString() } : m));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active?.msgs.length]);

  async function send() {
    const text = body.trim();
    if (!text || !activeId) return;
    setSending(true); setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.from('messages').insert({
      school_id: schoolId, sender_profile_id: myProfileId,
      recipient_profile_id: activeId, body: text,
    }).select('id, body, created_at, read_at, sender_profile_id, recipient_profile_id').single();
    if (error) setError(error.message);
    else if (data) { setMessages(m => [...m, data as Msg]); setBody(''); }
    setSending(false);
  }

  if (loading) {
    return <div className="card flex justify-center py-16"><Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} /></div>;
  }

  return (
    <div className="card overflow-hidden" style={{ minHeight: 520 }}>
      <div className="grid md:grid-cols-[280px_1fr] h-full">
        {/* Conversation list */}
        <div className={`${activeId ? 'hidden md:block' : ''}`} style={{ borderRight: '1px solid var(--border)' }}>
          <div className="p-3 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="section-title">Conversations</span>
            <button className="btn btn-outline !py-1.5 !px-2.5 !text-xs" onClick={() => setComposing(c => !c)}>
              <PenSquare size={13} /> New
            </button>
          </div>

          {composing ? (
            <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <label htmlFor="to" className="text-xs font-medium">Message someone</label>
              <select id="to" className="input mt-1.5 !text-[13px]" defaultValue=""
                onChange={e => { if (e.target.value) { setActiveId(e.target.value); setComposing(false); } }}>
                <option value="">— choose a person —</option>
                {directory.map(p => (
                  <option key={p.id} value={p.id}>{p.name} · {roleMeta(p.role).label}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div style={{ maxHeight: 440, overflowY: 'auto' }}>
            {threads.length ? threads.map(t => {
              const p = people[t.id];
              return (
                <button key={t.id} onClick={() => setActiveId(t.id)}
                  className="w-full text-left p-3 flex gap-2.5 items-center"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: activeId === t.id ? 'var(--brand-soft)' : 'transparent',
                  }}>
                  <Avatar name={p?.name ?? 'Member'} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{p?.name ?? 'Member'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{t.last.body}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{timeLabel(t.last.created_at)}</p>
                    {t.unread ? <span className="badge badge-brand mt-1">{t.unread}</span> : null}
                  </div>
                </button>
              );
            }) : (
              <EmptyState icon={MessageSquare} message="No conversations yet" hint="Tap New to message a teacher or parent." />
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={`${activeId ? '' : 'hidden md:flex'} flex flex-col`} style={{ minHeight: 520 }}>
          {active ? (
            <>
              <div className="p-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <button className="btn btn-outline !p-2 md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                  <ArrowLeft size={15} />
                </button>
                <Avatar name={people[active.id]?.name ?? 'Member'} size={34} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{people[active.id]?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {people[active.id] ? roleMeta(people[active.id].role).label : ''}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-2.5" style={{ maxHeight: 380, overflowY: 'auto' }}>
                {active.msgs.map(m => {
                  const mine = m.sender_profile_id === myProfileId;
                  return (
                    <div key={m.id}
                      className={`max-w-[80%] rounded-2xl p-3 text-sm ${mine ? 'ml-auto rounded-br-md' : 'mr-auto rounded-bl-md'}`}
                      style={mine ? { background: 'var(--brand)', color: '#fff' } : { background: 'var(--surface-2)' }}>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      <p className="text-[10px] mt-1" style={{ opacity: 0.7 }}>{timeLabel(m.created_at)}</p>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {error ? <p className="mx-4 mb-2 text-[13px] rounded-xl p-2.5" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>{error}</p> : null}

              <form className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}
                onSubmit={e => { e.preventDefault(); send(); }}>
                <input className="input" placeholder="Write a message…" value={body}
                  onChange={e => setBody(e.target.value)} disabled={sending} aria-label="Message" />
                <button type="submit" className="btn btn-primary !px-4" disabled={sending || !body.trim()} aria-label="Send">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} message="Pick a conversation" hint="Or start a new one." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
