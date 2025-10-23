-- =====================================================
-- RPG Todo - Supabase Database Schema
-- =====================================================
-- Architecture: Ledger-based XP system with achievement join tables
-- Version: 1.0
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (simplified - XP calculated from points_ledger)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_username CHECK (length(username) >= 3)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'completed', 'archived')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  xp_value INTEGER NOT NULL CHECK (xp_value >= 0),
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_title CHECK (length(title) >= 1)
);

-- Achievements table (master list of all achievements)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_name VARCHAR(100) UNIQUE NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_type VARCHAR(50) NOT NULL CHECK (achievement_type IN ('task_milestone', 'level_milestone', 'special')),
  requirement_value INTEGER, -- e.g., 10 for "Complete 10 tasks", 5 for "Reach level 5"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement_user join table (tracks which users have unlocked which achievements)
CREATE TABLE achievement_user (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Custom labels table (linked to tasks, not users)
CREATE TABLE custom_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, label_name),
  CONSTRAINT valid_label_name CHECK (length(label_name) >= 1)
);

-- Points ledger table (immutable log of all XP transactions)
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  xp_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_description CHECK (length(description) >= 1)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tasks indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user_status_due ON tasks(user_id, status, due_date);

-- Achievement_user indexes
CREATE INDEX idx_achievement_user_user_id ON achievement_user(user_id);
CREATE INDEX idx_achievement_user_achievement_id ON achievement_user(achievement_id);

-- Custom labels indexes
CREATE INDEX idx_custom_labels_task_id ON custom_labels(task_id);

-- Points ledger indexes
CREATE INDEX idx_points_ledger_user_id ON points_ledger(user_id);
CREATE INDEX idx_points_ledger_task_id ON points_ledger(task_id);
CREATE INDEX idx_points_ledger_created_at ON points_ledger(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_user_updated_at BEFORE UPDATE ON achievement_user
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_labels_updated_at BEFORE UPDATE ON custom_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_ledger_updated_at BEFORE UPDATE ON points_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to get user's total XP (sum from points_ledger)
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(xp_value), 0)::INTEGER 
  FROM points_ledger 
  WHERE user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 1;
  thresholds INTEGER[] := ARRAY[
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 14500,
    18500, 23000, 28000, 33500, 39500, 46000, 53000, 60500, 68500,
    77000, 86000, 95500, 105500, 116000, 127000, 138500, 150500, 163000, 176000,
    189500, 203500, 218000, 233000, 248500, 264500, 281000, 298000, 315500, 333500,
    352000, 371000, 390500, 410500, 431000, 452000, 473500, 495500, 518000, 541000,
    564500, 588500, 613000, 638000, 663500, 689500, 716000, 743000, 770500, 798500,
    827000, 856000, 885500, 915500, 946000, 977000, 1008500, 1040500, 1073000, 1106000,
    1139500, 1173500, 1208000, 1243000, 1278500, 1314500, 1351000, 1388000, 1425500, 1463500,
    1502000, 1541000, 1580500, 1620500, 1661000, 1702000, 1743500, 1785500, 1828000, 1871000,
    1914500, 1958500, 2003000, 2048000, 2093500, 2139500, 2186000, 2233000, 2280500, 2328500
  ];
BEGIN
  FOR i IN REVERSE array_upper(thresholds, 1)..1 LOOP
    IF xp >= thresholds[i] THEN
      RETURN i;
    END IF;
  END LOOP;
  RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Function to get completed task count for achievements
