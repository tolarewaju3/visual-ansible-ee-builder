-- Create table for securely storing user credentials for cloud builds
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('redhat', 'registry')),
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, credential_type)
);

-- Enable RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own credentials
CREATE POLICY "Users can view own credentials"
  ON public.user_credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON public.user_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON public.user_credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
  ON public.user_credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing database functions to include explicit search_path
CREATE OR REPLACE FUNCTION public.increment_cloud_build_count(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO user_cloud_builds (user_id, builds_used)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    builds_used = user_cloud_builds.builds_used + 1,
    updated_at = NOW();
    
  SELECT builds_used INTO new_count
  FROM user_cloud_builds
  WHERE user_id = user_uuid;
  
  RETURN new_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_purchased_builds(user_uuid uuid, builds_to_add integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO user_cloud_builds (user_id, builds_purchased)
  VALUES (user_uuid, builds_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    builds_purchased = user_cloud_builds.builds_purchased + builds_to_add,
    updated_at = NOW();
    
  SELECT builds_purchased INTO new_count
  FROM user_cloud_builds
  WHERE user_id = user_uuid;
  
  RETURN new_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_export_count(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  -- Get or create today's export record
  PERFORM public.get_or_create_daily_exports(user_uuid);
  
  -- Increment the count
  UPDATE daily_exports
  SET export_count = export_count + 1,
      updated_at = now()
  WHERE user_id = user_uuid AND export_date = CURRENT_DATE
  RETURNING export_count INTO new_count;
  
  RETURN new_count;
END;
$function$;