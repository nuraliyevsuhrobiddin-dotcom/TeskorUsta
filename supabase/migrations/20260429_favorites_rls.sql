begin;

select pg_advisory_xact_lock(hashtext('tezkorusta_favorites_rls_v1'));

create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'favorites_user_id_listing_id_key'
  ) then
    alter table public.favorites
      add constraint favorites_user_id_listing_id_key unique (user_id, listing_id);
  end if;
end
$$;

create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_listing_id on public.favorites(listing_id);

alter table public.favorites enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can view their favorites'
  ) then
    create policy "Users can view their favorites"
      on public.favorites
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can insert favorites'
  ) then
    create policy "Users can insert favorites"
      on public.favorites
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can delete favorites'
  ) then
    create policy "Users can delete favorites"
      on public.favorites
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;

commit;
