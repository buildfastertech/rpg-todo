# RPG Todo

A gamified task management application that transforms your daily productivity into an engaging RPG experience. Complete tasks, earn XP, level up, and unlock achievements as you conquer your to-do list.

## 🎮 Overview

RPG Todo combines traditional task management with role-playing game mechanics to make productivity fun and engaging. Every completed task rewards you with experience points, helping you level up and unlock achievements. Track your progress through an immersive interface that celebrates your accomplishments.

## 🛠️ Tech Stack

### Frontend
- **React** - UI library for building interactive user interfaces
- **Shadcn UI** - High-quality, accessible component library
- **TailwindCSS** - Utility-first CSS framework for styling

### Backend
- **Express** - Fast, minimalist web framework for Node.js
- **Supabase** - Open-source Firebase alternative (PostgreSQL, Auth, Real-time)

### Deployment
- **Vercel** - Serverless deployment platform

### Security
- **bcrypt** - Password hashing and encryption
- **GDPR Compliance** - Data protection and user consent flows

## 📁 Project Structure

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

## ✨ Key Features

### Task Management
- Create, edit, and delete tasks with titles, descriptions, and due dates
- Assign priority levels: Low, Medium, High, Urgent
- Color-coded task priorities for quick identification
- Custom labels for task categorization (up to 20 per user)
- Task archiving system for completed tasks
- Sorting and filtering with pagination support

### Gamification & Progression
- **XP System**: Earn experience points based on task priority
  - Low Priority: 10 XP
  - Medium Priority: 25 XP
  - High Priority: 50 XP
  - Urgent Priority: 75 XP
- **Level Progression**: 100 levels with exponential XP requirements
- **Daily Rewards**: Earn 2 XP for daily logins
- **Registration Bonus**: Start with 5 XP
- Real-time XP and level display in header with progress bar

### Achievements & Rewards
- **Task Milestones**: Novice (10), Apprentice (25), Taskmaster (50), Grandmaster (100)
- **Level Achievements**: Journeyman (Lvl 5), Expert (Lvl 10), Master (Lvl 15), Legend (Lvl 20)
- **Special Achievements**: Efficiency Master (complete all urgent tasks in one week)
- Visual achievement progress tracking
- Toast notifications for unlocked achievements

### User Account & Profile
- Secure registration and authentication
- Profile management with editable username
- Track registration date, XP, level, and completed task count
- View unlocked achievements and statistics

### User Interface
- Clean, intuitive design with Shadcn UI components
- Responsive layout for all devices
- Header with level, XP, and progress bar
- Keyboard shortcuts for common actions
- Non-intrusive toast notifications
- Loading states and clear error messages

## 🗄️ Database Schema

### Users Table
- username, email, password (hashed)
- registration_date, xp, level
- completed_task_count

### Tasks Table
- title, description, due_date
- status (open, completed, archived)
- priority, xp_value, category
- user_id (foreign key)

### Achievements Table
- achievement_name, unlocked_date
- user_id (foreign key)

