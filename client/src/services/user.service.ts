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
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data.data;
  },

  async updateProfile(data: { username?: string }): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/users/profile', data);
    
    // Update stored user
    localStorage.setItem('user', JSON.stringify(response.data.data));
    
    return response.data.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
    return response.data.data;
  },

  async getXPHistory(page = 1, limit = 20): Promise<PaginatedResponse<XPHistoryEntry>> {
    const response = await apiClient.get<ApiResponse<{ history: XPHistoryEntry[]; count: number; limit: number }>>(
      '/users/xp-history',
      { params: { page, limit } }
    );
    
    // Transform backend response to paginated format
    const { history, count } = response.data.data;
    return {
      items: history,
      total: count,
      page: page,
      limit: limit,
      totalPages: Math.ceil(count / limit),
    };
  },
};

