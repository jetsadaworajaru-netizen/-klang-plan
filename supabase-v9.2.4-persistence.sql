-- Klang Plan V9.2.4 — Course Workspace persistence (additive / backward compatible)
-- Apply to the Klang Plan Supabase project only after reviewing in a development/staging context.
-- Existing profiles, auth users and lesson_plans data are not deleted.

create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid,
  name text not null,
  stage text,
  grade text not null,
  subject text,
  semester text,
  academic_year text,
  total_hours integer,
  school_name text,
  status text not null default 'draft',
  workflow_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists client_id uuid;
alter table public.courses add column if not exists stage text;
alter table public.courses add column if not exists workflow_data jsonb not null default '{}'::jsonb;
update public.courses set client_id=id where client_id is null;
alter table public.courses alter column client_id set not null;
create unique index if not exists courses_user_client_uidx on public.courses(user_id, client_id);
create index if not exists courses_user_period_idx on public.courses(user_id, academic_year, semester);

create table if not exists public.curriculum_analyses (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_indicator_ids jsonb not null default '[]'::jsonb,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_structures (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  total_hours integer,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teaching_schedules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_no integer,
  title text not null,
  description text,
  hours integer,
  weight numeric,
  sort_order integer,
  indicator_codes jsonb not null default '[]'::jsonb,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  unit_id uuid references public.learning_units(id) on delete set null,
  lesson_plan_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  unit_id uuid references public.learning_units(id) on delete set null,
  lesson_plan_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_type text not null,
  title text not null,
  blueprint jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  answer_key jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  unit_id uuid references public.learning_units(id) on delete set null,
  lesson_plan_id uuid,
  document_type text not null,
  source_type text,
  source_id uuid,
  title text not null,
  version integer not null default 1,
  content jsonb not null default '{}'::jsonb,
  docx_path text,
  pdf_path text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_plans add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.lesson_plans add column if not exists unit_id uuid references public.learning_units(id) on delete set null;

create index if not exists curriculum_analyses_course_idx on public.curriculum_analyses(course_id);
create index if not exists course_structures_course_idx on public.course_structures(course_id);
create index if not exists teaching_schedules_course_idx on public.teaching_schedules(course_id);
create index if not exists learning_units_course_idx on public.learning_units(course_id, unit_no);
create index if not exists learning_resources_course_idx on public.learning_resources(course_id, unit_id);
create index if not exists assessments_course_idx on public.assessments(course_id, assessment_type);
create index if not exists documents_course_idx on public.documents(course_id, document_type);

alter table public.courses enable row level security;
alter table public.curriculum_analyses enable row level security;
alter table public.course_structures enable row level security;
alter table public.teaching_schedules enable row level security;
alter table public.learning_units enable row level security;
alter table public.learning_resources enable row level security;
alter table public.assessments enable row level security;
alter table public.documents enable row level security;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['courses','curriculum_analyses','course_structures','teaching_schedules','learning_units','learning_resources','assessments','documents']
  LOOP
    EXECUTE format('drop policy if exists %I_owner_all on public.%I', t, t);
    EXECUTE format('create policy %I_owner_all on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
  END LOOP;
END $$;
