import supabase from '../config/supabase';
import { BadRequestError } from '../utils/errors.util';

interface Achievement {
  id: string;
  achievementName: string;
  achievementDescription: string;
  achievementType: 'task_milestone' | 'level_milestone' | 'special';
  requirementValue: number | null;
}

interface UserAchievement extends Achievement {
  unlockedAt: string;
}

interface AchievementProgress extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress?: number;
  required?: number;
}

export const achievementService = {
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('achievement_type', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) {
      throw new BadRequestError(`Failed to fetch achievements: ${error.message}`);
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      achievementName: a.achievement_name,
      achievementDescription: a.achievement_description,
      achievementType: a.achievement_type,
      requirementValue: a.requirement_value,
    }));
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('achievement_user')
      .select(`
        unlocked_at,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new BadRequestError(`Failed to fetch user achievements: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.achievement.id,
      achievementName: item.achievement.achievement_name,
      achievementDescription: item.achievement.achievement_description,
      achievementType: item.achievement.achievement_type,
      requirementValue: item.achievement.requirement_value,
      unlockedAt: item.unlocked_at,
    }));
  },

  async getAchievementsWithProgress(userId: string): Promise<AchievementProgress[]> {
    // Get all achievements
    const allAchievements = await this.getAllAchievements();

    // Get user's unlocked achievements
    const unlockedAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

    // Get user stats for progress calculation
    const { data: user } = await supabase
      .from('users')
      .select('level')
      .eq('id', userId)
      .single();

    const { data: completedTaskCount } = await supabase
      .rpc('get_completed_task_count', { p_user_id: userId } as any);

    // Map achievements with progress
    const achievementsWithProgress: AchievementProgress[] = allAchievements.map((achievement) => {
      const isUnlocked = unlockedIds.has(achievement.id);
      const unlockedAchievement = unlockedAchievements.find((a) => a.id === achievement.id);

      let progress: number | undefined;
      let required: number | undefined;

      if (!isUnlocked) {
        // Calculate progress based on type
        if (achievement.achievementType === 'task_milestone') {
          progress = completedTaskCount || 0;
          required = achievement.requirementValue || 0;
        } else if (achievement.achievementType === 'level_milestone') {
          const userData: any = user;
          progress = userData?.level || 1;
          required = achievement.requirementValue || 0;
        } else if (achievement.achievementType === 'special') {
          // Special achievements don't show numeric progress
          progress = undefined;
          required = undefined;
        }
      }

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockedAchievement?.unlockedAt || null,
        progress,
        required,
      };
    });

    return achievementsWithProgress;
  },

  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    // Get user stats
    const { data: user } = await supabase
      .from('users')
      .select('level')
      .eq('id', userId)
      .single();

    const { data: completedTaskCount } = await supabase
      .rpc('get_completed_task_count', { p_user_id: userId } as any);

    // Get all achievements
    const allAchievements = await this.getAllAchievements();

    // Get already unlocked achievements
    const unlockedAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      let shouldUnlock = false;

      // Check task milestones
      if (achievement.achievementType === 'task_milestone') {
        const required = achievement.requirementValue || 0;
        if ((completedTaskCount || 0) >= required) {
          shouldUnlock = true;
        }
      }

      // Check level milestones
      if (achievement.achievementType === 'level_milestone') {
        const required = achievement.requirementValue || 0;
        const userData: any = user;
        if ((userData?.level || 1) >= required) {
          shouldUnlock = true;
        }
      }

      // Check special achievements (Efficiency Master)
      if (achievement.achievementType === 'special' && achievement.achievementName === 'Efficiency Master') {
        // Check if all urgent tasks this week are completed
        const { data: urgentTasksThisWeek } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('user_id', userId)
          .eq('priority', 'Urgent')
          .gte('due_date', this.getStartOfWeek())
          .lt('due_date', this.getEndOfWeek());

        const urgentData: any = urgentTasksThisWeek;
        if (urgentData && urgentData.length > 0) {
          const allCompleted = urgentData.every((task: any) => task.status === 'completed');
          if (allCompleted) {
            shouldUnlock = true;
          }
        }
      }

      // Unlock achievement
      if (shouldUnlock) {
        const { error } = await supabase
          .from('achievement_user')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          } as any);

        if (!error) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  },

  getStartOfWeek(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  },

  getEndOfWeek(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek.toISOString();
  },
};

