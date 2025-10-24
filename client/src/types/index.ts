// User types
export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  createdAt: string;
}

export interface UserProfile extends User {
  totalXp: number;
  completedTaskCount: number;
  achievementCount: number;
}

export interface UserStats {
  user: User;
  totalXp: number;
  level: number;
  xpForNextLevel: number;
  completedTaskCount: number;
  achievementCount: number;
  weeklyActivity: {
    tasksCompleted: number;
    xpEarned: number;
  };
}

export interface XPHistoryEntry {
  id: string;
  xpValue: number;
  description: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    xpAwarded?: number;
    newTotalXp?: number;
    newLevel?: number;
    leveledUp?: boolean;
  };
}

// Task types
export type TaskStatus = 'open' | 'completed' | 'archived';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  xpValue: number;
  category?: string;
  labels: Array<string | { id: string; label_name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  category?: string;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  category?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  label?: string;
  sortBy?: 'due_date' | 'priority' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CompleteTaskResponse {
  task: Task;
  xpAwarded: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements?: Achievement[];
}

// Achievement types
export type AchievementType = 'task_milestone' | 'level_milestone' | 'special';

export interface Achievement {
  id: string;
  achievementName: string;
  achievementDescription: string;
  achievementType: AchievementType;
  requirementValue: number | null;
}

export interface UserAchievement extends Achievement {
  unlockedAt: string;
}

export interface AchievementProgress extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress?: number;
  required?: number;
}

export interface AchievementWithProgress {
  id: string;
  achievementName: string;
  achievementDescription: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  current?: number;
  required?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

