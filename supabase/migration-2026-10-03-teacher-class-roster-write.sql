-- Let teachers create classes and add students, not just school_admin/
-- principal/registrar. Run once in the Supabase SQL editor. Safe to re-run.
--
-- These are ADDITIONAL permissive policies (RLS ORs them with the existing
-- admin-only ones) — they don't touch the generic reference-table loop in
-- schema.sql, so teachers still can't write fee_structures, books, etc.
-- Mirrors the existing timetable_teacher_write / exams_teacher_write pattern.

drop policy if exists classes_teacher_write on classes;
create policy classes_teacher_write on classes for all
  using (has_role(school_id, array['teacher']::user_role[]))
  with check (has_role(school_id, array['teacher']::user_role[]));

-- Note: no separate people_teacher_write needed — people_admin_write's
-- `with check (true)` already lets any authenticated role insert a person
-- row (pre-existing, not something this migration changes). Only
-- profiles/enrollments/classes actually gate INSERT by role below.

drop policy if exists profiles_teacher_write on profiles;
create policy profiles_teacher_write on profiles for all
  using (has_role(school_id, array['teacher']::user_role[]))
  with check (has_role(school_id, array['teacher']::user_role[]));

drop policy if exists enrollments_teacher_write on enrollments;
create policy enrollments_teacher_write on enrollments for all
  using (has_role(school_id, array['teacher']::user_role[]))
  with check (has_role(school_id, array['teacher']::user_role[]));
