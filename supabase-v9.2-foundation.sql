-- Klang Plan V9.2 Foundation (additive migration blueprint)
-- Review in staging before production. Existing lesson_plans remain compatible.
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  grade text not null,
  subject text,
  semester text,
  academic_year text,
  total_hours integer,
  school_name text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.learning_units (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, unit_no integer, title text not null,
  hours integer, indicator_codes jsonb not null default '[]'::jsonb, content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.course_documents (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, document_type text not null,
  title text not null, content jsonb not null default '{}'::jsonb, version integer not null default 1,
  status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.lesson_plans add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.lesson_plans add column if not exists unit_id uuid references public.learning_units(id) on delete set null;
create index if not exists courses_user_idx on public.courses(user_id, academic_year, semester);
create index if not exists learning_units_course_idx on public.learning_units(course_id, unit_no);
create index if not exists course_documents_course_idx on public.course_documents(course_id, document_type);
-- RLS: owner-only
alter table public.courses enable row level security;
alter table public.learning_units enable row level security;
alter table public.course_documents enable row level security;
drop policy if exists courses_owner_all on public.courses;
create policy courses_owner_all on public.courses for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists learning_units_owner_all on public.learning_units;
create policy learning_units_owner_all on public.learning_units for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists course_documents_owner_all on public.course_documents;
create policy course_documents_owner_all on public.course_documents for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
