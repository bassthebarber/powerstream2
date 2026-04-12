-- PowerStream standard schema (5 tables). Run in Supabase SQL editor.
-- Legacy tables (gram_posts, reel_posts, feed_stories, tv_videos, tv_*) are not dropped.

-- Extensions
create extension if not exists "uuid-ossp";

-- 1) profiles (1:1 with auth user when using Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  station_slug text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) stations
create table if not exists public.stations (
  slug text primary key,
  name text not null,
  logo_url text,
  is_live boolean default false,
  viewer_count int default 0,
  live_stream_url text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) station_subscriptions
create table if not exists public.station_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  station_slug text not null,
  created_at timestamptz default now(),
  unique (user_id, station_slug)
);

-- 4) feed_posts (timeline, gram, reel, story, live_stream, station VOD)
create table if not exists public.feed_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  username text,
  post_type text default 'feed',
  content text,
  media_url text,
  media_type text,
  reactions jsonb default '{}',
  comments jsonb default '[]',
  views int default 0,
  station_slug text,
  expires_at timestamptz,
  tags text[] default '{}',
  track_name text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_feed_posts_created on public.feed_posts (created_at desc);
create index if not exists idx_feed_posts_type on public.feed_posts (post_type);
create index if not exists idx_feed_posts_user on public.feed_posts (user_id);
create index if not exists idx_feed_posts_station_vod on public.feed_posts (station_slug, post_type);

-- 5) line_messages
create table if not exists public.line_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id text not null,
  sender_id text not null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists idx_line_messages_thread on public.line_messages (thread_id, created_at);

-- RLS (adjust per product policy)
alter table public.profiles enable row level security;
alter table public.stations enable row level security;
alter table public.station_subscriptions enable row level security;
alter table public.feed_posts enable row level security;
alter table public.line_messages enable row level security;
