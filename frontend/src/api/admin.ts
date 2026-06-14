import apiClient from './client'
import type { AdminUser, ApiResponse } from '@/types'

export interface AdminUserPayload {
  email: string
  firstName: string
  lastName: string
  role: AdminUser['role']
  isActive?: boolean
  password?: string
}

export const adminApi = {
  getUsers: (params?: {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    role?: string
    isActive?: boolean
  }) => apiClient.get<ApiResponse<AdminUser[]>>('/admin/users', { params }),

  createUser: (data: AdminUserPayload & { password: string }) =>
    apiClient.post<ApiResponse<AdminUser>>('/admin/users', data),

  updateUser: (id: string, data: AdminUserPayload & { isActive: boolean }) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data),

  deleteUser: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/admin/users/${id}`),
}
