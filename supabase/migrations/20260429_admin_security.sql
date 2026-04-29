begin;

-- Lock this migration key for the duration of the transaction so the role
-- rewrite cannot run concurrently in multiple deployment workers.
select pg_advisory_xact_lock(hashtext('tezkorusta_admin_security_20260429'));

-- Ensure the backup table exists so the migration remains reversible and
-- role changes can be audited later if needed.
create table if not exists public._role_migration_backup (
  migration_name text not null,
  profile_id uuid not null,
  email text,
  previous_role text not null,
  backed_up_at timestamptz not null default timezone('utc'::text, now()),
  primary key (migration_name, profile_id)
);

-- Snapshot current roles once before any changes. Re-running the migration
-- will not overwrite the original snapshot because of the primary key.
insert into public._role_migration_backup (
  migration_name,
  profile_id,
  email,
  previous_role
)
select
  '20260429_admin_security',
  p.id,
  p.email,
  p.role
from public.profiles p
on conflict (migration_name, profile_id) do nothing;

-- Fail safely if the intended admin account does not exist yet. This avoids
-- accidentally removing all admin access in production.
do $$
declare
  target_admin_id uuid;
begin
  select p.id
  into target_admin_id
  from public.profiles p
  where lower(p.email) = lower('nuraliyevsuhrobiddin@gmail.com')
  limit 1;

  if target_admin_id is null then
    raise exception
      'Admin profile not found for email %',
      'nuraliyevsuhrobiddin@gmail.com';
  end if;
end
$$;

-- Update only the trigger function body. The existing auth trigger keeps
-- pointing to the same function, so trigger wiring is not broken.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

-- Enforce a single production admin by email. Everyone else becomes a normal
-- user. Policies are not recreated here; existing role-based RLS continues
-- to work against the updated profile rows.
update public.profiles
set role = case
  when lower(email) = lower('nuraliyevsuhrobiddin@gmail.com') then 'admin'
  else 'user'
end
where role is distinct from case
  when lower(email) = lower('nuraliyevsuhrobiddin@gmail.com') then 'admin'
  else 'user'
end;

commit;
