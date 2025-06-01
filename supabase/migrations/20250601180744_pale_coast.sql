/*
  # Set up Instagram storage bucket and policies

  1. Storage Setup
    - Creates Instagram storage bucket if it doesn't exist
    - Makes the bucket public for read access
  
  2. Access Policies
    - Allows authenticated users to upload files
    - Allows public access to read files
*/

-- Create Instagram bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'instagram'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('instagram', 'instagram', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

-- Create upload policy for authenticated users
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram');

-- Create download policy for public access
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'instagram');