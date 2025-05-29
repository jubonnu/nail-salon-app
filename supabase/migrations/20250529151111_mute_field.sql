/*
  # Fix user registration policies

  1. Changes
    - Add policy to allow service role to create user profiles
    - Add policy to allow authenticated users to create their own profile
    - Add policy to allow service role to read user profiles

  2. Security
    - Maintain RLS while allowing necessary access for registration flow
*/

-- Allow service role to read user profiles
CREATE POLICY "Service role can read user profiles"
  ON public.users
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to create user profiles
CREATE POLICY "Service role can create user profiles"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can create own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);