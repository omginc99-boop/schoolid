-- ============================================================================
-- SchoolID — Multi-tenant schema with Row-Level Security
-- Run this whole file in the Supabase SQL Editor, then run seed.sql.
-- Source of truth for the database. See docs/DATABASE.md for the reasoning.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum (
  'student','parent','teacher','principal','school_admin','finance',
  'librarian','transport','security','counselor','registrar','super_admin'
);

create type school_type as enum (
  'nursery','primary','secondary','college','university','nursing_school',
  'law_school','technical_college','vocational','corporate_academy'
);

create type verification_status as enum ('unverified','school_verified','document_verified');
create type profile_status      as enum ('active','inactive','suspended','graduated','alumni');
create type attendance_status   as enum ('present','absent','late','excused');
create type assignment_kind     as enum ('homework','assignment','project','quiz');
create type invoice_status      as enum ('draft','sent','partial','paid','overdue','void');
create type payment_method      as enum ('card','bank_transfer','cash','paystack','pos','other');
create type loan_status         as enum ('out','returned','overdue','lost');
create type admission_status    as enum ('pending','review','interview','admitted','rejected','withdrawn');
create type incident_status     as enum ('open','resolved','escalated');
create type risk_level          as enum ('low','medium','high','critical');
create type plan_tier           as enum ('starter','growth','enterprise');
create type subscription_status as enum ('trial','active','past_due','cancelled');
create type event_kind          as enum ('event','holiday','exam','meeting','trip');
create type entry_direction     as enum ('in','out');

-- ---------------------------------------------------------------------------
-- Tenancy & identity
-- ---------------------------------------------------------------------------
create table schools (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  motto           text,
  school_type     school_type not null default 'secondary',
  logo_url        text,
  primary_color   text not null default '#4f46e5',
  secondary_color text not null default '#d97706',
  custom_domain   text unique,
  country         text not null default 'Nigeria',
  city            text,
  address         text,
  phone           text,
  email           text,
  currency        text not null default 'NGN',  -- ISO 4217; any African or international code (see lib/currencies.ts)
  enabled_modules text[] not null default array[
    'admissions','attendance','academics','exams','assignments','timetable',
    'fees','library','transport','communication','calendar','discipline',
    'certificates','identity','alumni','analytics','ai','security'
  ],
  plan            plan_tier not null default 'starter',
  billing_status  subscription_status not null default 'trial',
  id_counter      int not null default 0,
  created_at      timestamptz not null default now()
);

-- Lifelong identity root. A person exists independently of any school and is
-- the hook for the future Citizen ID migration (consent-controlled).
create table people (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  date_of_birth      date,
  gender             text,
  photo_url          text,
  nationality        text,
  citizen_id_consent boolean not null default false,
  citizen_id_ref     text,
  created_at         timestamptz not null default now()
);

-- A person's membership in a school with a role. user_id is nullable so a
-- school can enroll people before they ever log in; the handle_new_user
-- trigger claims the profile by email on first signup.
create table profiles (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid not null references people(id) on delete cascade,
  school_id           uuid references schools(id) on delete cascade, -- null only for super_admin
  user_id             uuid references auth.users(id) on delete set null,
  role                user_role not null,
  email               text,
  phone               text,
  schoolid_number     text unique,
  qr_token            text unique,
  verification_status verification_status not null default 'unverified',
  idvero_ref          text,   -- IDVero verification id (ver_xxx) for document checks
  status              profile_status not null default 'active',
  title               text,          -- e.g. 'Mathematics Teacher', 'JSS 2 Student'
  joined_on           date default current_date,
  created_at          timestamptz not null default now(),
  constraint super_admin_no_school check (role <> 'super_admin' or school_id is null),
  constraint tenant_roles_have_school check (role = 'super_admin' or school_id is not null)
);
create index on profiles (school_id, role);
create index on profiles (user_id);
create index on profiles (person_id);

