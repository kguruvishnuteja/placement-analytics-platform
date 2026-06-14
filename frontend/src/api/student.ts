import apiClient from './client'
import type { ApiResponse, StudentProfile, Project, Certification, Internship } from '@/types'

export const studentApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<StudentProfile>>('/student/profile'),

  updateProfile: (data: Partial<StudentProfile>) =>
    apiClient.put<ApiResponse<StudentProfile>>('/student/profile', data),

  getAllStudents: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    apiClient.get<ApiResponse<StudentProfile[]>>('/student', { params }),

  getStudentById: (id: string) =>
    apiClient.get<ApiResponse<StudentProfile>>(`/student/${id}`),

  addSkill: (data: { skillId: string; proficiencyLevel: number }) =>
    apiClient.post('/student/skills', data),

  removeSkill: (skillId: string) =>
    apiClient.delete(`/student/skills/${skillId}`),

  addProject: (data: Omit<Project, 'id'>) =>
    apiClient.post<ApiResponse<Project>>('/student/projects', data),

  updateProject: (id: string, data: Omit<Project, 'id'>) =>
    apiClient.put(`/student/projects/${id}`, data),

  deleteProject: (id: string) =>
    apiClient.delete(`/student/projects/${id}`),

  addCertification: (data: Omit<Certification, 'id'>) =>
    apiClient.post<ApiResponse<Certification>>('/student/certifications', data),

  updateCertification: (id: string, data: Omit<Certification, 'id'>) =>
    apiClient.put(`/student/certifications/${id}`, data),

  deleteCertification: (id: string) =>
    apiClient.delete(`/student/certifications/${id}`),

  addInternship: (data: Omit<Internship, 'id'>) =>
    apiClient.post<ApiResponse<Internship>>('/student/internships', data),

  updateInternship: (id: string, data: Omit<Internship, 'id'>) =>
    apiClient.put(`/student/internships/${id}`, data),

  deleteInternship: (id: string) =>
    apiClient.delete(`/student/internships/${id}`),

  getProfileCompletion: () =>
    apiClient.get<ApiResponse<number>>('/student/profile-completion'),
}
