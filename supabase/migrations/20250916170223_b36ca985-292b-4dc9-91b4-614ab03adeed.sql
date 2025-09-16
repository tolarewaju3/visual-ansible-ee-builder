-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');

-- Add subscription_plan column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan public.subscription_plan NOT NULL DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT;

-- Create user_subscriptions table to track Stripe subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'pro',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stripe_subscription_id)
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Create daily_exports table to track usage
CREATE TABLE public.daily_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_date DATE NOT NULL DEFAULT CURRENT_DATE,
  export_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, export_date)
);

-- Enable RLS on daily_exports
ALTER TABLE public.daily_exports ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_exports
CREATE POLICY "Users can view their own export counts" 
ON public.daily_exports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export records" 
ON public.daily_exports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own export counts" 
ON public.daily_exports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on daily_exports
CREATE TRIGGER update_daily_exports_updated_at
BEFORE UPDATE ON public.daily_exports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get or create daily export record
CREATE OR REPLACE FUNCTION public.get_or_create_daily_exports(user_uuid UUID)
RETURNS public.daily_exports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  export_record public.daily_exports;
BEGIN
  -- Try to get existing record for today
  SELECT * INTO export_record
  FROM public.daily_exports
  WHERE user_id = user_uuid AND export_date = CURRENT_DATE;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.daily_exports (user_id, export_date, export_count)
    VALUES (user_uuid, CURRENT_DATE, 0)
    RETURNING * INTO export_record;
  END IF;
  
  RETURN export_record;
END;
$$;

-- Create function to increment export count
CREATE OR REPLACE FUNCTION public.increment_export_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Get or create today's export record
  PERFORM public.get_or_create_daily_exports(user_uuid);
  
  -- Increment the count
  UPDATE public.daily_exports
  SET export_count = export_count + 1,
      updated_at = now()
  WHERE user_id = user_uuid AND export_date = CURRENT_DATE
  RETURNING export_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Create function to check if user can export (for free users)
CREATE OR REPLACE FUNCTION public.can_user_export(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan public.subscription_plan;
  today_exports INTEGER;
BEGIN
  -- Get user's subscription plan
  SELECT subscription_plan INTO user_plan
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- Pro users can always export
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;
  
  -- For free users, check daily limit
  SELECT COALESCE(export_count, 0) INTO today_exports
  FROM public.daily_exports
  WHERE user_id = user_uuid AND export_date = CURRENT_DATE;
  
  -- Free users can export up to 3 times per day
  RETURN today_exports < 3;
END;
$$;