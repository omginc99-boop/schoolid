import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, Avatar } from '@/components/ui/primitives';
import { formatTime } from '@/lib/format';
import { Bus, MapPin, Users } from 'lucide-react';

export default async function TransportDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;

  const [routesQ, stopsQ, assignmentsQ] = await Promise.all([
    supabase.from('transport_routes')
      .select('id, name, vehicle_reg, profiles!transport_routes_driver_profile_id_fkey(people(full_name))')
      .eq('school_id', sid).order('name'),
    supabase.from('route_stops')
      .select('id, route_id, name, pickup_time, dropoff_time, sort_order')
      .eq('school_id', sid).order('sort_order'),
    supabase.from('transport_assignments')
      .select('route_id, stop_id, profiles!transport_assignments_student_profile_id_fkey(schoolid_number, people(full_name))')
      .eq('school_id', sid),
  ]);

  const routes = routesQ.data ?? [];
  const stops = stopsQ.data ?? [];
  const assignments = assignmentsQ.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transport</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Routes, stops and pickup manifests for {ctx.school?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Routes" value={routes.length} icon={Bus} />
        <StatCard label="Stops" value={stops.length} icon={MapPin} />
        <StatCard label="Students on transport" value={assignments.length} icon={Users} />
      </div>

      {routes.length ? routes.map(route => {
        const routeStops = stops.filter(s => s.route_id === route.id);
        const riders = assignments.filter(a => a.route_id === route.id);
        const driver = (route.profiles as { people?: { full_name?: string } } | null)?.people?.full_name;
        return (
          <PanelCard key={route.id} title={route.name}
            action={
              <span className="badge badge-brand"><Bus size={12} /> {route.vehicle_reg ?? 'no vehicle'}</span>
            }>
            <p className="text-[13px] mb-4" style={{ color: 'var(--muted)' }}>
              Driver: <span className="font-semibold" style={{ color: 'var(--text)' }}>{driver ?? 'Unassigned'}</span>
              {' · '}{riders.length} students
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--muted)' }}>Stops</p>
                <ol className="space-y-0">
                  {routeStops.map((s, i) => (
                    <li key={s.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                          style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{i + 1}</span>
                        {i < routeStops.length - 1 ? (
                          <span className="w-px flex-1 my-1" style={{ background: 'var(--border)' }} />
                        ) : null}
                      </div>
                      <div className="pb-4 min-w-0">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          Pickup {s.pickup_time ? formatTime(s.pickup_time) : '—'} · Dropoff {s.dropoff_time ? formatTime(s.dropoff_time) : '—'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--muted)' }}>Pickup manifest</p>
                {riders.length ? (
                  <ul className="space-y-2">
                    {riders.map((r, i) => {
                      const name = (r.profiles as { people?: { full_name?: string } } | null)?.people?.full_name ?? 'Student';
                      const stop = routeStops.find(s => s.id === r.stop_id);
                      return (
                        <li key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                          <Avatar name={name} size={28} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {(r.profiles as { schoolid_number?: string } | null)?.schoolid_number}
                            </p>
                          </div>
                          <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{stop?.name ?? '—'}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState icon={Users} message="No students assigned" />
                )}
              </div>
            </div>
          </PanelCard>
        );
      }) : (
        <div className="card">
          <EmptyState icon={Bus} message="No routes yet" hint="Create routes and stops to manage school transport." />
        </div>
      )}
    </div>
  );
}
