import apiClient from './client'
import type { ApiResponse, AuthResponse } from '@/types'

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', data),

  verifyEmail: (data: { token: string; email: string }) =>
    apiClient.post('/auth/verify-email', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
}
