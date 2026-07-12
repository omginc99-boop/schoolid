-- ============================================================================
-- SchoolID — Demo Academy seed data
-- Run AFTER schema.sql. Creates one fully-populated school so every role
-- dashboard has real data on day one.
--
-- To log in as any seeded person: sign up in the app with their email
-- (e.g. principal@demo.schoolid.africa) — the handle_new_user trigger
-- claims the matching profile automatically.
-- Super admin email: info@agoditechnologies.com
-- ============================================================================

-- School ---------------------------------------------------------------------
insert into schools (id, slug, name, motto, school_type, city, address, email, phone, primary_color, secondary_color)
values ('10000000-0000-4000-8000-000000000001', 'demo', 'Demo Academy',
        'Knowledge. Character. Excellence.', 'secondary', 'Lagos',
        '14 Adeola Odeku Street, Victoria Island', 'info@demoacademy.africa',
        '+234 800 000 0000', '#4f46e5', '#d97706');

-- People ----------------------------------------------------------------------
insert into people (id, full_name, date_of_birth, gender) values
  ('20000000-0000-4000-8000-000000000001', 'Adaeze Nwosu',      '1978-03-12', 'female'),
  ('20000000-0000-4000-8000-000000000002', 'Emeka Obi',         '1985-07-25', 'male'),
  ('20000000-0000-4000-8000-000000000003', 'Funmilayo Adebayo', '1982-11-02', 'female'),
  ('20000000-0000-4000-8000-000000000004', 'Kemi Balogun',      '1990-05-19', 'female'),
  ('20000000-0000-4000-8000-000000000005', 'Sunday Okon',       '1975-01-30', 'male'),
  ('20000000-0000-4000-8000-000000000006', 'Ibrahim Musa',      '1980-09-14', 'male'),
  ('20000000-0000-4000-8000-000000000007', 'Grace Eze',         '1987-04-08', 'female'),
  ('20000000-0000-4000-8000-000000000008', 'Tayo Ogunleye',     '1983-12-21', 'male'),
  ('20000000-0000-4000-8000-000000000009', 'David Adekunle',    '1988-06-15', 'male'),
  ('20000000-0000-4000-8000-000000000010', 'Chioma Okeke',      '1991-02-27', 'female'),
  ('20000000-0000-4000-8000-000000000011', 'Yusuf Abdullahi',   '1986-08-03', 'male'),
  ('20000000-0000-4000-8000-000000000012', 'Ngozi Anyanwu',     '1992-10-11', 'female'),
  -- students
  ('20000000-0000-4000-8000-000000000013', 'Chidera Okafor',    '2013-04-17', 'male'),
  ('20000000-0000-4000-8000-000000000014', 'Amina Bello',       '2013-09-05', 'female'),
  ('20000000-0000-4000-8000-000000000015', 'Tunde Adeyemi',     '2013-01-22', 'male'),
  ('20000000-0000-4000-8000-000000000016', 'Zainab Lawal',      '2013-06-30', 'female'),
  ('20000000-0000-4000-8000-000000000017', 'Emeka Nwachukwu',   '2013-11-08', 'male'),
  ('20000000-0000-4000-8000-000000000018', 'Folake Ogundipe',   '2012-03-14', 'female'),
  ('20000000-0000-4000-8000-000000000019', 'Ifeanyi Eze',       '2012-07-19', 'male'),
  ('20000000-0000-4000-8000-000000000020', 'Halima Suleiman',   '2012-12-01', 'female'),
  ('20000000-0000-4000-8000-000000000021', 'Segun Bakare',      '2012-05-26', 'male'),
  ('20000000-0000-4000-8000-000000000022', 'Chiamaka Obi',      '2011-08-09', 'female'),
  ('20000000-0000-4000-8000-000000000023', 'Musa Danjuma',      '2011-02-13', 'male'),
  ('20000000-0000-4000-8000-000000000024', 'Adanna Okoro',      '2011-10-04', 'female'),
  -- parents
  ('20000000-0000-4000-8000-000000000025', 'Nnamdi Okafor',     '1980-01-15', 'male'),
  ('20000000-0000-4000-8000-000000000026', 'Hauwa Bello',       '1984-05-23', 'female'),
  ('20000000-0000-4000-8000-000000000027', 'Bisi Adeyemi',      '1979-09-30', 'female'),
  ('20000000-0000-4000-8000-000000000028', 'Abdullahi Lawal',   '1977-07-07', 'male'),
  -- platform
  ('20000000-0000-4000-8000-000000000029', 'Agodi Platform Admin', null, null);

