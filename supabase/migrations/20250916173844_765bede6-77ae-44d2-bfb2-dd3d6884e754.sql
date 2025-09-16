-- Update can_user_export function to always return TRUE (unlimited exports for everyone)
CREATE OR REPLACE FUNCTION public.can_user_export(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Always return TRUE - everyone gets unlimited exports now
  RETURN TRUE;
END;
$function$;