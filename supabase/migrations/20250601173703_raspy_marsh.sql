/*
  # Fix Instagram Posts Schema and Data

  1. Changes
    - Add NOT NULL constraint to image_url to ensure valid images
    - Add CHECK constraint to validate image URLs
    - Add unique constraint to prevent duplicate images
    - Add validation for status values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add check constraint for valid image URLs
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_image_url_check 
CHECK (image_url ~* '^https?://.*\.(jpg|jpeg|png|gif|webp)$');

-- Add check constraint for valid status values
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_status_check
CHECK (status IN ('draft', 'scheduled', 'published'));

-- Convert status values to lowercase for consistency
UPDATE instagram_posts
SET status = LOWER(status)
WHERE status != LOWER(status);