-- frontend/src/sql/tv-migrations.sql
-- Southern Power Network TV - Supabase Table Migrations
-- Run this in your Supabase SQL Editor

-- ============================================
-- TV VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tv_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_slug VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  video_url TEXT,
  hls_url TEXT,
  thumb_url TEXT,
  creator_id UUID REFERENCES auth.users(id),
  creator_name VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  is_live BOOLEAN DEFAULT FALSE,
  duration INTEGER, -- in seconds
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  quality VARCHAR(20) DEFAULT 'hd', -- sd, hd, 4k
  year INTEGER,
  rating DECIMAL(2,1),
  channel_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tv_videos_station ON tv_videos(station_slug);
CREATE INDEX IF NOT EXISTS idx_tv_videos_created ON tv_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tv_videos_live ON tv_videos(is_live) WHERE is_live = TRUE;
CREATE INDEX IF NOT EXISTS idx_tv_videos_tags ON tv_videos USING GIN(tags);

-- Enable RLS
ALTER TABLE tv_videos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view all videos" ON tv_videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert videos" ON tv_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their own videos" ON tv_videos
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own videos" ON tv_videos
  FOR DELETE USING (auth.uid() = creator_id);

-- ============================================
-- TV SCHEDULE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tv_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_slug VARCHAR(100) NOT NULL,
  show_title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_recurring BOOLEAN DEFAULT TRUE,
  video_id UUID REFERENCES tv_videos(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tv_schedule_station ON tv_schedule(station_slug);
CREATE INDEX IF NOT EXISTS idx_tv_schedule_day ON tv_schedule(day_of_week);

-- Enable RLS
ALTER TABLE tv_schedule ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view schedules" ON tv_schedule
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage schedules" ON tv_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- ============================================
-- TV VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tv_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_slug VARCHAR(100) NOT NULL,
  video_id UUID NOT NULL REFERENCES tv_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vote_value INTEGER NOT NULL DEFAULT 1 CHECK (vote_value >= -1 AND vote_value <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(station_slug, video_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tv_votes_video ON tv_votes(video_id);
CREATE INDEX IF NOT EXISTS idx_tv_votes_user ON tv_votes(user_id);

-- Enable RLS
ALTER TABLE tv_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all votes" ON tv_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON tv_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON tv_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON tv_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in Supabase Dashboard > Storage or via API

-- tv_uploads bucket (for video files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tv_uploads', 'tv_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- tv_thumbs bucket (for thumbnails)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tv_thumbs', 'tv_thumbs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access for tv_uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'tv_uploads');

CREATE POLICY "Authenticated users can upload to tv_uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tv_uploads'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Public read access for tv_thumbs"
ON storage.objects FOR SELECT
USING (bucket_id = 'tv_thumbs');

CREATE POLICY "Authenticated users can upload to tv_thumbs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tv_thumbs'
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample schedule for No Limit East Houston TV
INSERT INTO tv_schedule (station_slug, show_title, description, start_time, end_time, day_of_week) VALUES
  ('nolimit', 'Morning Mix', 'Wake up with the hottest videos', '06:00', '10:00', 1),
  ('nolimit', 'Houston Spotlight', 'Local artists showcase', '10:00', '12:00', 1),
  ('nolimit', 'Lunch Break Bangers', 'Midday hits', '12:00', '14:00', 1),
  ('nolimit', 'New Music Friday', 'Fresh releases', '14:00', '18:00', 5),
  ('nolimit', 'Friday Night Freestyles', 'Live performances', '21:00', '23:00', 5);

-- Sample schedule for Civic Connect TV
INSERT INTO tv_schedule (station_slug, show_title, description, start_time, end_time, day_of_week) VALUES
  ('civic-connect', 'Morning News', 'Local news update', '07:00', '09:00', 1),
  ('civic-connect', 'Community Spotlight', 'Local stories', '09:00', '10:00', 1),
  ('civic-connect', 'Town Hall Live', 'Community discussions', '19:00', '21:00', 4);

-- Sample schedule for Texas Got Talent
INSERT INTO tv_schedule (station_slug, show_title, description, start_time, end_time, day_of_week) VALUES
  ('texas-got-talent', 'Audition Hour', 'Watch auditions', '18:00', '19:00', 6),
  ('texas-got-talent', 'Live Show', 'Vote for your favorites', '20:00', '22:00', 6);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tv_videos_updated_at
  BEFORE UPDATE ON tv_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment view count function
CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE tv_videos
  SET views = views + 1
  WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get vote count for video
CREATE OR REPLACE FUNCTION get_video_vote_count(video_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(vote_value), 0) INTO total
  FROM tv_votes
  WHERE video_id = video_uuid;
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

