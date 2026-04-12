-- Prevent duplicate ledger rows per Stripe Checkout session (optional, recommended)
create unique index if not exists idx_payments_stripe_session_unique
  on public.payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null and stripe_checkout_session_id <> '';
