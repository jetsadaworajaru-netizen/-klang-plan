-- Klang Plan V9.2.6 Assessment pipeline
-- Additive / backward-compatible. Apply after V9.2.4 persistence migration.

alter table if exists public.assessments add column if not exists client_id text;
create unique index if not exists assessments_user_client_uidx on public.assessments(user_id, client_id) where client_id is not null;
create index if not exists assessments_unit_idx on public.assessments(unit_id, assessment_type);

comment on table public.assessments is 'Klang Plan assessments: pretest, posttest, final exam, blueprint, prompt/content, answer key.';
