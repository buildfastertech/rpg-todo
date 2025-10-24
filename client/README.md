# RPG Todo - Frontend Client

React + TypeScript + Vite + Shadcn/UI + TailwindCSS frontend for the RPG Todo application.

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── layout/      # Layout components (Header, etc.)
│   │   └── ...          # Feature components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilities
│   └── App.tsx          # Main app component
└── package.json
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Shadcn/UI** - Component library
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **date-fns** - Date utilities

## API Integration

The app communicates with the Express backend at `http://localhost:3000/api`. All API calls include JWT authentication tokens automatically.

## Features

- User authentication (register, login, logout)
- Task management (CRUD operations)
- RPG progression system (XP, levels)
- Achievement tracking
- Real-time notifications for XP and level-ups
- Responsive design for all devices