create table guardians (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  parent_profile_id  uuid not null references profiles(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  relationship       text not null default 'parent',
  unique (parent_profile_id, student_profile_id)
);
create index on guardians (school_id);

-- ---------------------------------------------------------------------------
-- Academic structure
-- ---------------------------------------------------------------------------
create table academic_years (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references schools(id) on delete cascade,
  name       text not null,             -- '2026/2027'
  starts_on  date not null,
  ends_on    date not null,
  is_current boolean not null default false
);
create index on academic_years (school_id);

create table terms (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id) on delete cascade,
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  name             text not null,       -- 'First Term'
  starts_on        date not null,
  ends_on          date not null,
  is_current       boolean not null default false
);
create index on terms (school_id);

create table departments (
  id        uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name      text not null
);
create index on departments (school_id);

create table subjects (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references schools(id) on delete cascade,
  department_id uuid references departments(id) on delete set null,
  name          text not null,
  code          text
);
create index on subjects (school_id);

create table classes (
  id                  uuid primary key default gen_random_uuid(),
  school_id           uuid not null references schools(id) on delete cascade,
  academic_year_id    uuid not null references academic_years(id) on delete cascade,
  name                text not null,    -- 'JSS 1A'
  level               text,             -- 'JSS 1'
  homeroom_teacher_id uuid references profiles(id) on delete set null,
  capacity            int not null default 40
);
create index on classes (school_id);

create table class_subjects (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  class_id           uuid not null references classes(id) on delete cascade,
  subject_id         uuid not null references subjects(id) on delete cascade,
  teacher_profile_id uuid references profiles(id) on delete set null,
  unique (class_id, subject_id)
);
create index on class_subjects (school_id);

create table enrollments (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  class_id           uuid not null references classes(id) on delete cascade,
  academic_year_id   uuid not null references academic_years(id) on delete cascade,
  status             text not null default 'active',
  enrolled_on        date not null default current_date,
  unique (student_profile_id, academic_year_id)
);
create index on enrollments (school_id, class_id);

create table attendance (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  class_id           uuid not null references classes(id) on delete cascade,
  date               date not null default current_date,
  status             attendance_status not null default 'present',
  note               text,
  recorded_by        uuid references profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  unique (student_profile_id, class_id, date)
);
create index on attendance (school_id, date);
create index on attendance (student_profile_id, date);

create table assignments (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  class_id           uuid not null references classes(id) on delete cascade,
  subject_id         uuid not null references subjects(id) on delete cascade,
  teacher_profile_id uuid references profiles(id) on delete set null,
  kind               assignment_kind not null default 'homework',
  title              text not null,
  instructions       text,
  max_score          numeric not null default 100,
  assigned_at        timestamptz not null default now(),
  due_at             timestamptz not null
);
create index on assignments (school_id, class_id, due_at);

