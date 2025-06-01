/*
  # Fix Instagram storage setup

  1. Changes
    - Create Instagram storage bucket if it doesn't exist
    - Drop existing policies to avoid conflicts
    - Recreate storage policies with unique names
    
  2. Security
    - Maintain public access to bucket
    - Allow authenticated users to manage their uploads
    - Restrict uploads to image files only
*/

-- Create the instagram storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'instagram'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('instagram', 'instagram', true);
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Create new policies with unique names
CREATE POLICY "Instagram users can upload images 20250601"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'instagram' AND
  (storage.extension(name) = 'jpg' OR
   storage.extension(name) = 'jpeg' OR
   storage.extension(name) = 'png' OR
   storage.extension(name) = 'gif')
);

CREATE POLICY "Instagram users can update images 20250601"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'instagram')
WITH CHECK (bucket_id = 'instagram');

CREATE POLICY "Instagram users can delete images 20250601"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'instagram');

CREATE POLICY "Public read access for instagram 20250601"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'instagram');