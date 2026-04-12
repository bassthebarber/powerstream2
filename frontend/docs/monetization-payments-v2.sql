-- PowerStream unified monetization — extend payments ledger (run after supabase-live-engine.sql)

alter table public.payments
  add column if not exists creator_id text,
  add column if not exists platform_fee_cents int not null default 0,
  add column if not exists creator_earnings_cents int not null default 0,
  add column if not exists stripe_checkout_session_id text;

create index if not exists idx_payments_creator on public.payments (creator_id);
create index if not exists idx_payments_stripe_session on public.payments (stripe_checkout_session_id);

comment on column public.payments.platform_fee_cents is '30% platform share';
comment on column public.payments.creator_earnings_cents is '70% creator share';

-- line_messages: optional typing / read state (messenger uses thread_id dm_<userId>_<userId> sorted)
create index if not exists idx_line_messages_thread on public.line_messages (thread_id);
create index if not exists idx_line_messages_created on public.line_messages (thread_id, created_at desc);
