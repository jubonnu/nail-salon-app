/*
  # Set up Instagram storage bucket and policies

  1. Changes
    - Creates Instagram storage bucket if it doesn't exist
    - Sets up upload policy for authenticated users
    - Sets up download policy for public access

  2. Security
    - Only authenticated users can upload
    - Anyone can download/view images
*/

DO $$
BEGIN
  -- Only create bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'instagram'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('instagram', 'instagram', true);
  END IF;
END $$;

-- Set up storage policy to allow authenticated uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow authenticated uploads' 
    AND table_name = 'objects'
  ) THEN
    CREATE POLICY "Allow authenticated uploads"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'instagram');
  END IF;
END $$;

-- Set up storage policy to allow public downloads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow public downloads' 
    AND table_name = 'objects'
  ) THEN
    CREATE POLICY "Allow public downloads"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'instagram');
  END IF;
END $$;