create table submissions (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  assignment_id      uuid not null references assignments(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  submitted_at       timestamptz not null default now(),
  content            text,
  file_url           text,
  score              numeric,
  feedback           text,
  graded_by          uuid references profiles(id) on delete set null,
  graded_at          timestamptz,
  unique (assignment_id, student_profile_id)
);
create index on submissions (school_id, assignment_id);

create table exams (
  id        uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  term_id   uuid not null references terms(id) on delete cascade,
  name      text not null,               -- 'Mid-Term Examination'
  starts_on date not null,
  ends_on   date not null
);
create index on exams (school_id);

create table exam_results (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  exam_id            uuid references exams(id) on delete cascade,
  term_id            uuid not null references terms(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  subject_id         uuid not null references subjects(id) on delete cascade,
  score              numeric not null,
  max_score          numeric not null default 100,
  grade_letter       text,
  remark             text,
  recorded_by        uuid references profiles(id) on delete set null,
  created_at         timestamptz not null default now()
);
create index on exam_results (school_id, student_profile_id, term_id);

create table timetable_slots (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  class_id           uuid not null references classes(id) on delete cascade,
  subject_id         uuid not null references subjects(id) on delete cascade,
  teacher_profile_id uuid references profiles(id) on delete set null,
  day_of_week        int not null check (day_of_week between 1 and 7), -- 1 = Monday
  starts_at          time not null,
  ends_at            time not null,
  room               text
);
create index on timetable_slots (school_id, class_id, day_of_week);

-- ---------------------------------------------------------------------------
-- Finance
-- ---------------------------------------------------------------------------
create table fee_structures (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id) on delete cascade,
  academic_year_id uuid references academic_years(id) on delete cascade,
  term_id          uuid references terms(id) on delete cascade,
  level            text,                 -- null = whole school
  name             text not null,        -- 'Tuition', 'Transport', 'Books'
  amount           numeric not null,
  currency         text not null default 'NGN'
);
create index on fee_structures (school_id);

create table invoices (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  term_id            uuid references terms(id) on delete set null,
  number             text not null,
  status             invoice_status not null default 'sent',
  issued_on          date not null default current_date,
  due_on             date not null,
  total              numeric not null default 0,
  currency           text not null default 'NGN',
  unique (school_id, number)
);
create index on invoices (school_id, status);
create index on invoices (student_profile_id);

create table invoice_items (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id) on delete cascade,
  invoice_id       uuid not null references invoices(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  description      text not null,
  amount           numeric not null
);
create index on invoice_items (invoice_id);

-- Append-only: corrections are new rows (negative amount = refund).
create table payments (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  invoice_id  uuid not null references invoices(id) on delete cascade,
  amount      numeric not null,
  method      payment_method not null default 'paystack',
  reference   text,
  paid_at     timestamptz not null default now(),
  recorded_by uuid references profiles(id) on delete set null
);
create index on payments (school_id, paid_at);
create index on payments (invoice_id);

create table scholarships (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  name               text not null,
  percent            numeric check (percent between 0 and 100),
  amount             numeric,
  academic_year_id   uuid references academic_years(id) on delete cascade,
  notes              text
);
create index on scholarships (school_id);

-- ---------------------------------------------------------------------------
-- Library
-- ---------------------------------------------------------------------------
create table books (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id) on delete cascade,
  title            text not null,
  author           text,
  isbn             text,
  category         text,
  shelf            text,
  copies_total     int not null default 1,
  copies_available int not null default 1
);
create index on books (school_id);

create table book_loans (
  id                  uuid primary key default gen_random_uuid(),
  school_id           uuid not null references schools(id) on delete cascade,
  book_id             uuid not null references books(id) on delete cascade,
  borrower_profile_id uuid not null references profiles(id) on delete cascade,
  borrowed_at         date not null default current_date,
  due_on              date not null,
  returned_at         date,
  fine_amount         numeric not null default 0,
  status              loan_status not null default 'out'
);
create index on book_loans (school_id, status);

-- ---------------------------------------------------------------------------
-- Transport
-- ---------------------------------------------------------------------------
create table transport_routes (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references schools(id) on delete cascade,
  name              text not null,       -- 'Route A — Lekki'
  vehicle_reg       text,
  driver_profile_id uuid references profiles(id) on delete set null,
  notes             text
);
create index on transport_routes (school_id);

create table route_stops (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references schools(id) on delete cascade,
  route_id     uuid not null references transport_routes(id) on delete cascade,
  name         text not null,
  pickup_time  time,
  dropoff_time time,
  sort_order   int not null default 0
);
create index on route_stops (route_id);

create table transport_assignments (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  route_id           uuid not null references transport_routes(id) on delete cascade,
  stop_id            uuid references route_stops(id) on delete set null,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  unique (route_id, student_profile_id)
);
create index on transport_assignments (school_id);

-- ---------------------------------------------------------------------------
-- Security, discipline, wellbeing
-- ---------------------------------------------------------------------------
create table visitors (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references schools(id) on delete cascade,
  full_name       text not null,
  phone           text,
  purpose         text,
  host_profile_id uuid references profiles(id) on delete set null,
  badge_number    text,
  checked_in_at   timestamptz not null default now(),
  checked_out_at  timestamptz,
  recorded_by     uuid references profiles(id) on delete set null
);
create index on visitors (school_id, checked_in_at);

