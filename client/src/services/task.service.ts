import { apiClient } from './api';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  CompleteTaskResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<ApiResponse<{
      tasks: Task[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>(
      '/tasks',
      { params: filters }
    );
    
    // Transform backend response to PaginatedResponse format
    return {
      items: response.data.data.tasks,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      limit: response.data.data.pagination.limit,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<{ task: Task }>>(`/tasks/${taskId}`);
    return response.data.data.task;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await apiClient.post<ApiResponse<{ task: Task }>>('/tasks', data);
    return response.data.data.task;
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await apiClient.put<ApiResponse<{ task: Task }>>(`/tasks/${taskId}`, data);
    return response.data.data.task;
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async completeTask(taskId: string): Promise<CompleteTaskResponse> {
    const response = await apiClient.patch<ApiResponse<CompleteTaskResponse>>(
      `/tasks/${taskId}/complete`
    );
    return response.data.data;
  },

  async archiveTask(taskId: string): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${taskId}/archive`);
    return response.data.data.task;
  },

  async unarchiveTask(taskId: string): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${taskId}/unarchive`);
    return response.data.data.task;
  },
};

