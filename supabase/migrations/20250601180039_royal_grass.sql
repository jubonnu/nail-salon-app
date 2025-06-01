/*
  # Add storage bucket for Instagram post images

  1. Changes
    - Create a new storage bucket for Instagram post images
    - Set up public access policy for the bucket
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "extensions";

-- Create a new bucket for Instagram post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram', 'instagram', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram');

-- Allow public access to images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'instagram');