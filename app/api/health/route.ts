// Uptime probe: confirms the app is serving and (when configured) that the
// database answers.
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET() {
  const health: { ok: boolean; db: 'ok' | 'error' | 'unconfigured'; time: string } = {
    ok: true,
    db: 'unconfigured',
    time: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('schools').select('id', { count: 'exact', head: true });
      health.db = error ? 'error' : 'ok';
      if (error) health.ok = false;
    } catch {
      health.db = 'error';
      health.ok = false;
    }
  }

  return NextResponse.json(health, { status: health.ok ? 200 : 503 });
}
