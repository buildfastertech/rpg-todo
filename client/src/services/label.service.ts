import { apiClient } from './api';
import type { ApiResponse } from '@/types';

export interface Label {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelDTO {
  name: string;
  color?: string;
}

export interface UpdateLabelDTO {
  name?: string;
  color?: string;
}

export const labelService = {
  async getLabels(): Promise<Label[]> {
    const response = await apiClient.get<ApiResponse<Label[]>>('/labels');
    return response.data.data;
  },

  async getLabelById(id: string): Promise<Label> {
    const response = await apiClient.get<ApiResponse<Label>>(`/labels/${id}`);
    return response.data.data;
  },

  async createLabel(data: CreateLabelDTO): Promise<Label> {
    const response = await apiClient.post<ApiResponse<Label>>('/labels', data);
    return response.data.data;
  },

  async updateLabel(id: string, data: UpdateLabelDTO): Promise<Label> {
    const response = await apiClient.put<ApiResponse<Label>>(`/labels/${id}`, data);
    return response.data.data;
  },

  async deleteLabel(id: string): Promise<void> {
    await apiClient.delete(`/labels/${id}`);
  },
};

