begin;

create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  category text,
  district text,
  description text,
  phone text,
  image_url text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'assigned', 'done')),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_created_at on public.jobs(created_at desc);

insert into storage.buckets (id, name, public)
values ('job-images', 'job-images', true)
on conflict do nothing;

alter table public.jobs enable row level security;

drop policy if exists "Public can create jobs" on public.jobs;
create policy "Public can create jobs"
  on public.jobs for insert
  with check (true);

drop policy if exists "Admins can manage jobs" on public.jobs;
create policy "Admins can manage jobs"
  on public.jobs for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can view job images" on storage.objects;
create policy "Public can view job images"
  on storage.objects for select
  using (bucket_id = 'job-images');

drop policy if exists "Public can upload job images" on storage.objects;
create policy "Public can upload job images"
  on storage.objects for insert
  with check (bucket_id = 'job-images');

drop policy if exists "Admins can manage job images" on storage.objects;
create policy "Admins can manage job images"
  on storage.objects for all
  using (bucket_id = 'job-images' and public.is_admin())
  with check (bucket_id = 'job-images' and public.is_admin());

commit;
