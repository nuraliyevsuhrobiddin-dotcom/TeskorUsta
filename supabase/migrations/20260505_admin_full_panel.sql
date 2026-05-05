begin;

create extension if not exists "uuid-ossp";

alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'blocked')),
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.reviews
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.listings
  add column if not exists vip_until date,
  add column if not exists vip_priority integer not null default 0;

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  site_name text not null default 'TezkorUsta',
  main_language text not null default 'uz' check (main_language in ('uz', 'ru')),
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  support_phone text not null default '+998 99 777 70 31',
  telegram_url text not null default 'https://t.me/tezkorusta_admin',
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.site_settings (id) values (true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create table if not exists public.crm_leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  source text not null default 'manual',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost')),
  note text,
  listing_id uuid references public.listings(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  next_follow_up date,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_crm_leads_status on public.crm_leads(status);
create index if not exists idx_crm_leads_created_at on public.crm_leads(created_at desc);
create index if not exists idx_listings_vip on public.listings(is_vip, vip_priority desc, vip_until);

drop trigger if exists update_profiles_modtime on public.profiles;
create trigger update_profiles_modtime
before update on public.profiles
for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_reviews_modtime on public.reviews;
create trigger update_reviews_modtime
before update on public.reviews
for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_site_settings_modtime on public.site_settings;
create trigger update_site_settings_modtime
before update on public.site_settings
for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_crm_leads_modtime on public.crm_leads;
create trigger update_crm_leads_modtime
before update on public.crm_leads
for each row execute procedure public.update_updated_at_column();

alter table public.site_settings enable row level security;
alter table public.crm_leads enable row level security;

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins have full access to listings" on public.listings;
create policy "Admins have full access to listings"
  on public.listings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all reviews" on public.reviews;
create policy "Admins can view all reviews"
  on public.reviews for select
  using (public.is_admin());

drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews"
  on public.reviews for delete
  using (public.is_admin());

drop policy if exists "Public can view settings" on public.site_settings;
create policy "Public can view settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Admins can manage settings" on public.site_settings;
create policy "Admins can manage settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage CRM leads" on public.crm_leads;
create policy "Admins can manage CRM leads"
  on public.crm_leads for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage listing images" on storage.objects;
create policy "Admins can manage listing images"
  on storage.objects for all
  using (bucket_id = 'listing-images' and public.is_admin())
  with check (bucket_id = 'listing-images' and public.is_admin());

commit;
