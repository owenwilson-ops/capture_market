-- Sirius Recruit — Supabase Schema
-- Run this in your Supabase SQL editor after creating a new project.

-- profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  "dreamSchoolId" text,
  position text,
  grade text,
  "gradYear" int,
  "mySchools" text[] default '{}',
  "parentMode" boolean default false,
  -- Academic profile (optional). Used for academic reach/target/likely fit
  -- against each school's College Scorecard SAT/ACT ranges. GPA is stored for
  -- the player's reference; Scorecard publishes no GPA range to compare to.
  gpa numeric,
  "satScore" int,
  "actScore" int,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- Migration for existing projects: add academic columns if missing.
alter table public.profiles add column if not exists gpa numeric;
alter table public.profiles add column if not exists "satScore" int;
alter table public.profiles add column if not exists "actScore" int;

-- streaks
create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean default false,
  "nonNegotiablesChecked" int[] default '{}',
  unique("userId", date)
);

-- sessionLogs
create table public."sessionLogs" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.profiles(id) on delete cascade,
  "planId" text,
  "completedAt" timestamp with time zone default now(),
  "durationMinutes" int
);

-- personalRecords
create table public."personalRecords" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.profiles(id) on delete cascade,
  "recordType" text,
  value numeric,
  "loggedAt" timestamp with time zone default now()
);

-- contactLogs
create table public."contactLogs" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.profiles(id) on delete cascade,
  "schoolId" text,
  date date,
  method text,
  notes text,
  "createdAt" timestamp with time zone default now()
);

-- roadmapProgress
create table public."roadmapProgress" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.profiles(id) on delete cascade,
  "milestoneId" text,
  "completedAt" timestamp with time zone default now(),
  unique("userId", "milestoneId")
);

-- Note: calendar events are stored on-device (AsyncStorage), not here.

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.streaks enable row level security;
alter table public."sessionLogs" enable row level security;
alter table public."personalRecords" enable row level security;
alter table public."contactLogs" enable row level security;
alter table public."roadmapProgress" enable row level security;

-- RLS Policies — users can only read/write their own rows

create policy "profiles: own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "streaks: own rows" on public.streaks
  for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

create policy "sessionLogs: own rows" on public."sessionLogs"
  for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

create policy "personalRecords: own rows" on public."personalRecords"
  for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

create policy "contactLogs: own rows" on public."contactLogs"
  for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

create policy "roadmapProgress: own rows" on public."roadmapProgress"
  for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, "createdAt")
  values (new.id, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
