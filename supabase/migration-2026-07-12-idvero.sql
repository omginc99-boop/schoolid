-- IDVero integration. ONLY needed if you ran schema.sql before this change;
-- fresh installs already include it.
alter table profiles add column if not exists idvero_ref text;
