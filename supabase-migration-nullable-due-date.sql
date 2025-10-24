-- Migration: Make due_date nullable in tasks table
-- This allows tasks to be created without a specific due date

ALTER TABLE tasks 
ALTER COLUMN due_date DROP NOT NULL;