-- QR gate scans of SchoolID cards.
create table entry_logs (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references schools(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  direction  entry_direction not null default 'in',
  gate       text,
  scanned_by uuid references profiles(id) on delete set null,
  scanned_at timestamptz not null default now()
);
create index on entry_logs (school_id, scanned_at);

create table incidents (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  category           text not null,       -- 'lateness', 'conduct', ...
  description        text,
  action_taken       text,
  status             incident_status not null default 'open',
  occurred_on        date not null default current_date,
  reported_by        uuid references profiles(id) on delete set null,
  created_at         timestamptz not null default now()
);
create index on incidents (school_id, status);

-- FERPA-aligned: strictest access of any table (counselor + principal only).
create table wellbeing_cases (
  id                   uuid primary key default gen_random_uuid(),
  school_id            uuid not null references schools(id) on delete cascade,
  student_profile_id   uuid not null references profiles(id) on delete cascade,
  counselor_profile_id uuid references profiles(id) on delete set null,
  risk                 risk_level not null default 'low',
  summary              text not null,
  notes                text,
  status               incident_status not null default 'open',
  opened_on            date not null default current_date
);
create index on wellbeing_cases (school_id, status);

-- ---------------------------------------------------------------------------
-- Communication & calendar
-- ---------------------------------------------------------------------------
create table announcements (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references schools(id) on delete cascade,
  title             text not null,
  body              text not null,
  audience_roles    user_role[] not null default array['student','parent','teacher']::user_role[],
  class_id          uuid references classes(id) on delete cascade,
  is_emergency      boolean not null default false,
  author_profile_id uuid references profiles(id) on delete set null,
  published_at      timestamptz not null default now()
);
create index on announcements (school_id, published_at);

create table messages (
  id                   uuid primary key default gen_random_uuid(),
  school_id            uuid not null references schools(id) on delete cascade,
  sender_profile_id    uuid not null references profiles(id) on delete cascade,
  recipient_profile_id uuid not null references profiles(id) on delete cascade,
  body                 text not null,
  read_at              timestamptz,
  created_at           timestamptz not null default now()
);
create index on messages (school_id, recipient_profile_id, created_at);

create table events (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references schools(id) on delete cascade,
  title          text not null,
  kind           event_kind not null default 'event',
  location       text,
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  audience_roles user_role[] not null default array['student','parent','teacher']::user_role[]
);
create index on events (school_id, starts_at);

-- ---------------------------------------------------------------------------
-- Registrar: admissions, certificates, alumni
-- ---------------------------------------------------------------------------
create table admissions_applications (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id) on delete cascade,
  applicant_name   text not null,
  date_of_birth    date,
  guardian_name    text,
  guardian_phone   text,
  guardian_email   text,
  desired_level    text,
  status           admission_status not null default 'pending',
  notes            text,
  submitted_at     timestamptz not null default now()
);
create index on admissions_applications (school_id, status);

create table certificates (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  title              text not null,
  kind               text not null default 'completion',  -- graduation/completion/award
  serial             text not null unique,                -- publicly verifiable
  issued_on          date not null default current_date,
  file_url           text,
  issued_by          uuid references profiles(id) on delete set null
);
create index on certificates (school_id);

create table alumni (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references schools(id) on delete cascade,
  person_id    uuid not null references people(id) on delete cascade,
  graduated_on date not null,
  class_name   text,
  notes        text,
  unique (school_id, person_id)
);
create index on alumni (school_id);

-- ---------------------------------------------------------------------------
-- Platform: subscriptions & audit
-- ---------------------------------------------------------------------------
create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references schools(id) on delete cascade unique,
  plan               plan_tier not null default 'starter',
  status             subscription_status not null default 'trial',
  price_per_student  numeric not null default 0,
  currency           text not null default 'USD',
  current_period_end date,
  created_at         timestamptz not null default now()
);

