-- ============================================
-- PINETRACE DATABASE SCHEMA
-- Database: Supabase PostgreSQL
-- Purpose: Ứng dụng theo dõi lộ trình chạy bộ tại Đà Lạt
-- ============================================

-- ============================================
-- 1. Tạo bảng PROFILES (Hồ sơ người dùng)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_athlete_id BIGINT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- 2. Tạo bảng ACTIVITIES (Hoạt động chạy bộ)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strava_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  distance FLOAT NOT NULL,  -- in meters
  moving_time INTEGER NOT NULL,  -- in seconds
  type TEXT NOT NULL DEFAULT 'Run',  -- e.g., 'Run'
  start_time TIMESTAMP NOT NULL,
  summary_polyline TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, strava_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities(start_time);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities
CREATE POLICY "Users can view their own activities" 
  ON activities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
  ON activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
  ON activities FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. DỮ LIỆU MẪU - SAMPLE DATA
-- ============================================

-- Sample Profiles (Hồ sơ mẫu)
-- Lưu ý: Thay UUID thực tế từ auth.users khi sử dụng
INSERT INTO profiles (id, email, strava_access_token, strava_refresh_token, strava_athlete_id)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'runner1@example.com', 'token_sample_1', 'refresh_token_1', 123456789),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'runner2@example.com', 'token_sample_2', 'refresh_token_2', 987654321)
ON CONFLICT (id) DO NOTHING;

-- Sample Activities (Hoạt động mẫu)
INSERT INTO activities (user_id, strava_id, name, distance, moving_time, type, start_time, summary_polyline)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 111111111, 'Morning Run at Dalat', 5000.0, 1800, 'Run', '2024-05-20 06:00:00', 'u{~vFnytbGxb@...'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 111111112, 'Evening Jog', 3500.0, 1260, 'Run', '2024-05-20 18:30:00', 'u{~vFnytbGh^...'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 111111113, 'Trail Run - Thien Vien', 8000.0, 2880, 'Run', '2024-05-21 07:00:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 111111114, 'City Loop Run', 10000.0, 3600, 'Run', '2024-05-22 17:00:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 111111115, 'Lake Circuit', 6500.0, 2340, 'Run', '2024-05-23 06:30:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 222222221, 'Parkrun Dalat', 5000.0, 1800, 'Run', '2024-05-19 07:00:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 222222222, 'Sunrise Run', 7500.0, 2700, 'Run', '2024-05-20 05:30:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 222222223, 'Evening Trail', 9000.0, 3240, 'Run', '2024-05-21 18:00:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 222222224, 'Speed Workout', 4000.0, 1200, 'Run', '2024-05-22 06:00:00', 'u{~vFnytbG...'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 222222225, 'Long Distance', 15000.0, 5400, 'Run', '2024-05-23 07:00:00', 'u{~vFnytbG...')
ON CONFLICT (strava_id) DO NOTHING;

-- ============================================
-- HOÀN THÀNH SETUP
-- ============================================
-- Kiểm tra tables đã tạo
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
