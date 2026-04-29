begin;

select pg_advisory_xact_lock(hashtext('tezkorusta_listing_multi_images_v1'));

-- Add multi-image support while preserving the old single-image column.
alter table public.listings
  add column if not exists images text[] not null default '{}'::text[];

-- Backfill existing rows so current image_url values continue to work in the new gallery flow.
update public.listings
set images = array[image_url]
where coalesce(array_length(images, 1), 0) = 0
  and image_url is not null
  and btrim(image_url) <> '';

-- Ensure the storage bucket exists for listing image uploads.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update
set public = excluded.public;

-- Public read access for listing images.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view listing images'
  ) then
    create policy "Public can view listing images"
      on storage.objects
      for select
      using (bucket_id = 'listing-images');
  end if;
end
$$;

-- Admin-only write/delete access for listing images.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can manage listing images'
  ) then
    create policy "Admins can manage listing images"
      on storage.objects
      for all
      using (
        bucket_id = 'listing-images'
        and exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      )
      with check (
        bucket_id = 'listing-images'
        and exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;
end
$$;

commit;