-- Profiles ---------------------------------------------------------------------
-- (schoolid_number/qr_token given explicitly for a deterministic demo)
insert into profiles (id, person_id, school_id, role, email, schoolid_number, qr_token, verification_status, title) values
  ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','principal',   'principal@demo.schoolid.africa', 'SID-DEM-00001','demo-qr-principal','document_verified','Principal'),
  ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','school_admin','admin@demo.schoolid.africa',     'SID-DEM-00002','demo-qr-admin','document_verified','School Administrator'),
  ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','finance',     'finance@demo.schoolid.africa',   'SID-DEM-00003','demo-qr-finance','school_verified','Finance Officer'),
  ('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','librarian',   'librarian@demo.schoolid.africa', 'SID-DEM-00004','demo-qr-librarian','school_verified','Librarian'),
  ('30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','transport',   'driver@demo.schoolid.africa',    'SID-DEM-00005','demo-qr-driver','school_verified','Bus Driver'),
  ('30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','security',    'security@demo.schoolid.africa',  'SID-DEM-00006','demo-qr-security','school_verified','Security Officer'),
  ('30000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000001','counselor',   'counselor@demo.schoolid.africa', 'SID-DEM-00007','demo-qr-counselor','school_verified','School Counselor'),
  ('30000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000001','registrar',   'registrar@demo.schoolid.africa', 'SID-DEM-00008','demo-qr-registrar','school_verified','Registrar'),
  ('30000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000001','teacher',     'teacher.math@demo.schoolid.africa','SID-DEM-00009','demo-qr-t-math','school_verified','Mathematics Teacher'),
  ('30000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000001','teacher',     'teacher.english@demo.schoolid.africa','SID-DEM-00010','demo-qr-t-eng','school_verified','English Teacher'),
  ('30000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000001','teacher',     'teacher.science@demo.schoolid.africa','SID-DEM-00011','demo-qr-t-sci','school_verified','Basic Science Teacher'),
  ('30000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001','teacher',     'teacher.social@demo.schoolid.africa','SID-DEM-00012','demo-qr-t-soc','school_verified','Social Studies Teacher');

