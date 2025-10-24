import { apiClient } from './api';
import type {
  Achievement,
  UserAchievement,
  AchievementProgress,
  ApiResponse,
} from '@/types';

export const achievementService = {
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<ApiResponse<{ achievements: Achievement[]; count: number }>>(
      '/achievements'
    );
    return response.data.data.achievements;
  },

  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await apiClient.get<ApiResponse<{ achievements: UserAchievement[]; count: number }>>(
      '/achievements/user'
    );
    return response.data.data.achievements;
  },

  async getAchievementsWithProgress(): Promise<{
    achievements: AchievementProgress[];
    totalCount: number;
    unlockedCount: number;
    lockedCount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      achievements: AchievementProgress[];
      totalCount: number;
      unlockedCount: number;
      lockedCount: number;
    }>>('/achievements/progress');
    return response.data.data;
  },

  async checkAchievements(): Promise<Achievement[]> {
    const response = await apiClient.post<ApiResponse<{ newAchievements: Achievement[]; count: number }>>(
      '/achievements/check'
    );
    return response.data.data.newAchievements;
  },
};

