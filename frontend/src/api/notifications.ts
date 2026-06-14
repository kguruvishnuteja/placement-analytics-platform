import apiClient from './client'
import type { ApiResponse, NotificationItem } from '@/types'

export const notificationsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<NotificationItem[]>>('/notifications'),

  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/notifications/read-all'),
}