insert into profiles (id, person_id, school_id, role, email, schoolid_number, qr_token, verification_status, title) values
  ('30000000-0000-4000-8000-000000000013','20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000001','student','student1@demo.schoolid.africa', 'SID-DEM-00013','demo-qr-s01','school_verified','JSS 1A Student'),
  ('30000000-0000-4000-8000-000000000014','20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000001','student','student2@demo.schoolid.africa', 'SID-DEM-00014','demo-qr-s02','school_verified','JSS 1A Student'),
  ('30000000-0000-4000-8000-000000000015','20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000001','student','student3@demo.schoolid.africa', 'SID-DEM-00015','demo-qr-s03','school_verified','JSS 1A Student'),
  ('30000000-0000-4000-8000-000000000016','20000000-0000-4000-8000-000000000016','10000000-0000-4000-8000-000000000001','student','student4@demo.schoolid.africa', 'SID-DEM-00016','demo-qr-s04','school_verified','JSS 1A Student'),
  ('30000000-0000-4000-8000-000000000017','20000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000001','student','student5@demo.schoolid.africa', 'SID-DEM-00017','demo-qr-s05','school_verified','JSS 1A Student'),
  ('30000000-0000-4000-8000-000000000018','20000000-0000-4000-8000-000000000018','10000000-0000-4000-8000-000000000001','student','student6@demo.schoolid.africa', 'SID-DEM-00018','demo-qr-s06','school_verified','JSS 2A Student'),
  ('30000000-0000-4000-8000-000000000019','20000000-0000-4000-8000-000000000019','10000000-0000-4000-8000-000000000001','student','student7@demo.schoolid.africa', 'SID-DEM-00019','demo-qr-s07','school_verified','JSS 2A Student'),
  ('30000000-0000-4000-8000-000000000020','20000000-0000-4000-8000-000000000020','10000000-0000-4000-8000-000000000001','student','student8@demo.schoolid.africa', 'SID-DEM-00020','demo-qr-s08','school_verified','JSS 2A Student'),
  ('30000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000001','student','student9@demo.schoolid.africa', 'SID-DEM-00021','demo-qr-s09','school_verified','JSS 2A Student'),
  ('30000000-0000-4000-8000-000000000022','20000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000001','student','student10@demo.schoolid.africa','SID-DEM-00022','demo-qr-s10','school_verified','JSS 3A Student'),
  ('30000000-0000-4000-8000-000000000023','20000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000001','student','student11@demo.schoolid.africa','SID-DEM-00023','demo-qr-s11','school_verified','JSS 3A Student'),
  ('30000000-0000-4000-8000-000000000024','20000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000001','student','student12@demo.schoolid.africa','SID-DEM-00024','demo-qr-s12','school_verified','JSS 3A Student'),
  ('30000000-0000-4000-8000-000000000025','20000000-0000-4000-8000-000000000025','10000000-0000-4000-8000-000000000001','parent','parent1@demo.schoolid.africa','SID-DEM-00025','demo-qr-p01','school_verified','Parent'),
  ('30000000-0000-4000-8000-000000000026','20000000-0000-4000-8000-000000000026','10000000-0000-4000-8000-000000000001','parent','parent2@demo.schoolid.africa','SID-DEM-00026','demo-qr-p02','school_verified','Parent'),
  ('30000000-0000-4000-8000-000000000027','20000000-0000-4000-8000-000000000027','10000000-0000-4000-8000-000000000001','parent','parent3@demo.schoolid.africa','SID-DEM-00027','demo-qr-p03','school_verified','Parent'),
  ('30000000-0000-4000-8000-000000000028','20000000-0000-4000-8000-000000000028','10000000-0000-4000-8000-000000000001','parent','parent4@demo.schoolid.africa','SID-DEM-00028','demo-qr-p04','school_verified','Parent');

-- Platform super admin (no school). Claimed by signing up with this email.
insert into profiles (id, person_id, school_id, role, email, schoolid_number, qr_token, verification_status, title)
values ('30000000-0000-4000-8000-000000000099','20000000-0000-4000-8000-000000000029',null,'super_admin',
        'info@agoditechnologies.com','SID-AGD-00001','demo-qr-platform','document_verified','Platform Administrator');

update schools set id_counter = 40 where id = '10000000-0000-4000-8000-000000000001';

-- Guardians ---------------------------------------------------------------------
insert into guardians (school_id, parent_profile_id, student_profile_id, relationship) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000025','30000000-0000-4000-8000-000000000013','father'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000025','30000000-0000-4000-8000-000000000019','father'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000026','30000000-0000-4000-8000-000000000014','mother'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000026','30000000-0000-4000-8000-000000000020','mother'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000027','30000000-0000-4000-8000-000000000015','mother'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000027','30000000-0000-4000-8000-000000000022','mother'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000028','30000000-0000-4000-8000-000000000016','father');

-- Academic structure ---------------------------------------------------------------
insert into academic_years (id, school_id, name, starts_on, ends_on, is_current)
values ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','2026/2027','2026-09-07','2027-07-16', false),
       ('40000000-0000-4000-8000-000000000000','10000000-0000-4000-8000-000000000001','2025/2026','2025-09-08','2026-07-17', true);

insert into terms (id, school_id, academic_year_id, name, starts_on, ends_on, is_current) values
  ('41000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','First Term','2025-09-08','2025-12-12', false),
  ('41000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','Second Term','2026-01-05','2026-04-02', false),
  ('41000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','Third Term','2026-04-27','2026-07-17', true);

