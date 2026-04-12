-- PowerStream Live Engine — extend stations + payments
-- Run in Supabase SQL editor after supabase-standard-schema.sql

alter table public.stations
  add column if not exists rtmp_stream_key text unique,
  add column if not exists owner_user_id text,
  add column if not exists live_title text,
  add column if not exists live_thumbnail_url text,
  add column if not exists live_feed_post_id uuid;

create index if not exists idx_stations_rtmp_key on public.stations (rtmp_stream_key)
  where rtmp_stream_key is not null;
create index if not exists idx_stations_owner on public.stations (owner_user_id);

-- Ledger: tips + subscription purchases (monetization)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  station_slug text,
  type text not null,
  amount_cents int not null default 0,
  currency text default 'usd',
  status text default 'completed',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_payments_station on public.payments (station_slug);
create index if not exists idx_payments_user on public.payments (user_id);

alter table public.payments enable row level security;

-- Realtime for instant live posts (optional)
-- alter publication supabase_realtime add table public.feed_posts;
