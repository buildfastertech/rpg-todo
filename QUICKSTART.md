# RPG Todo - Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (via Supabase)

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory with:
```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Copy your project URL and anon key to `.env`

5. Start the server:
```bash
npm run dev
```

The API will run on `http://localhost:3000`

## Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `client` directory with:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Testing the Application

### Using the Web Interface

1. Open `http://localhost:5173` in your browser
2. Click "Register here" to create a new account
3. Fill in your username, email, and password
4. You'll be logged in automatically and receive 5 XP as a registration bonus!
5. Explore the dashboard, profile, and achievements

### Using Postman

1. Import the collection from `postman/RPG-Todo-API.postman_collection.json`
2. Import the environment from `postman/RPG-Todo-Local.postman_environment.json`
3. Select the "RPG Todo Local" environment
4. Test the API endpoints (auth token is saved automatically)

## Project Structure

```
rpg-todo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration
│   └── package.json
│
├── postman/                # API testing
└── .cursor/                # Documentation
```

## Features Implemented

### Backend (Complete ✅)
- ✅ User registration and authentication (JWT)
- ✅ User profile management
- ✅ Task CRUD operations with custom labels
- ✅ Ledger-based XP system
- ✅ Achievement tracking and unlocking
- ✅ Level progression system
- ✅ Daily login bonuses

### Frontend (In Progress 🚧)
- ✅ Authentication pages (Login/Register)
- ✅ Protected routes
- ✅ Main layout with XP/level display
- ✅ Header with navigation
- ✅ Toast notifications for XP and level-ups
- 🚧 Dashboard with task list
- 🚧 Task creation/editing
- 🚧 Profile page
- 🚧 Achievements page
- 🚧 Settings page

## Next Steps

1. **Dashboard**: Build task list with filtering, sorting, and pagination
2. **Task Management**: Create task form with custom labels
3. **Profile**: Display user stats and XP history
4. **Achievements**: Show progress bars and unlock notifications
5. **Settings**: Add GDPR consent and legal links

## Troubleshooting

### Backend won't start
- Check that PostgreSQL/Supabase is running
- Verify `.env` file has correct database credentials
- Run `npm install` to ensure all dependencies are installed

### Frontend won't start
- Verify backend is running on port 3000
- Check `.env` file has correct API URL
- Run `npm install` to ensure all dependencies are installed

### Authentication issues
- Clear browser localStorage
- Check that JWT_SECRET matches between server and any stored tokens
- Verify Supabase RLS policies are set up correctly

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Shadcn/UI, TailwindCSS
- **Backend**: Express, TypeScript, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT, bcrypt
- **Testing**: Postman

## Documentation

- Backend API: See `server/README.md`
- Frontend: See `client/README.md`
- Database Schema: See `database-schema.dbml.md`
- Build Plan: See `.cursor/plans/rpg-todo-build-4d444796.plan.md`

