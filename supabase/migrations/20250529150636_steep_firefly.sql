/*
  # Fix users table RLS policies

  1. Changes
    - Add RLS policy to allow authenticated users to insert their own profile
    - Add RLS policy to allow service role to insert user profiles during registration
  
  2. Security
    - Enable RLS on users table (already enabled)
    - Add policies for INSERT operations
    - Maintain existing policies for SELECT and UPDATE
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert user profiles during registration
CREATE POLICY "Service role can insert user profiles"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);