CREATE OR REPLACE FUNCTION get_completed_task_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM tasks 
  WHERE user_id = p_user_id AND status = 'completed';
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get urgent tasks for the current week
CREATE OR REPLACE FUNCTION get_urgent_tasks_this_week(p_user_id UUID)
RETURNS SETOF tasks AS $$
  SELECT * FROM tasks
  WHERE user_id = p_user_id
    AND priority = 'Urgent'
    AND status = 'open'
    AND due_date >= date_trunc('week', NOW())
    AND due_date < date_trunc('week', NOW()) + INTERVAL '1 week';
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to award XP and update level
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_xp_value INTEGER,
  p_description TEXT,
  p_task_id UUID DEFAULT NULL
)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current level
  SELECT level INTO v_old_level FROM users WHERE id = p_user_id;
  
  -- Create ledger entry
  INSERT INTO points_ledger (user_id, task_id, description, xp_value)
  VALUES (p_user_id, p_task_id, p_description, p_xp_value);
  
  -- Calculate new total XP
  v_new_total_xp := get_user_total_xp(p_user_id);
  
  -- Calculate new level
  v_new_level := calculate_level_from_xp(v_new_total_xp);
  
  -- Update user level if changed
  IF v_new_level != v_old_level THEN
    UPDATE users SET level = v_new_level, updated_at = NOW() WHERE id = p_user_id;
  END IF;
  
  RETURN QUERY SELECT v_new_total_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Achievements policies (public read for achievement definitions)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- Achievement_user policies
CREATE POLICY "Users can view own unlocked achievements"
  ON achievement_user FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock own achievements"
  ON achievement_user FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Custom labels policies (linked to tasks)
CREATE POLICY "Users can view labels on own tasks"
  ON custom_labels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = custom_labels.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can add labels to own tasks"
  ON custom_labels FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = custom_labels.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update labels on own tasks"
  ON custom_labels FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = custom_labels.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete labels from own tasks"
  ON custom_labels FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = custom_labels.task_id AND tasks.user_id = auth.uid()
  ));

-- Points ledger policies
CREATE POLICY "Users can view own XP transactions"
  ON points_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own XP transactions"
  ON points_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SEED DATA - ACHIEVEMENTS
-- =====================================================

-- Task Completion Achievements
INSERT INTO achievements (achievement_name, achievement_description, achievement_type, requirement_value)
VALUES
  ('Novice', 'Complete 10 tasks', 'task_milestone', 10),
  ('Apprentice', 'Complete 25 tasks', 'task_milestone', 25),
  ('Taskmaster', 'Complete 50 tasks', 'task_milestone', 50),
  ('Grandmaster', 'Complete 100 tasks', 'task_milestone', 100);

-- Level Achievements
INSERT INTO achievements (achievement_name, achievement_description, achievement_type, requirement_value)
VALUES
  ('Journeyman', 'Reach level 5', 'level_milestone', 5),
  ('Expert', 'Reach level 10', 'level_milestone', 10),
  ('Master', 'Reach level 15', 'level_milestone', 15),
  ('Legend', 'Reach level 20', 'level_milestone', 20);

-- Special Achievements
INSERT INTO achievements (achievement_name, achievement_description, achievement_type, requirement_value)
VALUES
  ('Efficiency Master', 'Complete all urgent tasks within one week', 'special', NULL);

-- =====================================================
-- HELPER VIEWS (Optional - for easier querying)
-- =====================================================

-- View to get user stats with calculated values
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.level,
  u.created_at,
  get_user_total_xp(u.id) AS total_xp,
  get_completed_task_count(u.id) AS completed_task_count,
  (SELECT COUNT(*) FROM achievement_user WHERE user_id = u.id) AS total_achievements
FROM users u;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user table - XP calculated dynamically from points_ledger';
COMMENT ON TABLE tasks IS 'User tasks with RPG XP values based on priority';
COMMENT ON TABLE achievements IS 'Master list of all available achievements';
COMMENT ON TABLE achievement_user IS 'Join table tracking which users have unlocked which achievements';
COMMENT ON TABLE custom_labels IS 'Labels linked to tasks - multiple labels per task supported';
COMMENT ON TABLE points_ledger IS 'Immutable transaction log for all XP awards - provides complete audit trail';

COMMENT ON FUNCTION get_user_total_xp IS 'Calculate user total XP from points_ledger sum';
COMMENT ON FUNCTION calculate_level_from_xp IS 'Calculate level based on XP thresholds (1-100)';
COMMENT ON FUNCTION get_completed_task_count IS 'Count completed tasks for achievement tracking';
COMMENT ON FUNCTION award_xp IS 'Award XP, create ledger entry, calculate and update level if changed';
COMMENT ON FUNCTION get_urgent_tasks_this_week IS 'Get urgent tasks for current week (for Efficiency Master achievement)';

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