insert into departments (id, school_id, name) values
  ('42000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Sciences'),
  ('42000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Arts & Humanities');

insert into subjects (id, school_id, department_id, name, code) values
  ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000001','Mathematics','MTH'),
  ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000002','English Language','ENG'),
  ('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000001','Basic Science','BSC'),
  ('50000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000002','Social Studies','SOS'),
  ('50000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000001','Computer Studies','CMP'),
  ('50000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000002','Creative Arts','CRA');

insert into classes (id, school_id, academic_year_id, name, level, homeroom_teacher_id) values
  ('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','JSS 1A','JSS 1','30000000-0000-4000-8000-000000000009'),
  ('60000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','JSS 2A','JSS 2','30000000-0000-4000-8000-000000000010'),
  ('60000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','JSS 3A','JSS 3','30000000-0000-4000-8000-000000000011');

-- Which teacher teaches which subject to which class
insert into class_subjects (school_id, class_id, subject_id, teacher_profile_id)
select '10000000-0000-4000-8000-000000000001', c.id, s.id,
       case s.code when 'MTH' then '30000000-0000-4000-8000-000000000009'::uuid
                   when 'ENG' then '30000000-0000-4000-8000-000000000010'::uuid
                   when 'BSC' then '30000000-0000-4000-8000-000000000011'::uuid
                   else '30000000-0000-4000-8000-000000000012'::uuid end
from classes c cross join subjects s
where c.school_id = '10000000-0000-4000-8000-000000000001';

-- Enrollments
insert into enrollments (school_id, student_profile_id, class_id, academic_year_id)
select '10000000-0000-4000-8000-000000000001', p.id,
       case when p.schoolid_number between 'SID-DEM-00013' and 'SID-DEM-00017' then '60000000-0000-4000-8000-000000000001'::uuid
            when p.schoolid_number between 'SID-DEM-00018' and 'SID-DEM-00021' then '60000000-0000-4000-8000-000000000002'::uuid
            else '60000000-0000-4000-8000-000000000003'::uuid end,
       '40000000-0000-4000-8000-000000000000'
from profiles p where p.role = 'student' and p.school_id = '10000000-0000-4000-8000-000000000001';

-- Attendance: last ~3 school weeks, realistic mix -----------------------------------
insert into attendance (school_id, student_profile_id, class_id, date, status, recorded_by)
select e.school_id, e.student_profile_id, e.class_id, d::date,
       (case when random() < 0.90 then 'present'
             when random() < 0.60 then 'late'
             when random() < 0.50 then 'excused'
             else 'absent' end)::attendance_status,
       '30000000-0000-4000-8000-000000000009'
from enrollments e
cross join generate_series(current_date - interval '18 days', current_date, interval '1 day') d
where extract(isodow from d) < 6
  and e.school_id = '10000000-0000-4000-8000-000000000001';

-- Timetable for all three classes: Mon-Fri, 4 periods -------------------------------
-- 4 periods per class per weekday, subjects rotated deterministically, no clashes
insert into timetable_slots (school_id, class_id, subject_id, teacher_profile_id, day_of_week, starts_at, ends_at, room)
select x.school_id, x.class_id, x.subject_id, x.teacher_profile_id, x.dow,
       (time '08:00' + ((x.rn - 1) * interval '65 minutes'))::time,
       (time '09:00' + ((x.rn - 1) * interval '65 minutes'))::time,
       'Room ' || (1 + (abs(hashtext(x.class_id::text)) % 6))
from (
  select cs.school_id, cs.class_id, cs.subject_id, cs.teacher_profile_id, d.dow,
         row_number() over (partition by cs.class_id, d.dow
                            order by abs(hashtext(cs.subject_id::text || d.dow::text || cs.class_id::text))) as rn
  from class_subjects cs
  cross join (values (1),(2),(3),(4),(5)) d(dow)
  where cs.school_id = '10000000-0000-4000-8000-000000000001'
) x
where x.rn <= 4;

