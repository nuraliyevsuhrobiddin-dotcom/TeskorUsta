begin;

alter table public.profiles
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists avatar_url text;

commit;
