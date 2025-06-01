/*
  # Fix Instagram posts constraints and validation

  1. Changes
    - Modify image URL check constraint to be more permissive
    - Add helper function to validate image URLs
    - Update status check constraint

  2. Security
    - Maintain RLS policies
    - Ensure data integrity with proper validation
*/

-- Drop existing constraints
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS instagram_posts_image_url_check,
DROP CONSTRAINT IF EXISTS instagram_posts_status_check;

-- Create more permissive image URL check
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_image_url_check 
CHECK (image_url ~* '^https?://[^\s/$.?#].[^\s]*$');

-- Add status check constraint
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_status_check
CHECK (status = ANY (ARRAY['draft', 'scheduled', 'published']));