### Custom_Labels Table
- label_name, created_at
- user_id (foreign key)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Supabase Account** - [Sign up for free](https://supabase.com/)
- **Git** - [Download](https://git-scm.com/)

### Quick Start (5 Steps)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/rpg-todo.git
cd rpg-todo
```

#### Step 2: Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com/dashboard)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `database/schema.sql` from this repository
4. Paste and run the SQL to create all tables, functions, and RLS policies
5. Go to **SQL Editor** again and run `database/seed-achievements.sql` to populate achievements

**Get Your Supabase Credentials:**
- Go to **Settings** → **API**
- Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
- Copy your **anon/public key** (under "Project API keys")

#### Step 3: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### Step 4: Configure Environment Variables

**Server Configuration** (`server/.env`):

```bash
# Copy the example file
cd server
cp .env-example .env
```

Edit `server/.env` with your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
JWT_SECRET=your_secure_random_jwt_secret_here
CLIENT_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

**Generate a secure JWT_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -base64 32
```

**Client Configuration** (`client/.env`):

```bash
# Copy the example file
cd ../client
cp .env-example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

#### Step 5: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📊 Environment: development
🔗 Client URL: http://localhost:5173
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open your browser** and navigate to **http://localhost:5173**

🎉 **You're ready to go!** Register a new account and start using RPG Todo!

---

## 🗄️ Database Setup Details

### Tables Created

1. **users** - User accounts with level and XP
2. **tasks** - User tasks with priority and status
3. **achievements** - Achievement definitions
4. **achievement_user** - User achievement unlocks (join table)
5. **custom_labels** - Task labels
6. **points_ledger** - XP transaction log (audit trail)

### Database Functions

- `get_user_total_xp(user_id)` - Calculate total XP from ledger
- `calculate_level_from_xp(xp)` - Determine level from XP
- `get_completed_task_count(user_id)` - Count completed tasks
- `award_xp(user_id, xp_value, description, task_id)` - Award XP and update level
- `get_urgent_tasks_this_week(user_id)` - Get urgent tasks for achievements

### Row Level Security (RLS)

All tables have RLS policies enabled to ensure users can only access their own data.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

#### Deploy Backend

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

4. **Set environment variables** on Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL), `NODE_ENV=production`

5. **Redeploy** to apply environment variables

6. **Copy your backend URL** (e.g., `https://rpg-todo-server.vercel.app`)

#### Deploy Frontend

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

3. **Set environment variable** on Vercel Dashboard:
   - Add: `VITE_API_URL=https://your-backend-url.vercel.app/api`

4. **Redeploy without cache** to apply the environment variable

### Verify Deployment

1. Test backend health: `https://your-backend-url.vercel.app/health`
2. Visit your frontend URL and test registration/login

### Live Demo

- **Frontend**: https://rpg-todo-pied.vercel.app
- **Backend**: https://rpg-todo-inhf.vercel.app

---

## 🧪 Testing the API

### Using Postman

1. Import the collection: `postman/RPG-Todo-API.postman_collection.json`
2. Import the environment: `postman/RPG-Todo-Local.postman_environment.json`
3. Update the `base_url` in the environment to your backend URL
4. Test all endpoints with automatic auth token handling

### Manual Testing with curl

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🛠️ Development Scripts

### Backend (`server/`)

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Run production build
npm run lint     # Lint code with ESLint
npm run format   # Format code with Prettier
```

### Frontend (`client/`)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Lint code with ESLint
```

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Endpoints (Requires Authentication)

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update username
- `GET /api/users/stats` - Get user stats (XP, level, achievements)
- `GET /api/users/xp-history` - Get XP transaction history
- `DELETE /api/users/account` - Delete user account

### Task Endpoints (Requires Authentication)

- `GET /api/tasks` - Get all tasks (with filters/pagination)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `PATCH /api/tasks/:id/archive` - Archive task
- `PATCH /api/tasks/:id/unarchive` - Unarchive task

### Achievement Endpoints

- `GET /api/achievements` - Get all achievement definitions
- `GET /api/achievements/user` - Get user's unlocked achievements (requires auth)
- `GET /api/achievements/progress` - Get achievement progress (requires auth)
- `POST /api/achievements/check` - Check and award new achievements (requires auth)

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to database"
- Verify Supabase credentials in `.env`
- Check Supabase project is active
- Ensure database schema is created

#### "CORS error" in browser
- Verify `CLIENT_URL` in backend `.env` matches your frontend URL
- No trailing slashes in URLs
- Restart backend after changing environment variables

#### "JWT malformed" error
- Ensure `JWT_SECRET` is set in backend `.env`
- Re-login after changing JWT_SECRET
- Check token is being sent in Authorization header

#### Frontend shows "Network Error"
- Verify backend is running on the correct port
- Check `VITE_API_URL` in client `.env`
- Ensure no firewall blocking localhost connections

#### "Port already in use"
- Change `PORT` in server `.env`
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### Getting Help

- Check server logs for detailed error messages
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Ensure database schema is up to date

## 🏗️ Development Roadmap

- [x] Project planning and architecture
- [x] Project setup and documentation (MDC files)
- [x] Database schema and Supabase configuration
- [x] Security implementation (bcrypt, JWT, RLS)
- [x] Core UI structure with Shadcn/TailwindCSS
- [x] User authentication and registration
- [x] Profile management
- [x] XP and leveling system (ledger-based)
- [x] Task creation and management
- [x] Task list with sorting, filtering, and pagination
- [x] Custom labels for tasks
- [x] Achievement tracking system
- [x] Achievement display with progress tracking
- [x] Achievement unlock notifications
- [x] Settings page with account deletion
- [x] Loading states and error handling
- [x] Light/dark mode theme support
- [x] Postman collection for API testing
- [x] Deployment to Vercel (frontend and backend)
- [x] Legal pages (Terms of Service, Privacy Policy, GDPR)
- [x] Responsive design testing on all devices
- [ ] End-to-end testing
- [ ] Performance optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Coding Standards

This project follows specific coding standards for each framework. See `.cursor/docs/` for detailed guidelines:
- React best practices
- Express API patterns
- Shadcn UI usage
- TailwindCSS conventions
- Supabase integration patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔒 Security & Privacy

- All passwords are hashed using bcrypt
- Data encryption at rest and in transit
- GDPR-compliant data handling
- User consent flows for data collection
- Row Level Security (RLS) policies in Supabase

## 📧 Contact

Project Link: [https://github.com/yourusername/rpg-todo](https://github.com/yourusername/rpg-todo)

---

Built with ❤️ to make productivity fun and engaging

