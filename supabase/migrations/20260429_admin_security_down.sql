begin;

-- Lock the same migration key used by the forward migration so rollback
-- cannot overlap with any concurrent role/security deployment step.
select pg_advisory_xact_lock(hashtext('tezkorusta_admin_security_20260429'));

-- Restore the previous signup behavior by replacing only the function body.
-- The existing auth trigger remains attached to the same function name, so
-- rollback does not need to drop or recreate the trigger.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

-- Restore previous roles from the backup captured by the forward migration.
-- If the backup table or snapshot rows are missing, this update becomes a
-- no-op, which keeps the rollback safe to run in production.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = '_role_migration_backup'
  ) then
    update public.profiles p
    set
      role = b.previous_role,
      email = coalesce(b.email, p.email)
    from public._role_migration_backup b
    where b.migration_name = '20260429_admin_security'
      and b.profile_id = p.id;
  end if;
end
$$;

commit;
