<!-- 4d444796-5e56-44bd-9f54-6c4bc3f94abf 79c3bcad-8ccd-4590-9145-b5d199bc0e85 -->
# RPG Todo Application Build Plan

## Implementation Order

Features are ordered by dependencies to ensure prerequisite functionality is built first:

1. Project Setup & Documentation (Foundation - First!)
2. Data Persistence & Storage (Foundation)
3. User Interface & Experience (Foundation)
4. User Account & Profile
5. Gamification & Progression
6. Task Management
7. Rewards & Achievements
8. Uncategorised (Legal Links)

---

## 1. Project Setup & Documentation

**Foundation layer - completed before implementation begins**

### Project Structure

Create a monorepo structure with separate client and server folders:

```
rpg-todo/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components (Header, TaskList, etc.)
│   │   ├── pages/       # Page components (Dashboard, Profile, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API service calls to backend
│   │   ├── utils/       # Helper functions
│   │   ├── types/       # TypeScript types/interfaces
│   │   └── styles/      # TailwindCSS config and global styles
│   ├── public/
│   └── package.json
│
├── server/              # Express backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Business logic (XP, achievements, etc.)
│   │   ├── models/      # Data models/schemas
│   │   ├── utils/       # Helper functions
│   │   └── config/      # Configuration (Supabase, auth, etc.)
│   └── package.json
│
└── .cursor/
    └── docs/            # MDC files for coding standards
```

### Framework Documentation (MDC Files)

Create Model Context Protocol (MDC) files for coding standards in `.cursor/docs/`:

**Individual Framework MDC Files (alwaysApply: false):**

- `react-standards.mdc` - React best practices, hooks, component patterns
- `express-standards.mdc` - Express routing, middleware, API design patterns
- `shadcn-standards.mdc` - Shadcn UI component usage and customization
- `tailwind-standards.mdc` - TailwindCSS utility patterns and responsive design
- `supabase-standards.mdc` - Supabase auth, RLS policies, query patterns

**Routing Glossary (alwaysApply: true):**

- `framework-glossary.mdc` - Keywords and routing guide to help LLMs identify which framework-specific documentation to reference based on the prompt context

This ensures LLM agents have proper context without loading all documentation unnecessarily.

---

## 2. Data Persistence & Storage

**Foundation layer - no dependencies**

### Database Schema Setup

Create Supabase tables with the following structure:

**Users Table (Simplified):**

- id (uuid, primary key)
- username (varchar(50), unique)
- email (varchar(255), unique)
- password (varchar(255), hashed with bcrypt)
- level (integer, default: 1)
- created_at (timestamptz)
- updated_at (timestamptz)

**Note:** XP is calculated dynamically from points_ledger, completed_task_count from tasks table

**Tasks Table:**

- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- title (varchar(200))
- description (text)
- due_date (timestamptz)
- status (varchar(20): open, completed, archived)
- xp_value (integer)
- priority (varchar(20): Low, Medium, High, Urgent)
- category (varchar(50), nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

**Achievements Table (Master List):**

- id (uuid, primary key)
- achievement_name (varchar(100))
- achievement_description (varchar(100))
- created_at (timestamptz)
- updated_at (timestamptz)

**Note:** This stores achievement definitions, not user unlocks

**Achievement_User Table (Join Table):**

- user_id (uuid, foreign key to users)
- achievement_id (uuid, foreign key to achievements)
- created_at (timestamptz)
- updated_at (timestamptz)
- PRIMARY KEY (user_id, achievement_id)

**Note:** Tracks which users have unlocked which achievements

**Custom_Labels Table (Task-Based):**

- id (uuid, primary key)
- task_id (uuid, foreign key to tasks)
- label_name (varchar(50))
- created_at (timestamptz)
- updated_at (timestamptz)
- UNIQUE (task_id, label_name)

**Note:** Labels are now linked to tasks, not users. Multiple labels per task supported.

**Points_Ledger Table (XP Transaction Log):**

- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- task_id (uuid, nullable, foreign key to tasks)
- description (text)
- xp_value (integer)
- created_at (timestamptz)
- updated_at (timestamptz)

**Note:** Immutable log of all XP awards. Provides complete audit trail.

### Database Configuration

**Key Architecture Changes:**

- **Ledger-Based XP System**: All XP transactions tracked in points_ledger for audit trail
- **Achievement Join Table**: Separates achievement definitions from user unlocks
- **Task-Based Labels**: Labels linked directly to tasks (multiple labels per task, no 20-label limit)
- **Simplified Users Table**: XP and task counts calculated dynamically

**Indexes:**

- tasks: user_id, status, due_date, priority, composite (user_id, status, due_date)
- achievement_user: user_id, achievement_id, composite PK
- custom_labels: task_id, composite unique (task_id, label_name)
- points_ledger: user_id, task_id

**Database Functions:**

- `get_user_total_xp(user_id)` - Calculate total XP from ledger
- `calculate_level_from_xp(xp)` - Determine level from XP amount
- `get_completed_task_count(user_id)` - Count completed tasks
- `award_xp(user_id, xp_value, description, task_id)` - Award XP, create ledger entry, update level
- `get_urgent_tasks_this_week(user_id)` - Get urgent tasks for achievement

**Security & Configuration:**

- Enable Row Level Security (RLS) policies for all tables
- Configure data encryption at rest and in transit
- Implement GDPR-compliant data handling
- Set up pagination support for task lists (configurable: 10, 25, 50 per page)

### Security Implementation

- Use bcrypt for password hashing and salting
- Implement user consent flow for data collection
- Configure Supabase auth for secure authentication

---

## 2. User Interface & Experience

**Foundation layer - affects all features**

### Core UI Structure

Build the main application layout with:

**Header Component:**

- Level display
- XP display with current/next level values
- Progress bar for XP towards next level
- Navigation menu

**Core Sections:**

- Task List view
- Task Creation form
- Profile section
- Achievements section
- Archive section (for archived tasks)
- Settings section

### Visual Design System

Using Shadcn + TailwindCSS:

**Color Coding for Priorities:**

- Low: green
- Medium: yellow
- High: orange
- Urgent: red

**UI Components:**

- Toast notifications (non-intrusive)
- Progress bars for XP and achievements
- Modal dialogs for task creation/editing
- Responsive layout for all devices

### User Experience Features

- Clear success/error messages
- Tooltips for unfamiliar features
- Keyboard shortcuts for common actions (task creation, completion)
- Loading states for async operations
- Consistent design language across all sections

---

## 3. User Account & Profile

**Depends on: Data Persistence & Storage, User Interface & Experience**

### Registration System

**Registration Flow:**

- Collect: username, email, password
- Validate input (unique username/email, password strength)
- Hash password with bcrypt
- Store in Supabase users table
- Auto-capture created_at timestamp
- Award 5 XP upon successful registration (create points_ledger entry with description "Registration bonus")
- Initialize user at Level 1

### Authentication

- Login with username/email and password
- Use Supabase Auth for session management
- Award 2 XP for daily login (create points_ledger entry with description "Daily login", check if already awarded today)
- Implement secure session handling

### Profile Management

**Profile Display:**

- Username (editable)
- Email (display only)
- Registration date (from created_at)
- Current XP (calculated from points_ledger: SUM(xp_value))
- Current level (from users.level)
- Total completed task count (calculated from tasks WHERE status='completed')
- Unlocked achievements (from achievement_user join)
- XP History (recent transactions from points_ledger)

**Edit Profile:**

- Allow username changes
- Validate new username for uniqueness
- Update user record in Supabase

---

## 4. Gamification & Progression

**Depends on: Data Persistence, User Account & Profile**

### XP System (Ledger-Based)

**Architecture:**

- All XP transactions stored in points_ledger table
- Total XP = SUM(xp_value) FROM points_ledger WHERE user_id = ?
- Each XP award creates a new ledger entry with description
- Provides complete audit trail and history

**XP Awards by Task Priority:**

- Low: 10 XP
- Medium: 25 XP
- High: 50 XP
- Urgent: 75 XP
- Default (no priority): 10 XP

**Additional XP Sources:**

- Registration: 5 XP (description: "Registration bonus")
- Daily login: 2 XP (description: "Daily login")

**Ledger Entry Format:**

- user_id: User receiving XP
- task_id: Optional reference to task (null for bonuses)
- description: Human-readable description (e.g., "Completed task: Fix bug", "Daily login")
- xp_value: Amount of XP awarded

### Leveling System

**Level Progression Thresholds:**

- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 500 XP
- Level 5: 1000 XP
- Level 6: 2000 XP
- Levels 7-100: Exponential progression

**Maximum Level:** 100

### Level-Up Mechanics

- Calculate level based on cumulative XP (from points_ledger)
- Use `award_xp()` database function to handle XP awards and level updates
- Function returns: new_total_xp, new_level, leveled_up boolean
- Display notification when user levels up (when leveled_up = true)
- Update header display in real-time

### Progress Display

- Show current XP / next level XP in header
- Visual progress bar towards next level
- Real-time updates when XP is earned

---

## 5. Task Management

**Depends on: Data Persistence, UI, Gamification, User Account**

### Task Creation

**Create Task Form:**

- Title (required)
- Description (optional)
- Due date (required)
- Priority selector: Low, Medium, High, Urgent (required)
- Custom labels (optional, multiple labels per task, no limit)
- Auto-assign XP based on priority
- Validate all fields before saving
- Save to Supabase tasks table
- Create custom_labels entries if labels provided

### Custom Labels (Task-Based)

**Architecture Change:**

- Labels now linked directly to tasks (task_id) instead of users
- Multiple labels can be assigned to a single task
- No limit on total labels per user (removed 20-label limit)
- Labels are task-specific, not user-specific

**Operations:**

- Add label to task (create custom_labels entry with task_id)
- Remove label from task
- Query tasks with labels using JOIN
- Store in Custom_Labels table with task_id foreign key

### Task Display

**Task List:**

- Sort by: due date (nearest first), then priority (urgent first)
- Color-code priority visually
- Show: title, description preview, due date, priority, XP value
- Filter by: status, priority, custom label
- Pagination (10/25/50 per page)

### Task Actions

**Edit Task:**

- Modify any field
- Recalculate XP if priority changes
- Update in database

**Delete Task:**

- Remove from database
- Confirm before deletion

**Complete Task:**

- Mark status as "completed"
- Award XP to user (create points_ledger entry with task_id and description)
- Use `award_xp()` function which:
  - Creates ledger entry
  - Calculates new total XP
  - Updates user level if threshold crossed
  - Returns leveledUp boolean
- Check and update achievement progress (count completed tasks)
- Show success notification (with level-up notification if applicable)

**Archive Task:**

- Move from main list to archive section
- Change status to "archived"
- Allow un-archiving back to main list

---

## 6. Rewards & Achievements

**Depends on: Gamification, UI, Data Persistence, User Account**

### Achievement Definitions

**Task Completion Achievements:**

- "Novice": 10 tasks completed
- "Apprentice": 25 tasks completed
- "Taskmaster": 50 tasks completed
- "Grandmaster": 100 tasks completed

**Level Achievements:**

- "Journeyman": Reach level 5
- "Expert": Reach level 10
- "Master": Reach level 15
- "Legend": Reach level 20

**Special Achievements:**

- "Efficiency Master": Complete all urgent tasks within one week

### Achievement Tracking

**Architecture:**

- Achievements defined in achievements table (id, name, description)
- User achievement unlocks stored in achievement_user join table
- Prevents duplicate achievement awards via unique constraint

**Tracking Logic:**

- Track progress towards each achievement
- Check achievement conditions after:
  - Task completion (query completed task count)
  - Level up (check user.level)
  - Weekly urgent task completion (use `get_urgent_tasks_this_week()`)
- On unlock: Create achievement_user entry linking user to achievement
- Query unlocked achievements via join: achievement_user → achievements

### Achievement Display

**Achievements Section:**

- List all available achievements
- Show unlocked vs locked status
- Display progress bars/values for in-progress achievements
- Show unlock date for completed achievements

### Achievement Notifications

- Toast notification when achievement unlocked
- Success message with achievement name
- Non-intrusive, positive reinforcement

---

## 7. Uncategorised (Legal Links)

**Depends on: User Interface & Experience**

### Terms of Service & Privacy Policy

**Implementation:**

- Add links in Settings section
- Links open in new browser tab
- Accessible from user profile/settings menu

**Required Links:**

- Terms of Service
- Privacy Policy

---

## 0. Project Setup & Documentation

**Foundation layer - completed before implementation begins**

### Framework Documentation (MDC Files)

Create Model Context Protocol (MDC) files for coding standards:

**Individual Framework MDC Files (alwaysApply: false):**

- `react-standards.mdc` - React best practices, hooks, component patterns
- `express-standards.mdc` - Express routing, middleware, API design patterns
- `shadcn-standards.mdc` - Shadcn UI component usage and customization
- `tailwind-standards.mdc` - TailwindCSS utility patterns and responsive design
- `supabase-standards.mdc` - Supabase auth, RLS policies, query patterns

**Routing Glossary (alwaysApply: true):**

- `framework-glossary.mdc` - Keywords and routing guide to help LLMs identify which framework-specific documentation to reference based on the prompt context

This ensures LLM agents have proper context without loading all documentation unnecessarily.

---

## Technical Stack Summary

- **Frontend:** React with Shadcn UI components and TailwindCSS
- **Backend:** Express server for API
- **Database:** Supabase (PostgreSQL with Auth)
- **Deployment:** Vercel
- **Security:** bcrypt for passwords, GDPR compliance, data encryption

### To-dos

- [x] Create MDC files for framework standards (react, express, shadcn, tailwind, supabase) and framework glossary
- [x] Create Supabase database schema (6 tables: Users, Tasks, Achievements, Achievement_User, Custom_Labels, Points_Ledger with proper indexes and RLS)
- [x] Create database functions (get_user_total_xp, calculate_level_from_xp, award_xp, get_completed_task_count, get_urgent_tasks_this_week)
- [x] Seed achievements table with achievement definitions (Novice, Apprentice, etc.)
- [x] Implement security measures - bcrypt for password hashing
- [x] Implement user registration and authentication system with ledger-based XP rewards (POST /api/auth/register, /api/auth/login, /api/auth/logout)
- [x] Create Postman collection and environment files for API testing
- [ ] Build profile display and editing functionality (GET /api/users/profile, PUT /api/users/profile, GET /api/users/stats, GET /api/users/xp-history)
- [ ] Build core UI structure with Shadcn/TailwindCSS (Header, layout, navigation, design system)
- [ ] Build task routes (GET, POST, PUT, DELETE, PATCH /api/tasks)
- [ ] Build task creation form with validation and task-based labels (multiple labels per task)
- [ ] Implement task list display with sorting, filtering, color-coding, pagination, and label display
- [ ] Build task edit, delete, complete, and archive functionality with ledger-based XP rewards
- [ ] Build achievement routes (GET /api/achievements, GET /api/achievements/user)
- [ ] Implement achievement tracking system using achievement_user join table
- [ ] Build achievements section with progress bars and unlock notifications
- [ ] Implement GDPR consent flow
- [ ] Add Terms of Service and Privacy Policy links in Settings