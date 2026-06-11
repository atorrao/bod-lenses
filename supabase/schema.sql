-- ============================================================
-- BOD Lenses Portugal — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. CONTACT MESSAGES
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  optica      text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new','read','replied'))
);

-- 2. OPTICA LEADS (new opticians interested in partnership)
create table if not exists public.optica_leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  optica        text not null,
  email         text not null,
  phone         text,
  city          text,
  message       text,
  interest      text default 'parceria' check (interest in ('parceria','bod-start','pioneiros','outro')),
  status        text not null default 'new' check (status in ('new','contacted','converted','rejected'))
);

-- 3. PRICE CONFIGS (per optician, identified by email)
create table if not exists public.price_configs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  optica_email text not null unique,
  optica_name  text,
  prices      jsonb not null default '{}'::jsonb,
  coatings    jsonb not null default '{}'::jsonb
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_price_config_updated
  before update on public.price_configs
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.contact_messages enable row level security;
alter table public.optica_leads enable row level security;
alter table public.price_configs enable row level security;

-- Public can INSERT (form submissions), cannot read others
create policy "Anyone can submit contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Anyone can submit lead"
  on public.optica_leads for insert
  with check (true);

-- Price configs: anyone can insert/update their own (by email match)
create policy "Anyone can upsert own price config"
  on public.price_configs for insert
  with check (true);

create policy "Anyone can update own price config"
  on public.price_configs for update
  using (true);

create policy "Anyone can read own price config"
  on public.price_configs for select
  using (true);
