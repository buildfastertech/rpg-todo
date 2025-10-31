# Category Feature Implementation Guide

This guide explains how to implement the new multi-select category feature for tasks in the RPG Todo application.

## Overview

The category feature allows users to:
- Select multiple categories per task using a searchable multi-select dropdown
- Create new categories on-the-fly while creating/editing tasks
- Reuse categories across multiple tasks
- Each category has a color for visual distinction

## Database Changes

### Step 1: Run the Migration

Execute the migration script to create the necessary database tables:

```sql
-- Location: supabase-migration-categories.sql
```

This migration will:
1. Create a `categories` table for user-specific reusable categories
2. Create a `task_categories` junction table for many-to-many relationships
3. Migrate existing category data from the `tasks.category` column
4. Set up indexes, RLS policies, and helper functions
5. Keep the old `category` column for backward compatibility (marked as deprecated)

**Important:** The old `category` column in the `tasks` table is kept but marked as deprecated. The new system uses `task_categories` junction table.

### Database Schema

#### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

#### Task-Categories Junction Table
```sql
CREATE TABLE task_categories (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, category_id)
);
```

## Backend Changes

### New API Endpoints

#### Categories
- `GET /api/categories` - Get all user categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Updated Task Endpoints
- Task creation and update now accept `categoryIds` array
- Tasks now return `categories` array in response

### Example API Usage

#### Create a Category
```javascript
POST /api/categories
{
  "name": "Work",
  "color": "#3B82F6"
}
```

#### Create a Task with Categories
```javascript
POST /api/tasks
{
  "title": "Complete project",
  "description": "Finish the documentation",
  "dueDate": "2025-11-15T12:00:00Z",
  "priority": "High",
  "categoryIds": ["uuid-1", "uuid-2"]
}
```

## Frontend Changes

### New Components

1. **MultiSelect Component** (`client/src/components/ui/multi-select.tsx`)
   - Searchable dropdown with multi-selection
   - Supports creating new items on-the-fly
   - Shows color indicators for categories
   - Maximum 10 categories per task

2. **Command Component** (`client/src/components/ui/command.tsx`)
   - Base component for searchable command palette UI
   - Required by MultiSelect

### Updated Components

1. **TaskFormDialog** (`client/src/components/TaskFormDialog.tsx`)
   - Now uses MultiSelect for categories
   - Loads categories on dialog open
   - Creates categories inline when needed
   - Shows color-coded category badges

### New Services

1. **Category Service** (`client/src/services/category.service.ts`)
   - CRUD operations for categories
   - Integrated with API endpoints

### Updated Types

New types added to `client/src/types/index.ts`:
- `Category` interface
- `Task.categories` array field
- `CreateTaskData.categoryIds` array field
- `UpdateTaskData.categoryIds` array field

## Installation Steps

### 1. Database Migration

Run the migration script in your Supabase SQL editor:
```bash
# Copy contents of supabase-migration-categories.sql
# Paste into Supabase SQL Editor
# Execute
```

### 2. Backend Setup

No additional setup needed. The backend code is already in place:
- Category routes registered in `server/src/index.ts`
- All services, controllers, and validators implemented

### 3. Frontend Setup

Install the required dependency:
```bash
cd client
npm install cmdk
```

The frontend components and services are already implemented.

### 4. Build and Deploy

Backend:
```bash
cd server
npm run build
```

Frontend:
```bash
cd client
npm run build
```

## Usage Guide

### Creating a Task with Categories

1. Click "New Task" button
2. Fill in task details
3. In the "Categories" field:
   - Click to open the dropdown
   - Search for existing categories
   - Or type a new category name and click "Create category"
4. Select multiple categories (up to 10)
5. Categories appear as colored badges
6. Click "Create Task"

### Managing Categories

Categories are automatically created when you type a new name in the multi-select dropdown and click "Create category".

To edit or delete categories, you'll need to:
- Use the API directly (endpoints available)
- Or implement a category management UI (future enhancement)

### Category Colors

- Default color: `#6B7280` (gray)
- Colors are automatically assigned to new categories
- Currently, custom colors can only be set via API

## Features

### Multi-Select with Search
- Type to search existing categories
- Real-time filtering as you type
- Keyboard navigation support

### Inline Category Creation
- Type a new category name
- Click "Create category" button
- Category is immediately available and selected

### Visual Indicators
- Each category has a color indicator
- Color-coded badges in the dropdown
- Color-coded badges in the form
- Shows "+X more" when more than 3 categories selected

### Validation
- Maximum 10 categories per task
- Category names must be 1-50 characters
- Duplicate category names per user are prevented

## Migration Notes

### Data Migration

The migration automatically:
1. Creates category records from existing `tasks.category` values
2. Creates `task_categories` relationships
3. Preserves all existing data

### Backward Compatibility

- The old `category` field is kept but deprecated
- Old API requests still work
- New requests should use `categoryIds` array

## Testing

### Test Scenarios

1. **Create task with new categories**
   - Open task dialog
   - Type new category name
   - Click "Create category"
   - Verify category is created and selected

2. **Create task with existing categories**
   - Open task dialog
   - Search for existing category
   - Select multiple categories
   - Verify task is created with all categories

3. **Edit task categories**
   - Open existing task
   - Add/remove categories
   - Save task
   - Verify categories are updated

4. **Search functionality**
   - Open category dropdown
   - Type to search
   - Verify results are filtered correctly

## Troubleshooting

### Categories not loading
- Check API connection
- Verify authentication token
- Check browser console for errors

### Cannot create categories
- Verify user is authenticated
- Check for duplicate category names
- Check backend logs for errors

### Categories not saving to task
- Verify `categoryIds` is being sent in request
- Check backend validation errors
- Verify database migration was successful

## Future Enhancements

Potential improvements:
1. Category management UI (edit colors, rename, delete)
2. Category grouping/nesting
3. Category templates
4. Filter tasks by category
5. Category statistics (most used, etc.)
6. Custom color picker for categories
7. Category icons

## Support

For issues or questions:
1. Check the migration script for proper execution
2. Verify all files are in place
3. Check backend logs for errors
4. Check browser console for frontend errors