-- Assignments & submissions ----------------------------------------------------------
insert into assignments (id, school_id, class_id, subject_id, teacher_profile_id, kind, title, instructions, due_at) values
  ('70000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000009','homework','Fractions worksheet','Complete exercises 1-20 on adding and subtracting fractions.', now() + interval '2 days'),
  ('70000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000010','assignment','Book report: Things Fall Apart (abridged)','Write a one-page report on chapters 1-3.', now() + interval '5 days'),
  ('70000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000011','homework','Label the plant cell','Draw and label all parts of a plant cell.', now() - interval '1 day'),
  ('70000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000009','quiz','Algebra basics quiz','Solve for x: ten questions.', now() + interval '3 days'),
  ('70000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000012','project','Build a simple webpage','Create a one-page HTML profile about yourself.', now() + interval '10 days');

-- Submissions for the overdue plant-cell homework (graded) and fractions (ungraded)
insert into submissions (school_id, assignment_id, student_profile_id, submitted_at, content, score, feedback, graded_by, graded_at)
select e.school_id, '70000000-0000-4000-8000-000000000003', e.student_profile_id,
       now() - interval '2 days', 'Submitted drawing attached.',
       round(55 + random() * 43), 'Well done — check the mitochondria label.',
       '30000000-0000-4000-8000-000000000011', now() - interval '1 day'
from enrollments e where e.class_id = '60000000-0000-4000-8000-000000000001' and random() < 0.9;

insert into submissions (school_id, assignment_id, student_profile_id, submitted_at, content)
select e.school_id, '70000000-0000-4000-8000-000000000001', e.student_profile_id,
       now() - interval '3 hours', 'Completed worksheet.'
from enrollments e where e.class_id = '60000000-0000-4000-8000-000000000001' and random() < 0.6;

-- Exams & results ---------------------------------------------------------------------
insert into exams (id, school_id, term_id, name, starts_on, ends_on)
values ('71000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000003','Mid-Term Examination', current_date - 10, current_date - 6);

insert into exam_results (school_id, exam_id, term_id, student_profile_id, subject_id, score, grade_letter, remark, recorded_by)
select e.school_id, '71000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000003',
       e.student_profile_id, s.id, sc.score,
       case when sc.score >= 75 then 'A' when sc.score >= 65 then 'B'
            when sc.score >= 55 then 'C' when sc.score >= 45 then 'D' else 'F' end,
       case when sc.score >= 75 then 'Excellent' when sc.score >= 55 then 'Good effort' else 'Needs support' end,
       '30000000-0000-4000-8000-000000000009'
from enrollments e
cross join subjects s
cross join lateral (select round(42 + random() * 56) as score) sc
where s.school_id = e.school_id
  and e.school_id = '10000000-0000-4000-8000-000000000001';

-- Fees & invoices -----------------------------------------------------------------------
insert into fee_structures (id, school_id, academic_year_id, term_id, name, amount) values
  ('72000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','41000000-0000-4000-8000-000000000003','Tuition', 250000),
  ('72000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','41000000-0000-4000-8000-000000000003','Books & Materials', 30000),
  ('72000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000000','41000000-0000-4000-8000-000000000003','Transport (optional)', 45000);

insert into invoices (school_id, student_profile_id, term_id, number, status, due_on, total)
select e.school_id, e.student_profile_id, '41000000-0000-4000-8000-000000000003',
       'INV-2026-' || lpad(row_number() over (order by e.student_profile_id)::text, 4, '0'),
       'sent', current_date + 14, 280000
from enrollments e where e.school_id = '10000000-0000-4000-8000-000000000001';

insert into invoice_items (school_id, invoice_id, fee_structure_id, description, amount)
select i.school_id, i.id, '72000000-0000-4000-8000-000000000001', 'Tuition — Third Term 2025/2026', 250000
from invoices i where i.school_id = '10000000-0000-4000-8000-000000000001';
insert into invoice_items (school_id, invoice_id, fee_structure_id, description, amount)
select i.school_id, i.id, '72000000-0000-4000-8000-000000000002', 'Books & Materials', 30000
from invoices i where i.school_id = '10000000-0000-4000-8000-000000000001';

