-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feature', 'bug_fix', 'enhancement', 'integration', 'ui_ux', 'performance', 'security', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'planned', 'in_progress', 'completed', 'rejected', 'duplicate')),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  company TEXT,
  use_case TEXT,
  expected_impact TEXT,
  technical_details TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  estimated_timeline TEXT,
  actual_completion_date TIMESTAMPTZ,
  duplicate_of UUID REFERENCES feature_requests(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create feature_request_upvotes table for tracking upvotes
CREATE TABLE IF NOT EXISTS feature_request_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_request_id, user_email)
);

-- Create feature_request_comments table for discussion
CREATE TABLE IF NOT EXISTS feature_request_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_upvotes ON feature_requests(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_request_upvotes_request_id ON feature_request_upvotes(feature_request_id);
CREATE INDEX IF NOT EXISTS idx_feature_request_comments_request_id ON feature_request_comments(feature_request_id);

-- Enable RLS (Row Level Security)
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_request_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_request_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_requests
-- Everyone can view approved/pending feature requests
CREATE POLICY "Feature requests are viewable by everyone" ON feature_requests
  FOR SELECT USING (
    status IN ('pending', 'under_review', 'planned', 'in_progress', 'completed')
  );

-- Only admins can view all statuses including rejected
CREATE POLICY "Admins can view all feature requests" ON feature_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Everyone can insert feature requests
CREATE POLICY "Everyone can create feature requests" ON feature_requests
  FOR INSERT WITH CHECK (true);

-- Only admins can update feature requests
CREATE POLICY "Admins can update feature requests" ON feature_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete feature requests
CREATE POLICY "Admins can delete feature requests" ON feature_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- RLS Policies for feature_request_upvotes
-- Everyone can view upvotes
CREATE POLICY "Upvotes are viewable by everyone" ON feature_request_upvotes
  FOR SELECT USING (true);

-- Everyone can insert upvotes
CREATE POLICY "Everyone can create upvotes" ON feature_request_upvotes
  FOR INSERT WITH CHECK (true);

-- Users can only delete their own upvotes
CREATE POLICY "Users can delete their own upvotes" ON feature_request_upvotes
  FOR DELETE USING (user_email = current_setting('app.current_user_email', true));

-- RLS Policies for feature_request_comments
-- Everyone can view non-internal comments
CREATE POLICY "Non-internal comments are viewable by everyone" ON feature_request_comments
  FOR SELECT USING (is_internal = false);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments" ON feature_request_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Everyone can insert non-internal comments
CREATE POLICY "Everyone can create non-internal comments" ON feature_request_comments
  FOR INSERT WITH CHECK (is_internal = false);

-- Admins can insert internal comments
CREATE POLICY "Admins can create internal comments" ON feature_request_comments
  FOR INSERT WITH CHECK (
    is_internal = true AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON feature_request_comments
  FOR UPDATE USING (author_email = current_setting('app.current_user_email', true));

-- Admins can update any comment
CREATE POLICY "Admins can update any comment" ON feature_request_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON feature_request_comments
  FOR DELETE USING (author_email = current_setting('app.current_user_email', true));

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" ON feature_request_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_requests_updated_at 
  BEFORE UPDATE ON feature_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_request_comments_updated_at 
  BEFORE UPDATE ON feature_request_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_feature_request_views(request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE feature_requests 
  SET views = views + 1 
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to toggle upvote
CREATE OR REPLACE FUNCTION toggle_feature_request_upvote(request_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS TABLE(upvoted BOOLEAN, total_upvotes INTEGER) AS $$
DECLARE
  existing_upvote_id UUID;
BEGIN
  -- Check if user already upvoted
  SELECT id INTO existing_upvote_id
  FROM feature_request_upvotes
  WHERE feature_request_id = request_id AND user_email = user_email;
  
  IF existing_upvote_id IS NOT NULL THEN
    -- Remove upvote
    DELETE FROM feature_request_upvotes WHERE id = existing_upvote_id;
    
    -- Update upvote count
    UPDATE feature_requests 
    SET upvotes = upvotes - 1 
    WHERE id = request_id;
    
    RETURN QUERY SELECT false, (SELECT upvotes FROM feature_requests WHERE id = request_id);
  ELSE
    -- Add upvote
    INSERT INTO feature_request_upvotes (feature_request_id, user_email, user_name)
    VALUES (request_id, user_email, user_name);
    
    -- Update upvote count
    UPDATE feature_requests 
    SET upvotes = upvotes + 1 
    WHERE id = request_id;
    
    RETURN QUERY SELECT true, (SELECT upvotes FROM feature_requests WHERE id = request_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
