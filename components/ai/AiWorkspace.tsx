'use client';

import { useRef, useState } from 'react';
import { Loader2, Send, Sparkles, RotateCcw } from 'lucide-react';

export interface AiModeInfo {
  key: string;
  label: string;
  tagline: string;
  placeholder: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiWorkspace({ modes }: { modes: AiModeInfo[] }) {
  const [activeKey, setActiveKey] = useState(modes[0]?.key ?? '');
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = modes.find(m => m.key === activeKey) ?? modes[0];
  const messages = threads[activeKey] ?? [];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || busy || !active) return;

    const next = [...messages, { role: 'user' as const, content }];
    setThreads(t => ({ ...t, [activeKey]: next }));
    setInput('');
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: active.key, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI request failed.');
      setThreads(t => ({
        ...t,
        [activeKey]: [...next, { role: 'assistant', content: data.text }],
      }));
      setTimeout(() => scrollRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setThreads(t => ({ ...t, [activeKey]: messages })); // roll back
      setInput(content);
    } finally {
      setBusy(false);
    }
  }

  if (!active) return null;

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap">
        {modes.map(m => (
          <button key={m.key}
            onClick={() => { setActiveKey(m.key); setError(null); }}
            className={`btn ${m.key === activeKey ? 'btn-primary' : 'btn-outline'} !py-2 !px-3.5 !text-[13px]`}>
            <Sparkles size={13} /> {m.label}
          </button>
        ))}
      </div>

      <div className="card flex flex-col" style={{ minHeight: 440 }}>
        <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="section-title">{active.label}</h2>
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>{active.tagline}</p>
          </div>
          {messages.length ? (
            <button className="btn btn-outline !py-1.5 !px-3 !text-xs"
              onClick={() => setThreads(t => ({ ...t, [activeKey]: [] }))}>
              <RotateCcw size={12} /> New chat
            </button>
          ) : null}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: 480 }}>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles size={28} className="mx-auto" style={{ color: 'var(--brand)' }} />
              <p className="text-sm font-medium mt-3">{active.tagline}</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
                Try: “{active.placeholder}”
              </p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i}
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user' ? 'ml-auto rounded-br-md' : 'mr-auto rounded-bl-md'}`}
              style={m.role === 'user'
                ? { background: 'var(--brand)', color: '#fff' }
                : { background: 'var(--surface-2)' }}>
              {m.content}
            </div>
          ))}
          {busy ? (
            <div className="mr-auto rounded-2xl rounded-bl-md p-3.5" style={{ background: 'var(--surface-2)' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--brand)' }} />
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mx-5 mb-2 text-[13px] rounded-xl p-2.5" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}

        <form onSubmit={send} className="p-4 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          <input
            className="input"
            placeholder={active.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={busy}
            aria-label={`Message ${active.label}`}
          />
          <button type="submit" className="btn btn-primary shrink-0 !px-4" disabled={busy || !input.trim()}
            aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </div>

      <p className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>
        AI-generated content — review before using with students. Powered by Claude.
      </p>
    </div>
  );
}
