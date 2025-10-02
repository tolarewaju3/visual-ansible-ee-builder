-- Drop existing policies to recreate them with explicit authentication checks
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies with explicit authentication requirements
-- This ensures that even if auth.uid() somehow returns a value, the user must be in the authenticated role
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL
TO anon
USING (false);

-- Add a comment documenting the security model
COMMENT ON TABLE public.profiles IS 'User profiles table. Contains PII including email addresses. Access is restricted to authenticated users only, with each user able to access only their own profile data. Anonymous access is explicitly denied.';