-- ~half the invoices fully paid, some partially (trigger sets statuses)
insert into payments (school_id, invoice_id, amount, method, reference, paid_at, recorded_by)
select i.school_id, i.id, 280000, 'paystack', 'PSK-' || substr(md5(i.id::text), 1, 10),
       now() - (random() * interval '20 days'), '30000000-0000-4000-8000-000000000003'
from invoices i
where i.school_id = '10000000-0000-4000-8000-000000000001' and random() < 0.5;

insert into payments (school_id, invoice_id, amount, method, reference, paid_at, recorded_by)
select i.school_id, i.id, 140000, 'bank_transfer', 'TRF-' || substr(md5(i.id::text), 1, 10),
       now() - (random() * interval '10 days'), '30000000-0000-4000-8000-000000000003'
from invoices i
where i.school_id = '10000000-0000-4000-8000-000000000001' and i.status = 'sent' and random() < 0.5;

update invoices set status = 'overdue', due_on = current_date - 7
where school_id = '10000000-0000-4000-8000-000000000001' and status = 'sent' and random() < 0.4;

insert into scholarships (school_id, student_profile_id, name, percent, academic_year_id, notes)
values ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000022','Merit Scholarship', 50,
        '40000000-0000-4000-8000-000000000000','Top of class 2024/2025');

-- Library ----------------------------------------------------------------------------------
insert into books (id, school_id, title, author, isbn, category, shelf, copies_total, copies_available) values
  ('73000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Things Fall Apart','Chinua Achebe','9780385474542','Literature','A1', 8, 5),
  ('73000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','New General Mathematics JSS 1','M. Macrae','9781405802734','Mathematics','B2', 15, 12),
  ('73000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Basic Science Made Easy','F. Ndu','9789785544301','Science','B3', 10, 9),
  ('73000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','The Passport of Mallam Ilia','Cyprian Ekwensi','9789781560904','Literature','A1', 6, 6),
  ('73000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','Computer Studies for Beginners','A. Adeoye','9789785123456','Technology','C1', 12, 10),
  ('73000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','Sugar Girl','Kola Onadipe','9789781673404','Literature','A2', 5, 4);

insert into book_loans (school_id, book_id, borrower_profile_id, borrowed_at, due_on, status, fine_amount) values
  ('10000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000013', current_date - 5,  current_date + 9,  'out', 0),
  ('10000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000018', current_date - 20, current_date - 6,  'overdue', 700),
  ('10000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000014', current_date - 3,  current_date + 11, 'out', 0),
  ('10000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000022', current_date - 8,  current_date + 6,  'out', 0),
  ('10000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000019', current_date - 15, current_date - 1,  'overdue', 350);

-- Transport ---------------------------------------------------------------------------------
insert into transport_routes (id, school_id, name, vehicle_reg, driver_profile_id) values
  ('74000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Route A — Lekki/Ajah','LAG-234-XY','30000000-0000-4000-8000-000000000005'),
  ('74000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Route B — Surulere/Yaba','LAG-871-ZA', null);

insert into route_stops (school_id, route_id, name, pickup_time, dropoff_time, sort_order) values
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001','Lekki Phase 1 Gate','06:45','15:30',1),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001','Chevron Drive','07:00','15:15',2),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001','Ajah Market','07:20','14:55',3),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000002','Ojuelegba','06:50','15:25',1),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000002','Yaba Tech Gate','07:10','15:05',2);

insert into transport_assignments (school_id, route_id, stop_id, student_profile_id) values
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001',(select id from route_stops where name='Lekki Phase 1 Gate'),'30000000-0000-4000-8000-000000000013'),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001',(select id from route_stops where name='Chevron Drive'),'30000000-0000-4000-8000-000000000014'),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001',(select id from route_stops where name='Ajah Market'),'30000000-0000-4000-8000-000000000018'),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000002',(select id from route_stops where name='Ojuelegba'),'30000000-0000-4000-8000-000000000022'),
  ('10000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000002',(select id from route_stops where name='Yaba Tech Gate'),'30000000-0000-4000-8000-000000000023');

