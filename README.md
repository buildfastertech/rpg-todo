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
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rpg-todo.git
cd rpg-todo

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Environment Setup

Create `.env` files in both `client` and `server` directories:

**server/.env**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

**client/.env**
```env
VITE_API_URL=http://localhost:3001
```

### Running the Application

```bash
# Run server (from server directory)
npm run dev

# Run client (from client directory)
npm run dev
```

## 🏗️ Development Roadmap

- [x] Project planning and architecture
- [ ] Project setup and documentation (MDC files)
- [ ] Database schema and Supabase configuration
- [ ] Security implementation (bcrypt, GDPR)
- [ ] Core UI structure with Shadcn/TailwindCSS
- [ ] User authentication and registration
- [ ] Profile management
- [ ] XP and leveling system
- [ ] Task creation and management
- [ ] Task list with sorting and filtering
- [ ] Achievement tracking system
- [ ] Achievement display and notifications
- [ ] Legal links (Terms of Service, Privacy Policy)

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

