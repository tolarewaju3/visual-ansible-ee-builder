-- Add additional_build_steps column to user_presets table
ALTER TABLE public.user_presets
ADD COLUMN additional_build_steps jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.user_presets.additional_build_steps IS 'Stores additional build steps for the preset configuration';