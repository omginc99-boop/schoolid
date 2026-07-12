# SchoolID — Database Design

Phase 3 deliverable. The executable source of truth is [`supabase/schema.sql`](../supabase/schema.sql); this doc explains the shape and the reasoning. Demo data lives in [`supabase/seed.sql`](../supabase/seed.sql).

## 1. Principles

1. **Tenant key everywhere.** Every tenant-owned row carries `school_id`. Row-Level Security (RLS) enforces isolation in the database itself — application bugs cannot leak another school's data.
2. **Identity outlives enrollment.** `people` is the lifelong root; `profiles` binds a person to a (school, role). A person who changes schools or graduates keeps the same `person` row forever — this is the Citizen ID migration hook.
3. **Auth is attachable.** `profiles.user_id` (→ `auth.users`) is nullable: a school can register its 800 students before any of them has logged in. When a user signs up with a matching email, a trigger claims the profile automatically.
4. **Money is append-only.** Invoices change status; payments are never updated or deleted, only recorded and (if needed) reversed by a new row.
5. **Audit is insert-only.** `audit_logs` has no UPDATE/DELETE policy for anyone.

## 2. Entity map

```
people ─┬─< profiles >─── schools ───< subscriptions (platform billing)
        │      │
        │      ├─< guardians >─ profiles (parent↔student, same school)
        │      ├─< enrollments >─ classes ─── academic_years ──< terms
        │      ├─< attendance
        │      ├─< submissions >─ assignments ─ subjects / classes
        │      ├─< exam_results ─ exams / subjects / terms
        │      ├─< invoices ─< invoice_items      ┐
        │      │        └──< payments             ├─ finance
        │      ├─< scholarships                   ┘
        │      ├─< book_loans >─ books            ← library
        │      ├─< transport_assignments >─ route_stops >─ transport_routes
        │      ├─< entry_logs / visitors          ← security
        │      ├─< incidents                      ← discipline
        │      ├─< wellbeing_cases                ← counselor (restricted)
        │      ├─< certificates                   ← registrar
        │      └─< messages / announcements / events
        └─< alumni
admissions_applications ─ schools (pre-identity: applicants aren't people yet)
audit_logs ─ schools (nullable: platform-level events)
timetable_slots ─ classes / subjects / teacher profiles
fee_structures ─ academic_years / terms
```

## 3. Key tables

### Identity & tenancy

| Table | Purpose | Notable columns |
|---|---|---|
| `schools` | Tenant root | `slug`, branding (`logo_url`, `primary_color`, `secondary_color`, `custom_domain`), `school_type`, `enabled_modules text[]`, `plan`, `billing_status` |
| `people` | Lifelong identity | `citizen_id_consent`, `citizen_id_ref` (reserved for Agodi Citizen Connect hand-off) |
| `profiles` | Person × school × role | `user_id` (nullable auth link), `role` (12-value enum), `schoolid_number` (unique, human-readable, never reissued), `qr_token` (rotatable), `verification_status` |
| `guardians` | Parent↔student links | `relationship`; one parent, many children |

### Academic

`academic_years` → `terms`; `departments` → `subjects`; `classes` (per year, homeroom teacher) → `class_subjects` (which teacher teaches which subject to which class) → `enrollments`; `attendance` (unique per student/class/date); `assignments` → `submissions` (score, feedback); `exams` → `exam_results`; `timetable_slots` (day/time/room).

### Finance

`fee_structures` (per year/term/level) → `invoices` (status: draft→sent→partial→paid / overdue / void) → `invoice_items` + `payments` (method, gateway reference). `scholarships` reduce amounts at invoice generation time, recorded explicitly.

### Operations

Library (`books`, `book_loans` w/ fines), transport (`transport_routes`, `route_stops`, `transport_assignments`), security (`visitors`, `entry_logs` from QR gate scans), discipline (`incidents`), counseling (`wellbeing_cases` — extra-restricted), registrar (`admissions_applications`, `certificates` w/ unique verifiable `serial`, `alumni`).

### Communication & platform

`announcements` (role/class-targeted, `is_emergency`), `messages` (1:1), `events` (calendar), `subscriptions` (platform billing per school), `audit_logs` (insert-only).

## 4. RLS strategy

Helper functions (`security definer`, `stable`) derive the caller's memberships once:

- `my_profile_ids()` / `my_school_ids()` — all profiles/schools of `auth.uid()`
- `has_role(school_id, role[])` — role check within a tenant
- `is_super_admin()` — platform staff

Policy pattern per table (illustrative):

| Table | SELECT | WRITE |
|---|---|---|
| `attendance` | own rows (student), children's rows (parent), staff of school | teachers/admin of school |
| `invoices`/`payments` | own/children + finance/admin/principal | finance (+ admin) only |
| `wellbeing_cases` | counselor + principal only | counselor only |
| `audit_logs` | super admin (+ school admin for own school) | insert-only via definer function |
| `schools` | members; super admin all | school admin (branding cols), super admin |

Students and parents can **never** see other students' academic, financial, or disciplinary rows — enforced by subqueries on `guardians`/ownership inside the policies, not by the UI.

## 5. Conventions

- Primary keys: `uuid default gen_random_uuid()`; timestamps: `timestamptz default now()`
- Enums for closed sets (`user_role`, `attendance_status`, `invoice_status`, …) — cheap to extend with `alter type … add value`
- Indexes on every FK + hot paths (`attendance(school_id, date)`, `invoices(school_id, status)`, `entry_logs(school_id, scanned_at)`)
- Scale note: `attendance`, `entry_logs`, `audit_logs` are the growth tables — partition by `school_id`/term at the 1M-row stage (see ARCHITECTURE.md §8)

## 6. Applying

1. Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run
2. Then `supabase/seed.sql` → Run (creates **Demo Academy** with a full term of data)
3. Auth → providers: enable Email. Signing up with a seeded email (e.g. `student@demo.schoolid.africa`) auto-claims that profile via the `handle_new_user` trigger.
