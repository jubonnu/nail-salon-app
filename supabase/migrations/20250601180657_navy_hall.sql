/*
  # Create Instagram Storage Bucket

  1. New Storage Bucket
    - Creates a new public bucket named 'instagram' for storing Instagram post images
    - Enables public access to the bucket
*/

-- Create a new public bucket for Instagram images
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram', 'instagram', true);

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram');

-- Set up storage policy to allow public downloads
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'instagram');