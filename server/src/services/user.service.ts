import supabase from '../config/supabase';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors.util';
import type { UpdateProfileInput } from '../validators/user.validator';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  totalXp: number;
  completedTaskCount: number;
  achievementsCount: number;
  registrationDate: string;
}

interface UserStats {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  completedTaskCount: number;
  achievementsCount: number;
  recentActivity: {
    tasksCompletedThisWeek: number;
    xpEarnedThisWeek: number;
    lastLoginDate: string | null;
  };
}

interface XPHistoryEntry {
  id: string;
  description: string;
  xpValue: number;
  taskId: string | null;
  createdAt: string;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile> {
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, level, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new NotFoundError('User not found');
    }

    // Get total XP from ledger
    const { data: totalXp, error: xpError } = await supabase
      .rpc('get_user_total_xp', { p_user_id: userId } as any);

    if (xpError) {
      console.error('Error getting total XP:', xpError);
    }

    // Get completed task count
    const { data: completedTaskCount, error: taskError } = await supabase
      .rpc('get_completed_task_count', { p_user_id: userId } as any);

    if (taskError) {
      console.error('Error getting completed task count:', taskError);
    }

    // Get achievements count
    const { count: achievementsCount, error: achievementError } = await supabase
      .from('achievement_user')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (achievementError) {
      console.error('Error getting achievements count:', achievementError);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      totalXp: totalXp || 0,
      completedTaskCount: completedTaskCount || 0,
      achievementsCount: achievementsCount || 0,
      registrationDate: user.created_at,
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    if (input.username) {
      // Check if username is already taken by another user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', input.username)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        throw new ConflictError('Username already taken');
      }

      // Update username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: input.username } as any)
        .eq('id', userId);

      if (updateError) {
        throw new BadRequestError('Failed to update profile');
      }
    }

    // Return updated profile
    return this.getProfile(userId);
  },

  async getStats(userId: string): Promise<UserStats> {
    // Get user level and total XP
    const { data: user } = await supabase
      .from('users')
      .select('level')
      .eq('id', userId)
      .single();

    const { data: totalXp } = await supabase
      .rpc('get_user_total_xp', { p_user_id: userId } as any);

    // Calculate XP to next level
    const currentLevel = user?.level || 1;
    const nextLevelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 14500,
      18500, 23000, 28000, 33500, 39500, 46000, 53000, 60500, 68500,
      77000, 86000, 95500, 105500, 116000, 127000, 138500, 150500, 163000, 176000,
    ];
    const nextLevelXp = nextLevelThresholds[currentLevel] || 999999;
    const xpToNextLevel = Math.max(0, nextLevelXp - (totalXp || 0));

    // Get completed task count
    const { data: completedTaskCount } = await supabase
      .rpc('get_completed_task_count', { p_user_id: userId } as any);

    // Get achievements count
    const { count: achievementsCount } = await supabase
      .from('achievement_user')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get tasks completed this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: tasksCompletedThisWeek } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('updated_at', startOfWeek.toISOString());

    // Get XP earned this week
    const { data: xpThisWeek } = await supabase
      .from('points_ledger')
      .select('xp_value')
      .eq('user_id', userId)
      .gte('created_at', startOfWeek.toISOString());

    const xpEarnedThisWeek = xpThisWeek?.reduce((sum: number, entry: any) => sum + entry.xp_value, 0) || 0;

    // Get last login date (most recent "Daily login" entry)
    const { data: lastLogin } = await supabase
      .from('points_ledger')
      .select('created_at')
      .eq('user_id', userId)
      .eq('description', 'Daily login')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      level: currentLevel,
      totalXp: totalXp || 0,
      xpToNextLevel,
      completedTaskCount: completedTaskCount || 0,
      achievementsCount: achievementsCount || 0,
      recentActivity: {
        tasksCompletedThisWeek: tasksCompletedThisWeek || 0,
        xpEarnedThisWeek,
        lastLoginDate: lastLogin?.created_at || null,
      },
    };
  },

  async getXPHistory(userId: string, limit: number = 20): Promise<XPHistoryEntry[]> {
    const { data, error } = await supabase
      .from('points_ledger')
      .select('id, description, xp_value, task_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new BadRequestError('Failed to fetch XP history');
    }

    return (data || []).map((entry: any) => ({
      id: entry.id,
      description: entry.description,
      xpValue: entry.xp_value,
      taskId: entry.task_id,
      createdAt: entry.created_at,
    }));
  },

  async deleteAccount(userId: string): Promise<void> {
    // Delete user account - CASCADE will handle related records
    // (tasks, points_ledger, achievement_user, custom_labels via task deletion)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new BadRequestError(`Failed to delete account: ${error.message}`);
    }
  },
};

