# RPG Todo Server

Express backend for RPG Todo application with Supabase integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

3. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Copy the Project URL → `SUPABASE_URL`
   - Copy the anon/public key → `SUPABASE_ANON_KEY`
   - Copy the service_role key → `SUPABASE_SERVICE_KEY`

4. Run the database schema:
   - Go to your Supabase SQL Editor
   - Copy and paste the contents of `../supabase-schema.sql`
   - Execute the script

## Development

Start the development server:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

## Build

Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks (Coming Soon)
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Complete task
- `PATCH /api/tasks/:id/archive` - Archive task

### Users (Coming Soon)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user stats (XP, level, achievements)

### Achievements (Coming Soon)
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user's unlocked achievements

## Environment Variables

See `.env.example` for required environment variables.

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database and auth
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Zod** - Schema validation