create table audit_logs (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid references schools(id) on delete cascade,  -- null = platform event
  actor_profile_id uuid references profiles(id) on delete set null,
  action           text not null,       -- 'invoice.paid', 'profile.created', ...
  entity           text,
  entity_id        text,
  detail           jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index on audit_logs (school_id, created_at);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer: safe from RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.my_profile_ids()
returns setof uuid language sql stable security definer set search_path = public as
$$ select id from profiles where user_id = auth.uid() and status = 'active' $$;

create or replace function public.my_school_ids()
returns setof uuid language sql stable security definer set search_path = public as
$$ select school_id from profiles where user_id = auth.uid() and school_id is not null and status = 'active' $$;

create or replace function public.has_role(sid uuid, roles user_role[])
returns boolean language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from profiles
     where user_id = auth.uid() and school_id = sid
       and role = any(roles) and status = 'active') $$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from profiles
     where user_id = auth.uid() and role = 'super_admin' and status = 'active') $$;

create or replace function public.is_staff(sid uuid)
returns boolean language sql stable security definer set search_path = public as
$$ select public.has_role(sid, array['teacher','principal','school_admin','finance',
     'librarian','transport','security','counselor','registrar']::user_role[]) $$;

create or replace function public.my_child_profile_ids()
returns setof uuid language sql stable security definer set search_path = public as
$$ select g.student_profile_id
   from guardians g
   join profiles p on p.id = g.parent_profile_id
   where p.user_id = auth.uid() and p.status = 'active' $$;

grant execute on function
  public.my_profile_ids(), public.my_school_ids(), public.is_super_admin(),
  public.my_child_profile_ids() to authenticated;
grant execute on function public.has_role(uuid, user_role[]), public.is_staff(uuid) to authenticated;

