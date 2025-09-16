-- Fix security vulnerability: Restrict profiles table access to own profiles only
-- This replaces the overly permissive "Profiles are viewable by everyone" policy

-- First, drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure SELECT policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optional: If you need a way for users to view basic info about other users (without email),
-- you can create a separate view or function. For now, we're securing the table completely.