-- Security ----------------------------------------------------------------------------------
insert into visitors (school_id, full_name, phone, purpose, host_profile_id, badge_number, checked_in_at, checked_out_at, recorded_by) values
  ('10000000-0000-4000-8000-000000000001','Mr. Femi Ajayi','+2348030000001','Parent-teacher meeting','30000000-0000-4000-8000-000000000010','V-014', now() - interval '3 hours', now() - interval '2 hours','30000000-0000-4000-8000-000000000006'),
  ('10000000-0000-4000-8000-000000000001','Delivery — Bookshop Ltd','+2348030000002','Textbook delivery','30000000-0000-4000-8000-000000000004','V-015', now() - interval '90 minutes', null,'30000000-0000-4000-8000-000000000006'),
  ('10000000-0000-4000-8000-000000000001','Mrs. Ronke Dada','+2348030000003','Admissions enquiry','30000000-0000-4000-8000-000000000008','V-016', now() - interval '40 minutes', null,'30000000-0000-4000-8000-000000000006');

insert into entry_logs (school_id, profile_id, direction, gate, scanned_by, scanned_at)
select p.school_id, p.id, 'in', 'Main Gate', '30000000-0000-4000-8000-000000000006',
       current_date + time '07:35' + (random() * interval '35 minutes')
from profiles p
where p.role = 'student' and p.school_id = '10000000-0000-4000-8000-000000000001' and random() < 0.85;

-- Discipline & wellbeing ----------------------------------------------------------------------
insert into incidents (school_id, student_profile_id, category, description, action_taken, status, occurred_on, reported_by) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000021','Lateness','Late to school three times this week.','Parent notified; warning issued.','resolved', current_date - 4,'30000000-0000-4000-8000-000000000010'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000019','Conduct','Disruption during Basic Science practical.','Counselor referral.','open', current_date - 2,'30000000-0000-4000-8000-000000000011');

insert into wellbeing_cases (school_id, student_profile_id, counselor_profile_id, risk, summary, notes, status, opened_on) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000019','30000000-0000-4000-8000-000000000007','medium','Behavioural change and attendance dip','Two sessions held. Family situation being monitored. Coordinating with homeroom teacher.','open', current_date - 12),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000020','30000000-0000-4000-8000-000000000007','low','Exam anxiety','Taught coping techniques; improving steadily.','open', current_date - 20);

-- Communication & calendar ----------------------------------------------------------------------
insert into announcements (school_id, title, body, audience_roles, is_emergency, author_profile_id, published_at) values
  ('10000000-0000-4000-8000-000000000001','Mid-term results are out','Third-term mid-term examination results have been published. Parents can view them under Results.', array['student','parent']::user_role[], false,'30000000-0000-4000-8000-000000000001', now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000001','PTA meeting — Saturday 9am','The termly Parent-Teacher Association meeting holds in the school hall. All parents are encouraged to attend.', array['parent','teacher']::user_role[], false,'30000000-0000-4000-8000-000000000002', now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000001','Inter-house sports practice','Practice starts Monday during PE periods. Bring your house colours.', array['student','teacher']::user_role[], false,'30000000-0000-4000-8000-000000000012', now() - interval '6 hours'),
  ('10000000-0000-4000-8000-000000000001','School fees reminder','Third-term fees fall due in two weeks. Pay online from the Parent portal to get an instant receipt.', array['parent']::user_role[], false,'30000000-0000-4000-8000-000000000003', now() - interval '3 hours');

insert into messages (school_id, sender_profile_id, recipient_profile_id, body, read_at, created_at) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000025','30000000-0000-4000-8000-000000000009','Good afternoon Mr. Adekunle. How is Chidera coping with fractions? He struggled last term.', now() - interval '1 day', now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000009','30000000-0000-4000-8000-000000000025','Good afternoon sir. Marked improvement — he scored 78% on the mid-term. The extra practice is working.', null, now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000026','30000000-0000-4000-8000-000000000010','Please can Amina be excused from PE on Friday? She has a clinic appointment.', null, now() - interval '4 hours');