-- Audit writer: insert-only path for privileged actions.
create or replace function public.log_audit(
  sid uuid, p_action text, p_entity text, p_entity_id text, p_detail jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs (school_id, actor_profile_id, action, entity, entity_id, detail)
  values (
    sid,
    (select id from profiles where user_id = auth.uid()
      and (school_id = sid or role = 'super_admin') limit 1),
    p_action, p_entity, p_entity_id, p_detail);
end $$;
grant execute on function public.log_audit(uuid, text, text, text, jsonb) to authenticated;

-- Public QR verification: reveals only what a gate officer needs to see.
create or replace function public.verify_identity(token text)
returns table (
  full_name text, role user_role, school_name text, school_logo text,
  school_primary_color text, photo_url text,
  verification_status verification_status, schoolid_number text, status profile_status)
language sql stable security definer set search_path = public as $$
  select pe.full_name, pr.role, s.name, s.logo_url, s.primary_color,
         pe.photo_url, pr.verification_status, pr.schoolid_number, pr.status
  from profiles pr
  join people  pe on pe.id = pr.person_id
  join schools s  on s.id  = pr.school_id
  where pr.qr_token = token
$$;
grant execute on function public.verify_identity(text) to anon, authenticated;

-- Self-serve tenant provisioning: any signed-in user can found a school and
-- becomes its school_admin. No service key required in the app.
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
  select email into uemail from auth.users where id = uid;

  if p_currency !~ '^[A-Za-z]{3}$' then
    raise exception 'Currency must be a 3-letter ISO code (e.g. NGN, ZAR, KES)';
  end if;

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

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- Issue SchoolID number + QR token on profile creation.
create or replace function public.assign_schoolid_identity()
returns trigger language plpgsql security definer set search_path = public as $$
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

create trigger profiles_assign_identity
  before insert on profiles
  for each row execute function public.assign_schoolid_identity();

-- Claim pre-created profiles by email when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update profiles set user_id = new.id
  where user_id is null and email is not null and lower(email) = lower(new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep invoice status in sync as payments arrive (append-only payments).
create or replace function public.apply_payment()
returns trigger language plpgsql security definer set search_path = public as $$
declare paid numeric; inv_total numeric;
begin
  select coalesce(sum(amount), 0) into paid from payments where invoice_id = new.invoice_id;
  select total into inv_total from invoices where id = new.invoice_id;
  update invoices set status = case
      when paid >= inv_total then 'paid'::invoice_status
      when paid > 0 then 'partial'::invoice_status
      else status end
  where id = new.invoice_id;
  return new;
end $$;

create trigger payments_apply
  after insert on payments
  for each row execute function public.apply_payment();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
    -- Platform staff see and manage everything, on every table.
    execute format(
      'create policy super_admin_all on public.%I for all
       using (public.is_super_admin()) with check (public.is_super_admin())', t);
  end loop;
end $$;

-- schools: members read; school admin/principal update branding & settings.
create policy schools_member_read on schools for select
  using (id in (select my_school_ids()));
create policy schools_admin_update on schools for update
  using (has_role(id, array['school_admin','principal']::user_role[]))
  with check (has_role(id, array['school_admin','principal']::user_role[]));

-- people: yourself, or staff/admin of any school where the person holds a profile.
create policy people_self_read on people for select
  using (exists (select 1 from profiles pr where pr.person_id = people.id
                 and pr.user_id = auth.uid()));
create policy people_staff_read on people for select
  using (exists (select 1 from profiles pr where pr.person_id = people.id
                 and is_staff(pr.school_id)));
create policy people_parent_read on people for select
  using (exists (select 1 from profiles pr where pr.person_id = people.id
                 and pr.id in (select my_child_profile_ids())));
create policy people_self_update on people for update
  using (exists (select 1 from profiles pr where pr.person_id = people.id
                 and pr.user_id = auth.uid()))
  with check (true);
create policy people_admin_write on people for all
  using (exists (select 1 from profiles pr where pr.person_id = people.id
                 and has_role(pr.school_id, array['school_admin','principal','registrar']::user_role[])))
  with check (true);

-- profiles: visible to fellow members of the school; managed by admin roles;
-- users may update their own row (contact details, photo).
create policy profiles_member_read on profiles for select
  using (school_id in (select my_school_ids()) or user_id = auth.uid());
create policy profiles_self_update on profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_admin_write on profiles for all
  using (has_role(school_id, array['school_admin','principal','registrar']::user_role[]))
  with check (has_role(school_id, array['school_admin','principal','registrar']::user_role[]));

-- guardians
create policy guardians_read on guardians for select
  using (is_staff(school_id)
         or parent_profile_id in (select my_profile_ids())
         or student_profile_id in (select my_profile_ids()));
create policy guardians_admin_write on guardians for all
  using (has_role(school_id, array['school_admin','principal','registrar']::user_role[]))
  with check (has_role(school_id, array['school_admin','principal','registrar']::user_role[]));

-- Reference/academic-structure tables: all school members read, admins write.
do $$
declare t text;
begin
  foreach t in array array['academic_years','terms','departments','subjects',
                           'classes','class_subjects','timetable_slots','events',
                           'fee_structures','books','transport_routes','route_stops','exams']
  loop
    execute format(
      'create policy %I_member_read on public.%I for select
       using (school_id in (select my_school_ids()))', t, t);
    execute format(
      'create policy %I_admin_write on public.%I for all
       using (has_role(school_id, array[''school_admin'',''principal'']::user_role[]))
       with check (has_role(school_id, array[''school_admin'',''principal'']::user_role[]))', t, t);
  end loop;
end $$;

-- Extra writers for specific reference tables.
create policy timetable_teacher_write on timetable_slots for all
  using (has_role(school_id, array['teacher','registrar']::user_role[]))
  with check (has_role(school_id, array['teacher','registrar']::user_role[]));
create policy fees_finance_write on fee_structures for all
  using (has_role(school_id, array['finance']::user_role[]))
  with check (has_role(school_id, array['finance']::user_role[]));
create policy books_librarian_write on books for all
  using (has_role(school_id, array['librarian']::user_role[]))
  with check (has_role(school_id, array['librarian']::user_role[]));
create policy routes_transport_write on transport_routes for all
  using (has_role(school_id, array['transport']::user_role[]))
  with check (has_role(school_id, array['transport']::user_role[]));
create policy stops_transport_write on route_stops for all
  using (has_role(school_id, array['transport']::user_role[]))
  with check (has_role(school_id, array['transport']::user_role[]));
create policy exams_teacher_write on exams for all
  using (has_role(school_id, array['teacher','registrar']::user_role[]))
  with check (has_role(school_id, array['teacher','registrar']::user_role[]));

-- Student-owned academic rows: staff read/write; student reads own; parent reads child's.
do $$
declare t text;
begin
  foreach t in array array['enrollments','attendance','exam_results','incidents','transport_assignments']
  loop
    execute format(
      'create policy %I_scoped_read on public.%I for select
       using (is_staff(school_id)
              or student_profile_id in (select my_profile_ids())
              or student_profile_id in (select my_child_profile_ids()))', t, t);
  end loop;
end $$;

create policy enrollments_admin_write on enrollments for all
  using (has_role(school_id, array['school_admin','principal','registrar']::user_role[]))
  with check (has_role(school_id, array['school_admin','principal','registrar']::user_role[]));
create policy attendance_teacher_write on attendance for all
  using (has_role(school_id, array['teacher','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['teacher','school_admin','principal']::user_role[]));
create policy exam_results_teacher_write on exam_results for all
  using (has_role(school_id, array['teacher','school_admin','principal','registrar']::user_role[]))
  with check (has_role(school_id, array['teacher','school_admin','principal','registrar']::user_role[]));
create policy incidents_staff_write on incidents for all
  using (has_role(school_id, array['teacher','school_admin','principal','security']::user_role[]))
  with check (has_role(school_id, array['teacher','school_admin','principal','security']::user_role[]));
create policy transport_assignments_write on transport_assignments for all
  using (has_role(school_id, array['transport','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['transport','school_admin','principal']::user_role[]));

-- assignments: whole school reads; the class's teachers write.
create policy assignments_member_read on assignments for select
  using (school_id in (select my_school_ids()));
create policy assignments_teacher_write on assignments for all
  using (has_role(school_id, array['teacher','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['teacher','school_admin','principal']::user_role[]));

-- submissions: student submits own work; teacher grades; parent views child's.
create policy submissions_scoped_read on submissions for select
  using (is_staff(school_id)
         or student_profile_id in (select my_profile_ids())
         or student_profile_id in (select my_child_profile_ids()));
create policy submissions_student_insert on submissions for insert
  with check (student_profile_id in (select my_profile_ids()));
create policy submissions_student_update on submissions for update
  using (student_profile_id in (select my_profile_ids()) and graded_at is null)
  with check (student_profile_id in (select my_profile_ids()));
create policy submissions_teacher_write on submissions for update
  using (has_role(school_id, array['teacher','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['teacher','school_admin','principal']::user_role[]));

-- Finance: money visible to its owner, their parent, and finance/admin roles only.
do $$
declare t text;
begin
  foreach t in array array['invoices','scholarships']
  loop
    execute format(
      'create policy %I_scoped_read on public.%I for select
       using (has_role(school_id, array[''finance'',''school_admin'',''principal'']::user_role[])
              or student_profile_id in (select my_profile_ids())
              or student_profile_id in (select my_child_profile_ids()))', t, t);
    execute format(
      'create policy %I_finance_write on public.%I for all
       using (has_role(school_id, array[''finance'',''school_admin'']::user_role[]))
       with check (has_role(school_id, array[''finance'',''school_admin'']::user_role[]))', t, t);
  end loop;
end $$;

create policy invoice_items_scoped_read on invoice_items for select
  using (has_role(school_id, array['finance','school_admin','principal']::user_role[])
         or exists (select 1 from invoices i where i.id = invoice_items.invoice_id
                    and (i.student_profile_id in (select my_profile_ids())
                         or i.student_profile_id in (select my_child_profile_ids()))));
create policy invoice_items_finance_write on invoice_items for all
  using (has_role(school_id, array['finance','school_admin']::user_role[]))
  with check (has_role(school_id, array['finance','school_admin']::user_role[]));

create policy payments_scoped_read on payments for select
  using (has_role(school_id, array['finance','school_admin','principal']::user_role[])
         or exists (select 1 from invoices i where i.id = payments.invoice_id
                    and (i.student_profile_id in (select my_profile_ids())
                         or i.student_profile_id in (select my_child_profile_ids()))));
create policy payments_finance_insert on payments for insert
  with check (has_role(school_id, array['finance','school_admin']::user_role[]));
-- Note: no UPDATE/DELETE policy on payments — the ledger is append-only.

-- Library loans
create policy book_loans_scoped_read on book_loans for select
  using (has_role(school_id, array['librarian','school_admin','principal']::user_role[])
         or borrower_profile_id in (select my_profile_ids())
         or borrower_profile_id in (select my_child_profile_ids()));
create policy book_loans_librarian_write on book_loans for all
  using (has_role(school_id, array['librarian','school_admin']::user_role[]))
  with check (has_role(school_id, array['librarian','school_admin']::user_role[]));

-- Security desk
create policy visitors_staff_read on visitors for select using (is_staff(school_id));
create policy visitors_security_write on visitors for all
  using (has_role(school_id, array['security','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['security','school_admin','principal']::user_role[]));

create policy entry_logs_scoped_read on entry_logs for select
  using (has_role(school_id, array['security','school_admin','principal']::user_role[])
         or profile_id in (select my_profile_ids())
         or profile_id in (select my_child_profile_ids()));
create policy entry_logs_security_insert on entry_logs for insert
  with check (has_role(school_id, array['security','school_admin']::user_role[]));

-- Wellbeing: counselor + principal ONLY. Not even school_admin.
create policy wellbeing_restricted_read on wellbeing_cases for select
  using (has_role(school_id, array['counselor','principal']::user_role[]));
create policy wellbeing_counselor_write on wellbeing_cases for all
  using (has_role(school_id, array['counselor']::user_role[]))
  with check (has_role(school_id, array['counselor']::user_role[]));

-- Announcements: members read what targets their role; staff publish.
create policy announcements_member_read on announcements for select
  using (school_id in (select my_school_ids()));
create policy announcements_staff_write on announcements for all
  using (is_staff(school_id)) with check (is_staff(school_id));

-- Messages: only sender and recipient, ever.
create policy messages_participant_read on messages for select
  using (sender_profile_id in (select my_profile_ids())
         or recipient_profile_id in (select my_profile_ids()));
create policy messages_send on messages for insert
  with check (sender_profile_id in (select my_profile_ids())
              and school_id in (select my_school_ids()));
create policy messages_mark_read on messages for update
  using (recipient_profile_id in (select my_profile_ids()))
  with check (recipient_profile_id in (select my_profile_ids()));

-- Registrar surfaces
create policy admissions_registrar_all on admissions_applications for all
  using (has_role(school_id, array['registrar','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['registrar','school_admin','principal']::user_role[]));

create policy certificates_scoped_read on certificates for select
  using (is_staff(school_id)
         or student_profile_id in (select my_profile_ids())
         or student_profile_id in (select my_child_profile_ids()));
create policy certificates_registrar_write on certificates for all
  using (has_role(school_id, array['registrar','school_admin','principal']::user_role[]))
  with check (has_role(school_id, array['registrar','school_admin','principal']::user_role[]));

create policy alumni_scoped_read on alumni for select
  using (is_staff(school_id)
         or exists (select 1 from profiles pr where pr.person_id = alumni.person_id
                    and pr.user_id = auth.uid()));
create policy alumni_registrar_write on alumni for all
  using (has_role(school_id, array['registrar','school_admin']::user_role[]))
  with check (has_role(school_id, array['registrar','school_admin']::user_role[]));

-- Platform billing: school leadership can read their own subscription.
create policy subscriptions_school_read on subscriptions for select
  using (has_role(school_id, array['school_admin','principal','finance']::user_role[]));
-- Writes: super admin only (blanket policy above).

-- Audit: school leadership reads own school; nobody updates or deletes.
create policy audit_school_read on audit_logs for select
  using (school_id is not null
         and has_role(school_id, array['school_admin','principal']::user_role[]));
-- Inserts happen exclusively through log_audit() (security definer).

-- ============================================================================
-- Done. Now run seed.sql for the Demo Academy dataset.
-- ============================================================================
