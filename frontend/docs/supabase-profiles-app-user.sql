-- Link API users (Mongo/ObjectId) to profiles + station_slug for "View Station"
-- Run after supabase-standard-schema.sql

alter table public.profiles
  add column if not exists app_user_id text;

create unique index if not exists profiles_app_user_id_uidx
  on public.profiles (app_user_id)
  where app_user_id is not null;

comment on column public.profiles.app_user_id is 'PowerStream API user id (e.g. Mongo _id) when not using Supabase Auth uuid as id';
