-- Migration: Add Labels System (Reusable Labels for Tasks)
-- This migration creates a new labels system similar to categories
-- Date: 2025-10-31

-- Step 1: Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280', -- Hex color code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_label_name CHECK (length(name) >= 1),
  UNIQUE(user_id, name) -- Prevent duplicate label names per user
);

-- Step 2: Create task_labels junction table (many-to-many)
CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

-- Step 3: Migrate existing custom_labels data to new labels table
-- First, create unique labels from existing custom_labels
INSERT INTO labels (user_id, name)
SELECT DISTINCT t.user_id, cl.label_name
FROM custom_labels cl
INNER JOIN tasks t ON t.id = cl.task_id
WHERE cl.label_name IS NOT NULL AND cl.label_name != ''
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 4: Migrate task-label associations to task_labels junction table
INSERT INTO task_labels (task_id, label_id)
SELECT DISTINCT cl.task_id, l.id
FROM custom_labels cl
INNER JOIN tasks t ON t.id = cl.task_id
INNER JOIN labels l ON l.user_id = t.user_id AND l.name = cl.label_name
WHERE cl.label_name IS NOT NULL AND cl.label_name != ''
ON CONFLICT (task_id, label_id) DO NOTHING;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);
CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
CREATE INDEX IF NOT EXISTS idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_label_id ON task_labels(label_id);

-- Step 6: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_labels_updated_at
  BEFORE UPDATE ON labels
  FOR EACH ROW
  EXECUTE FUNCTION update_labels_updated_at();

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for labels
-- Users can only see their own labels
CREATE POLICY labels_select_policy ON labels
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own labels
CREATE POLICY labels_insert_policy ON labels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own labels
CREATE POLICY labels_update_policy ON labels
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can only delete their own labels
CREATE POLICY labels_delete_policy ON labels
  FOR DELETE
  USING (user_id = auth.uid());

-- Step 9: Create RLS policies for task_labels junction table
-- Users can only see task_labels for their own tasks
CREATE POLICY task_labels_select_policy ON task_labels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_labels.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Users can only insert task_labels for their own tasks
CREATE POLICY task_labels_insert_policy ON task_labels
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_labels.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Users can only delete task_labels for their own tasks
CREATE POLICY task_labels_delete_policy ON task_labels
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_labels.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Step 10: Add comments for documentation
COMMENT ON TABLE labels IS 'Reusable labels that can be applied to multiple tasks';
COMMENT ON TABLE task_labels IS 'Junction table linking tasks to labels (many-to-many relationship)';
COMMENT ON COLUMN labels.color IS 'Hex color code for label display (e.g., #FF5733)';
COMMENT ON COLUMN labels.name IS 'Label name (must be unique per user)';

-- Note: The old custom_labels table is kept for backward compatibility
-- You can drop it once you've verified the migration was successful:
-- DROP TABLE custom_labels;

