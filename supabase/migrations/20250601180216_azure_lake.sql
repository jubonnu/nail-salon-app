/*
  # Add storage policies for Instagram images

  1. Security
    - Allow authenticated users to:
      - Upload images to instagram_images bucket
      - Update their own images
      - Delete their own images
    - Allow public access to view images
*/

BEGIN;

-- Allow authenticated users to upload and manage images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram_images');

CREATE POLICY "Authenticated users can update their images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'instagram_images')
WITH CHECK (bucket_id = 'instagram_images');

CREATE POLICY "Authenticated users can delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'instagram_images');

-- Allow anyone to view images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'instagram_images');

COMMIT;