-- Create user_cloud_builds table
CREATE TABLE user_cloud_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  builds_used INTEGER DEFAULT 0,
  builds_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RPC function to increment cloud build count
CREATE OR REPLACE FUNCTION increment_cloud_build_count(user_uuid UUID)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add purchased builds
CREATE OR REPLACE FUNCTION add_purchased_builds(user_uuid UUID, builds_to_add INTEGER)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment about free builds
COMMENT ON TABLE user_cloud_builds IS 'Tracks cloud build usage. Users get 5 free builds + purchased packs (10 each)';

-- Enable RLS
ALTER TABLE user_cloud_builds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cloud build data" ON user_cloud_builds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cloud build data" ON user_cloud_builds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cloud build data" ON user_cloud_builds
  FOR UPDATE USING (auth.uid() = user_id);
