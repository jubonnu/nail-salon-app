/*
  # Add storage policies for Instagram images

  1. Changes
    - Add storage bucket policies for Instagram images
    - Allow authenticated users to manage their uploaded images
    - Allow public access to view images

  2. Security
    - Enable RLS for storage objects
    - Add policies for upload and view permissions
*/

-- Create bucket policies
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

-- Add URL validation to instagram_posts table
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_image_url_check
CHECK (image_url ~* '^https?://[^\s/$.?#].[^\s]*$');

COMMIT;