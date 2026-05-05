begin;

create extension if not exists pgcrypto;

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  event_type text,
  path text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_app_events_event_type on public.app_events(event_type);
create index if not exists idx_app_events_created_at on public.app_events(created_at desc);
create index if not exists idx_app_events_user_id on public.app_events(user_id);

alter table public.app_events enable row level security;

drop policy if exists "Public can create app events" on public.app_events;
create policy "Public can create app events"
  on public.app_events for insert
  with check (true);

drop policy if exists "Admins can view app events" on public.app_events;
create policy "Admins can view app events"
  on public.app_events for select
  using (public.is_admin());

commit;
