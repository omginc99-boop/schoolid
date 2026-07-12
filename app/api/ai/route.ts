// All AI features run through this one route. The mode picks the system
// prompt; the caller's profile role gates access. The Claude API key stays
// server-side only.
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { AI_MODES } from '@/lib/ai';
import type { UserRole } from '@/lib/types';

export const maxDuration = 60;

const MODEL = 'claude-opus-4-8';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI is not configured yet. Add ANTHROPIC_API_KEY to the environment.' },
      { status: 503 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to use AI features.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id, people(full_name), schools(name, school_type)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: 'No active profile found.' }, { status: 403 });
  }

  let body: { mode?: string; messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const mode = AI_MODES[body.mode ?? ''];
  if (!mode) {
    return NextResponse.json({ error: 'Unknown AI mode.' }, { status: 400 });
  }
  if (!mode.roles.includes(profile.role as UserRole)) {
    return NextResponse.json({ error: 'This AI feature is not available for your role.' }, { status: 403 });
  }

  const messages = (body.messages ?? [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Send at least one user message.' }, { status: 400 });
  }

  const person = profile.people as { full_name?: string } | null;
  const school = profile.schools as { name?: string; school_type?: string } | null;
  const context = `\n\nContext: you are speaking with ${person?.full_name ?? 'a user'} (${profile.role})${
    school?.name ? ` at ${school.name} (${school.school_type?.replace(/_/g, ' ')})` : ''
  }.`;

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: mode.system + context,
      messages,
    });
    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
    return NextResponse.json({ text });
  } catch (err) {
    console.error('AI route error:', err);
    return NextResponse.json(
      { error: 'The AI service is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }
}
