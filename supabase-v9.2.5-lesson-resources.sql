-- Klang Plan V9.2.5 — lesson/unit linkage and resource client IDs
-- Apply AFTER supabase-v9.2.4-persistence.sql

alter table public.learning_units add column if not exists client_id uuid;
update public.learning_units set client_id=id where client_id is null;
alter table public.learning_units alter column client_id set not null;
create unique index if not exists learning_units_user_course_client_uidx on public.learning_units(user_id, course_id, client_id);

alter table public.learning_resources add column if not exists client_id uuid;
update public.learning_resources set client_id=id where client_id is null;
alter table public.learning_resources alter column client_id set not null;
create unique index if not exists learning_resources_user_client_uidx on public.learning_resources(user_id, client_id);
