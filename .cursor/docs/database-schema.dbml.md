# RPG Todo Database Schema

This file contains the database schema in DBML format for visualization in [dbdiagram.io](https://dbdiagram.io/).

## DBML Schema

```dbml
// RPG Todo Database Schema

Table users {
  id uuid [pk, default: `uuid_generate_v4()`]
  username varchar(50) [unique, not null]
  email varchar(255) [unique, not null]
  password varchar(255) [not null, note: 'Hashed with bcrypt']
  level integer [default: 1, note: 'User level (1-100)']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (id) [pk]
    (email) [unique]
    (username) [unique]
  }
  
  note: 'Core user table - XP calculated from points_ledger'
}

Table tasks {
  id uuid [pk, default: `uuid_generate_v4()`]
  user_id uuid [ref: > users.id]
  title varchar(200) [not null]
  description text
  due_date timestamptz [not null]
  status varchar(20) [default: 'open', note: 'Values: open, completed, archived']
  priority varchar(20) [not null, note: 'Values: Low, Medium, High, Urgent']
  xp_value integer [not null, note: 'XP awarded on completion']
  category varchar(50) [note: 'Optional custom label']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (user_id) [name: 'idx_tasks_user_id']
    (status) [name: 'idx_tasks_status']
    (due_date) [name: 'idx_tasks_due_date']
    (priority) [name: 'idx_tasks_priority']
    (user_id, status, due_date) [name: 'idx_tasks_user_status_due']
  }
  
  note: 'User tasks with RPG XP values based on priority'
}

Table achievements {
  id uuid [pk, default: `uuid_generate_v4()`]
  achievement_name varchar(100) [not null]
  achievement_description varchar(100) [not null]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  note: 'Master list of all available achievements'
}

Table achievement_user {
  user_id uuid [not null, ref: > users.id]
  achievement_id uuid [not null, ref: > achievements.id]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (user_id, achievement_id) [pk]
    (user_id) [name: 'idx_achievement_user_user_id']
    (achievement_id) [name: 'idx_achievement_user_achievement_id']
  }
  
  note: 'Join table tracking which users have unlocked which achievements'
}

Table custom_labels {
  id uuid [pk, default: `uuid_generate_v4()`]
  task_id uuid [not null, ref: > tasks.id]
  label_name varchar(50) [not null]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (task_id) [name: 'idx_custom_labels_task_id']
    (task_id, label_name) [unique, name: 'idx_custom_labels_task_label']
  }
  
  note: 'Labels linked to tasks - multiple labels per task'
}

Table points_ledger {
  id uuid [pk, default: `uuid_generate_v4()`]
  user_id uuid [not null, ref: > users.id]
  task_id uuid [null, ref: > tasks.id]
  description text [note: 'e.g., "Completed task: Fix bug", "Daily login", "Registration bonus"']
  xp_value integer [not null]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (user_id) [name: 'idx_points_ledger_user_id']
    (task_id) [name: 'idx_points_ledger_task_id']
  }
  
  note: 'Transaction log for all XP awards - provides audit trail'
}
```

## Schema Overview

### Key Architectural Decisions

#### 1. Ledger-Based XP System
**Why**: Traditional approach stored XP as a single field on users table. This lacked history and audit trail.

**New Approach**: `points_ledger` table tracks every XP transaction.
- **Benefits**:
  - Complete audit trail of all XP awards
  - Historical data for analytics
  - Support for XP adjustments/corrections
  - Detailed user history display
  - Total XP = `SUM(xp_value) FROM points_ledger WHERE user_id = ?`

**Impact**: `users.xp` field removed, calculated dynamically from ledger.

#### 2. Achievement Join Table Pattern
**Why**: Separates achievement definitions from user unlocks.

**Structure**:
- `achievements` table: Master list of all achievements (name, description)
- `achievement_user` table: Join table tracking which users have which achievements

**Benefits**:
- Single source of truth for achievement definitions
- Easy to add new achievements without touching user data
- Query all users with a specific achievement
- Prevents duplicate unlocks via unique constraint

**Impact**: `achievements.user_id` removed, replaced with join table.

#### 3. Task-Based Labels
**Why**: Labels are now properties of tasks, not users.

**Old Design**: User creates labels, applies them to tasks via `task.category`
- Limited to 20 labels per user
- Labels not reusable across tasks
- Single label per task

**New Design**: Labels linked directly to tasks via `custom_labels.task_id`
- Multiple labels per task
- No arbitrary limits
- Labels are task-specific

**Impact**: `custom_labels.user_id` replaced with `task_id`, removed 20 label limit.

### Tables

#### 1. Users Table (Simplified)
- **Purpose**: Core user authentication and current level
- **Key Changes**:
  - Removed: `xp` (calculated from points_ledger)
  - Removed: `completed_task_count` (calculated from tasks)
  - Removed: `registration_date` (use created_at)
  - Removed: `last_login_date` (track via points_ledger "Daily login" entries)
- **Kept**: `level` for quick access (updated when XP crosses thresholds)

#### 2. Tasks Table
- **Purpose**: User tasks with priority and XP values
- **Key Fields**:
  - `priority`: Low (10 XP), Medium (25 XP), High (50 XP), Urgent (75 XP)
  - `xp_value`: Stored for reference, awarded via points_ledger on completion
  - `status`: open, completed, archived
- **Sorting**: Default by `due_date ASC`, then `priority DESC`

#### 3. Achievements Table (Master List)
- **Purpose**: Defines all available achievements
- **Not User-Specific**: Contains achievement definitions, not unlocks
- **Achievement Types**:
  - **Task Milestones**: Novice (10), Apprentice (25), Taskmaster (50), Grandmaster (100)
  - **Level Milestones**: Journeyman (L5), Expert (L10), Master (L15), Legend (L20)
  - **Special**: Efficiency Master (all urgent tasks in one week)

#### 4. Achievement_User Table (Join)
- **Purpose**: Tracks which achievements each user has unlocked
- **Composite PK**: (user_id, achievement_id) prevents duplicate unlocks
- **Query Pattern**:
  ```sql
  -- Get user's achievements
  SELECT a.* FROM achievements a
  JOIN achievement_user au ON a.id = au.achievement_id
  WHERE au.user_id = ?
  ```

#### 5. Custom_Labels Table
- **Purpose**: Task-specific labels for categorization
- **Architecture**: Linked to tasks, not users
- **Multiple Labels**: Same task can have multiple label entries
- **Unique Constraint**: (task_id, label_name) prevents duplicate labels on same task

#### 6. Points_Ledger Table (Transaction Log)
- **Purpose**: Immutable log of all XP transactions
- **Key Fields**:
  - `user_id`: User receiving XP
  - `task_id`: Optional reference (null for bonuses like "Daily login")
  - `description`: Human-readable description of XP source
  - `xp_value`: Amount of XP (can be positive for awards)
- **Examples**:
  - `{ task_id: "uuid", description: "Completed task: Fix bug", xp_value: 50 }`
  - `{ task_id: null, description: "Daily login", xp_value: 2 }`
  - `{ task_id: null, description: "Registration bonus", xp_value: 5 }`

### XP System

**Level Progression Thresholds:**
| Level | XP Required | Level | XP Required |
|-------|-------------|-------|-------------|
| 1     | 0           | 7     | 3,500       |
| 2     | 100         | 8     | 5,500       |
| 3     | 250         | 9     | 8,000       |
| 4     | 500         | 10    | 11,000      |
| 5     | 1,000       | 11    | 14,500      |
| 6     | 2,000       | 12-100| Exponential |

**XP Awards by Priority:**
| Priority | XP Value |
|----------|----------|
| Low      | 10       |
| Medium   | 25       |
| High     | 50       |
| Urgent   | 75       |

**Additional XP Sources:**
- Registration: +5 XP (ledger entry with description "Registration bonus")
- Daily Login: +2 XP (ledger entry with description "Daily login", checked daily)

### Database Functions

#### `get_user_total_xp(p_user_id UUID) → INTEGER`
Returns sum of all XP from points_ledger for a user.

#### `calculate_level_from_xp(xp INTEGER) → INTEGER`
Calculates level based on XP thresholds. Immutable function.

#### `get_completed_task_count(p_user_id UUID) → INTEGER`
Returns count of completed tasks for achievement tracking.

#### `get_urgent_tasks_this_week(p_user_id UUID) → SETOF tasks`
Returns urgent tasks for current week (for Efficiency Master achievement).

#### `award_xp(p_user_id, p_xp_value, p_description, p_task_id) → TABLE`
Awards XP, creates ledger entry, calculates new level, updates user if level changed.
Returns: `(new_total_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN)`

### Row Level Security (RLS)

All tables have RLS enabled:

**Users**: View/update own profile
**Tasks**: Full CRUD on own tasks
**Achievements**: Public read (all achievements visible to all)
**Achievement_User**: View/insert own unlocked achievements
**Custom_Labels**: CRUD labels on own tasks only (checked via task.user_id)
**Points_Ledger**: View/insert own XP transactions

### Performance Indexes

- `tasks`: user_id, status, due_date, priority, composite (user_id, status, due_date)
- `achievement_user`: user_id, achievement_id, composite PK (user_id, achievement_id)
- `custom_labels`: task_id, composite unique (task_id, label_name)
- `points_ledger`: user_id, task_id

### Migration Notes

**Breaking Changes from Original Design:**

1. **XP Calculation**: No longer direct field, must query points_ledger
2. **Achievement Unlocks**: Query achievement_user join table, not achievements directly
3. **Labels**: Now linked to tasks (task_id), not users (user_id)
4. **Completed Task Count**: Calculate from tasks, not stored on users
5. **Registration Date**: Use users.created_at

**Migration Strategy** (if upgrading from old schema):
1. Migrate `users.xp` to points_ledger entries with description "Migration: Initial XP"
2. Migrate achievements table: split into achievements + achievement_user tables
3. Migrate custom_labels: change foreign key from user_id to task_id
4. Remove obsolete user fields: xp, completed_task_count, registration_date, last_login_date

## Security & Compliance

- ✅ All passwords hashed with bcrypt
- ✅ RLS policies prevent cross-user data access
- ✅ Timestamps use `timestamptz` for timezone awareness
- ✅ Foreign keys use `ON DELETE CASCADE` (except points_ledger.task_id uses `SET NULL`)
- ✅ UUID v4 for all primary keys (non-sequential, secure)
- ✅ GDPR-compliant (data encryption at rest/transit, user consent flows)
- ✅ Audit trail via points_ledger for compliance
