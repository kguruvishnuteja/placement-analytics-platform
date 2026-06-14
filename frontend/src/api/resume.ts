import apiClient from './client'
import type { ApiResponse, ResumeAnalysis } from '@/types'

export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<ResumeAnalysis>>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getLatest: () =>
    apiClient.get<ApiResponse<ResumeAnalysis>>('/resume/latest'),

  getHistory: () =>
    apiClient.get<ApiResponse<ResumeAnalysis[]>>('/resume/history'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ResumeAnalysis>>(`/resume/${id}`),
}
