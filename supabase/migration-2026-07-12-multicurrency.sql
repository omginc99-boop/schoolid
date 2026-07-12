-- Multi-currency upgrade. ONLY needed if you ran schema.sql before 2026-07-12;
-- fresh installs already include this in schema.sql.
-- Adds a currency parameter to self-serve school registration.

drop function if exists public.register_school(text, text, school_type, text, text, text);

create or replace function public.register_school(
  p_name text, p_slug text, p_type school_type,
  p_admin_name text, p_country text default 'Nigeria', p_city text default null,
  p_currency text default 'NGN')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  sid uuid; pid uuid;
  uid uuid := auth.uid();
  uemail text;
begin
  if uid is null then
    raise exception 'Must be signed in to register a school';
  end if;
  if exists (select 1 from schools where slug = p_slug) then
    raise exception 'That school URL name (slug) is already taken';
  end if;
  if p_currency !~ '^[A-Za-z]{3}$' then
    raise exception 'Currency must be a 3-letter ISO code (e.g. NGN, ZAR, KES)';
  end if;
  select email into uemail from auth.users where id = uid;

  insert into schools (name, slug, school_type, country, city, currency)
  values (p_name, p_slug, p_type, p_country, p_city, upper(p_currency)) returning id into sid;

  insert into people (full_name) values (p_admin_name) returning id into pid;

  insert into profiles (person_id, school_id, user_id, role, email, verification_status, title)
  values (pid, sid, uid, 'school_admin', uemail, 'school_verified', 'School Administrator');

  insert into subscriptions (school_id, plan, status) values (sid, 'starter', 'trial');
  perform public.log_audit(sid, 'school.registered', 'school', sid::text,
                           jsonb_build_object('name', p_name, 'slug', p_slug, 'currency', upper(p_currency)));
  return sid;
end $$;

grant execute on function public.register_school(text, text, school_type, text, text, text, text) to authenticated;
