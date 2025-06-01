/*
  # Create Instagram storage bucket and policies

  1. New Storage Bucket
    - Creates a new public bucket named 'instagram' for storing Instagram post images
  
  2. Security
    - Enables authenticated users to upload and manage images
    - Allows public read access to images
    - Restricts file types to images only
*/

-- Create the instagram storage bucket
insert into storage.buckets (id, name, public)
values ('instagram', 'instagram', true);

-- Policy to allow authenticated users to upload files
create policy "Authenticated users can upload images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'instagram' AND
  (storage.extension(name) = 'jpg' OR
   storage.extension(name) = 'jpeg' OR
   storage.extension(name) = 'png' OR
   storage.extension(name) = 'gif')
);

-- Policy to allow authenticated users to update their uploaded files
create policy "Authenticated users can update images"
on storage.objects for update to authenticated
using (bucket_id = 'instagram')
with check (bucket_id = 'instagram');

-- Policy to allow authenticated users to delete their uploaded files
create policy "Authenticated users can delete images"
on storage.objects for delete to authenticated
using (bucket_id = 'instagram');

-- Policy to allow public read access to all files
create policy "Public read access"
on storage.objects for select to public
using (bucket_id = 'instagram');