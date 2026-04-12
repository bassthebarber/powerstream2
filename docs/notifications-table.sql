-- PowerStream real-time notifications (run in Supabase SQL editor)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  actor_id text,
  type text not null check (type in (
    'post', 'like', 'comment', 'dm', 'live', 'video', 'subscription'
  )),
  entity_id text,
  message text not null default '',
  is_read boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on public.notifications (user_id) where is_read = false;

alter table public.notifications enable row level security;

-- Service role bypasses RLS; optional policy for authenticated users reading own rows:
-- create policy "read own" on public.notifications for select using (auth.uid()::text = user_id);

comment on table public.notifications is 'In-app + socket notifications for PowerStream';
