-- ============================================================
-- BOD Lenses Portugal v2 — Supabase Schema
-- Run this fresh in SQL Editor
-- ============================================================

-- OPTICA PROFILES (linked to Supabase Auth users)
create table if not exists public.optica_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Profile
  optica_name   text,
  contact_name  text,
  email         text,
  phone         text,
  -- Billing
  nif           text,
  address       text,
  city          text,
  postal_code   text,
  -- Status (BOD approves manually)
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  -- Price config
  prices        jsonb not null default '{}'::jsonb,
  coatings      jsonb not null default '{}'::jsonb
);

-- ACCESS REQUESTS (before auth account is created)
create table if not exists public.access_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  optica_name   text not null,
  contact_name  text not null,
  email         text not null unique,
  phone         text,
  city          text,
  message       text,
  interest      text default 'parceria',
  status        text not null default 'pending' check (status in ('pending','approved','rejected'))
);

-- SALES LOG (for dashboard)
create table if not exists public.sales_log (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  optica_id     uuid references public.optica_profiles(id) on delete cascade,
  lens_type     text not null,
  material      text not null,
  quantity      int not null default 1,
  cost_per_pair numeric not null,
  pvp_per_pair  numeric not null,
  margin_pct    numeric not null,
  month         text not null -- 'YYYY-MM'
);

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  optica_id   uuid references public.optica_profiles(id),
  name        text not null,
  optica      text,
  email       text not null,
  subject     text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new','read','replied'))
);

-- AUTO updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists on_optica_profile_updated on public.optica_profiles;
create trigger on_optica_profile_updated
  before update on public.optica_profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.optica_profiles (id, email, status)
  values (new.id, new.email, 'pending');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.optica_profiles  enable row level security;
alter table public.access_requests  enable row level security;
alter table public.sales_log        enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles: user can only see/edit their own
drop policy if exists "User reads own profile"   on public.optica_profiles;
drop policy if exists "User updates own profile" on public.optica_profiles;
create policy "User reads own profile"   on public.optica_profiles for select using (auth.uid() = id);
create policy "User updates own profile" on public.optica_profiles for update using (auth.uid() = id);

-- Access requests: public insert
drop policy if exists "Anyone can request access" on public.access_requests;
create policy "Anyone can request access" on public.access_requests for insert with check (true);

-- Sales: user manages own
drop policy if exists "User manages own sales" on public.sales_log;
create policy "User manages own sales" on public.sales_log
  for all using (auth.uid() = optica_id) with check (auth.uid() = optica_id);

-- Contact: authenticated insert
drop policy if exists "Auth user can send message" on public.contact_messages;
create policy "Auth user can send message" on public.contact_messages for insert with check (auth.uid() is not null);
drop policy if exists "User reads own messages" on public.contact_messages;
create policy "User reads own messages" on public.contact_messages for select using (auth.uid() = optica_id);
