import apiClient from './client'
import type { ApiResponse, Skill } from '@/types'

export const skillsApi = {
  getAll: (category?: string) =>
    apiClient.get<ApiResponse<Skill[]>>('/skills', { params: category ? { category } : {} }),

  create: (data: { name: string; category: string; description?: string }) =>
    apiClient.post<ApiResponse<Skill>>('/skills', data),

  delete: (id: string) =>
    apiClient.delete(`/skills/${id}`),
}
