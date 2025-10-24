import { apiClient } from './api';
import type {
  UserProfile,
  UserStats,
  XPHistoryEntry,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<{ user: UserProfile }>>('/users/profile');
    return response.data.data.user;
  },

  async updateProfile(data: { username?: string }): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<{ user: UserProfile }>>('/users/profile', data);
    
    // Update stored user
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data.data.user;
  },

  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
    return response.data.data;
  },

  async getXPHistory(page = 1, limit = 20): Promise<PaginatedResponse<XPHistoryEntry>> {
    const response = await apiClient.get<ApiResponse<{ history: PaginatedResponse<XPHistoryEntry> }>>(
      '/users/xp-history',
      { params: { page, limit } }
    );
    return response.data.data.history;
  },
};

