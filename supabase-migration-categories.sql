-- =====================================================
-- RPG Todo - Categories Migration
-- =====================================================
-- This migration adds support for reusable categories
-- with many-to-many relationship to tasks
-- =====================================================

-- =====================================================
-- STEP 1: CREATE CATEGORIES TABLE
-- =====================================================

-- Categories table (user-specific reusable categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280', -- Hex color code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category_name CHECK (length(name) >= 1),
  UNIQUE(user_id, name) -- Prevent duplicate category names per user
);

-- Task-Categories junction table (many-to-many)
CREATE TABLE task_categories (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, category_id)
);

-- =====================================================
-- STEP 2: MIGRATE EXISTING DATA
-- =====================================================

-- Migrate existing category strings to new categories table
-- This will create category records for each unique category per user
INSERT INTO categories (user_id, name)
SELECT DISTINCT t.user_id, t.category
FROM tasks t
WHERE t.category IS NOT NULL AND t.category != '';

-- Create task_categories relationships for existing tasks
INSERT INTO task_categories (task_id, category_id)
SELECT t.id, c.id
FROM tasks t
INNER JOIN categories c ON c.user_id = t.user_id AND c.name = t.category
WHERE t.category IS NOT NULL AND t.category != '';

-- =====================================================
-- STEP 3: UPDATE TASKS TABLE
-- =====================================================

-- We'll keep the category column for now as deprecated
-- but add a comment for future reference
COMMENT ON COLUMN tasks.category IS 'DEPRECATED: Use task_categories junction table instead. Kept for backward compatibility.';

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_task_categories_task_id ON task_categories(task_id);
CREATE INDEX idx_task_categories_category_id ON task_categories(category_id);

-- =====================================================
-- STEP 5: CREATE TRIGGERS
-- =====================================================

-- Updated_at trigger for categories
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Task-Categories policies (linked to tasks)
CREATE POLICY "Users can view task categories for own tasks"
  ON task_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can add categories to own tasks"
  ON task_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove categories from own tasks"
  ON task_categories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid()
  ));

-- =====================================================
-- STEP 7: HELPER FUNCTIONS
-- =====================================================

-- Function to get or create a category
CREATE OR REPLACE FUNCTION get_or_create_category(
  p_user_id UUID,
  p_category_name VARCHAR(50),
  p_color VARCHAR(7) DEFAULT '#6B7280'
)
RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Try to find existing category
  SELECT id INTO v_category_id
  FROM categories
  WHERE user_id = p_user_id AND name = p_category_name;
  
  -- Create if doesn't exist
  IF v_category_id IS NULL THEN
    INSERT INTO categories (user_id, name, color)
    VALUES (p_user_id, p_category_name, p_color)
    RETURNING id INTO v_category_id;
  END IF;
  
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE categories IS 'User-specific reusable categories for organizing tasks';
COMMENT ON TABLE task_categories IS 'Junction table for many-to-many relationship between tasks and categories';
COMMENT ON FUNCTION get_or_create_category IS 'Helper function to get existing category or create new one';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