insert into events (school_id, title, kind, location, starts_at, ends_at, audience_roles) values
  ('10000000-0000-4000-8000-000000000001','PTA Meeting','meeting','School Hall', current_date + interval '2 days' + time '09:00', current_date + interval '2 days' + time '11:00', array['parent','teacher']::user_role[]),
  ('10000000-0000-4000-8000-000000000001','Inter-House Sports','event','Sports Field', current_date + interval '12 days' + time '08:00', current_date + interval '12 days' + time '15:00', array['student','parent','teacher']::user_role[]),
  ('10000000-0000-4000-8000-000000000001','End-of-Term Examinations','exam','Classrooms', current_date + interval '21 days' + time '08:00', current_date + interval '26 days' + time '13:00', array['student','parent','teacher']::user_role[]),
  ('10000000-0000-4000-8000-000000000001','Cultural Day','event','School Hall', current_date + interval '18 days' + time '10:00', current_date + interval '18 days' + time '14:00', array['student','parent','teacher']::user_role[]),
  ('10000000-0000-4000-8000-000000000001','Staff Development Workshop','meeting','Staff Room', current_date + interval '5 days' + time '13:00', current_date + interval '5 days' + time '16:00', array['teacher']::user_role[]);

-- Registrar -----------------------------------------------------------------------------------
insert into admissions_applications (school_id, applicant_name, date_of_birth, guardian_name, guardian_phone, guardian_email, desired_level, status, submitted_at) values
  ('10000000-0000-4000-8000-000000000001','Olamide Fashola','2014-02-11','Mr. Kunle Fashola','+2348031110001','kfashola@example.com','JSS 1','pending', now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000001','Chisom Nnaji','2014-06-24','Mrs. Ada Nnaji','+2348031110002','adannaji@example.com','JSS 1','review', now() - interval '5 days'),
  ('10000000-0000-4000-8000-000000000001','Fatima Garba','2013-12-03','Alhaji S. Garba','+2348031110003','sgarba@example.com','JSS 2','interview', now() - interval '8 days'),
  ('10000000-0000-4000-8000-000000000001','Daniel Okafor','2014-04-16','Mrs. Ify Okafor','+2348031110004','ifyokafor@example.com','JSS 1','admitted', now() - interval '12 days'),
  ('10000000-0000-4000-8000-000000000001','Blessing Adamu','2013-08-29','Mr. P. Adamu','+2348031110005','padamu@example.com','JSS 2','rejected', now() - interval '15 days'),
  ('10000000-0000-4000-8000-000000000001','Kelechi Eze','2014-01-07','Dr. N. Eze','+2348031110006','neze@example.com','JSS 1','pending', now() - interval '1 day');

insert into certificates (school_id, student_profile_id, title, kind, serial, issued_on, issued_by) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000022','Best in Mathematics — Second Term','award','CERT-DEM-2026-0001', current_date - 45,'30000000-0000-4000-8000-000000000008'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000014','Perfect Attendance — Second Term','award','CERT-DEM-2026-0002', current_date - 45,'30000000-0000-4000-8000-000000000008');

insert into alumni (school_id, person_id, graduated_on, class_name, notes)
values ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000029', '2025-07-18','SSS 3A','Seed example — alumni records carry the person, not the profile.');

-- Platform ------------------------------------------------------------------------------------
insert into subscriptions (school_id, plan, status, price_per_student, currency, current_period_end)
values ('10000000-0000-4000-8000-000000000001','growth','active', 1.50,'USD', current_date + 60);

insert into audit_logs (school_id, actor_profile_id, action, entity, entity_id, detail) values
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','school.seeded','school','10000000-0000-4000-8000-000000000001','{"source":"seed.sql"}'),
  ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','invoice.batch_created','invoice',null,'{"count":12,"term":"Third Term"}'),
  (null,'30000000-0000-4000-8000-000000000099','platform.school_activated','school','10000000-0000-4000-8000-000000000001','{"plan":"growth"}');

-- ============================================================================
-- Done. Demo Academy is fully populated.
-- ============================================================================
