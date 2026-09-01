-- Only needed if your database was created before 2026-08-27; fresh installs
-- already include this in schema.sql.
alter table profiles add column if not exists afriid_ref text;
alter table profiles add column if not exists welcome_email_sent boolean not null default false;
