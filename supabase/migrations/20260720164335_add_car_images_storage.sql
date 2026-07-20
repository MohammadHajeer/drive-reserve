-- Create a public bucket for car images.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'car-images',
  'car-images',
  true,
  5242880, -- 5 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;

-- Admins can list and read objects through the Storage API.
create policy "Admins can view car images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'car-images'
  and (select private.is_admin())
);

-- Only admins can upload car images.
create policy "Admins can upload car images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'car-images'
  and (select private.is_admin())
);

-- Only admins can replace or move car images.
create policy "Admins can update car images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'car-images'
  and (select private.is_admin())
)
with check (
  bucket_id = 'car-images'
  and (select private.is_admin())
);

-- Only admins can delete car images.
create policy "Admins can delete car images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'car-images'
  and (select private.is_admin())
);