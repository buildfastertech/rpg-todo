import { apiClient } from './api';

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
    const response = await apiClient.get<Label[]>('/labels');
    return response.data;
  },

  async getLabelById(id: string): Promise<Label> {
    const response = await apiClient.get<Label>(`/labels/${id}`);
    return response.data;
  },

  async createLabel(data: CreateLabelDTO): Promise<Label> {
    const response = await apiClient.post<Label>('/labels', data);
    return response.data;
  },

  async updateLabel(id: string, data: UpdateLabelDTO): Promise<Label> {
    const response = await apiClient.put<Label>(`/labels/${id}`, data);
    return response.data;
  },

  async deleteLabel(id: string): Promise<void> {
    await apiClient.delete(`/labels/${id}`);
  },
};

