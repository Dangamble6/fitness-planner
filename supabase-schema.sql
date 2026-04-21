-- Fitness Planner — Supabase Schema
-- Run this in your Supabase SQL Editor if/when you want cloud sync.
-- The app works entirely from localStorage without this — treat as optional.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  units text default 'kg' check (units in ('kg', 'lbs'))
);

create table if not exists workout_templates (
  id text primary key,
  name text not null,
  tag text,
  duration_min int,
  color text,
  sort_order int default 0
);

create table if not exists exercises (
  id text primary key,
  template_id text references workout_templates(id) on delete cascade,
  name text not null,
  muscle text,
  sets int default 3,
  reps_min int default 10,
  reps_max int default 12,
  default_weight numeric default 0,
  unit text default 'reps',
  each_side boolean default false,
  sort_order int default 0
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  template_id text references workout_templates(id),
  template_name text,
  started_at timestamptz default now(),
  duration_seconds int,
  created_at timestamptz default now()
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  exercise_id text references exercises(id),
  exercise_name text,
  weight numeric,
  completed_sets int,
  total_sets int,
  notes text
);

create table if not exists exercise_weights (
  user_id uuid references users(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  weight numeric not null,
  updated_at timestamptz default now(),
  primary key (user_id, exercise_id)
);

create table if not exists personal_bests (
  user_id uuid references users(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  weight numeric not null,
  achieved_at timestamptz default now(),
  primary key (user_id, exercise_id)
);

create table if not exists weight_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  weight numeric not null,
  notes text,
  logged_at timestamptz default now()
);

create table if not exists photo_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  week_number int not null,
  year int not null,
  angle text check (angle in ('front', 'side', 'back')),
  photo_url text not null,
  uploaded_at timestamptz default now(),
  unique (user_id, week_number, year, angle)
);

create table if not exists custom_videos (
  user_id uuid references users(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  video_id text not null,
  primary key (user_id, exercise_id)
);

create index if not exists idx_sessions_user on sessions(user_id, started_at desc);
create index if not exists idx_exercise_logs_session on exercise_logs(session_id);
create index if not exists idx_weight_log_user on weight_log(user_id, logged_at desc);
create index if not exists idx_photo_log_user on photo_log(user_id, year desc, week_number desc);
