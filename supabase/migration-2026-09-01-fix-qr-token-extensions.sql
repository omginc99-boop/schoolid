-- Fixes "function gen_random_bytes(integer) does not exist" on school
-- self-registration. Supabase installs pgcrypto into the `extensions`
-- schema, not `public`; this trigger restricted itself to `public` only.
-- Safe to run any time — replaces the function definition in place.
create or replace function public.assign_schoolid_identity()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare n int; sl text;
begin
  if new.school_id is not null and (new.schoolid_number is null or new.schoolid_number = '') then
    update schools set id_counter = id_counter + 1
    where id = new.school_id
    returning id_counter, slug into n, sl;
    new.schoolid_number := 'SID-' ||
      upper(regexp_replace(substr(sl, 1, 3), '[^a-zA-Z0-9]', '', 'g')) ||
      '-' || lpad(n::text, 5, '0');
  end if;
  if new.qr_token is null then
    new.qr_token := encode(gen_random_bytes(16), 'hex');
  end if;
  return new;
end $$;
