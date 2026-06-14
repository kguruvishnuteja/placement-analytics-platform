import apiClient from './client'
import type { ApiResponse, Company, EligibilityResult, SkillGap, RecruitmentDrive } from '@/types'

export const companyApi = {
  getAll: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    apiClient.get<ApiResponse<Company[]>>('/company', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Company>>(`/company/${id}`),

  create: (data: Partial<Company> & { requiredSkillIds?: string[] }) =>
    apiClient.post<ApiResponse<Company>>('/company', data),

  update: (id: string, data: Partial<Company> & { requiredSkillIds?: string[] }) =>
    apiClient.put<ApiResponse<Company>>(`/company/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/company/${id}`),

  checkEligibility: (companyId: string) =>
    apiClient.get<ApiResponse<EligibilityResult>>(`/company/${companyId}/eligibility`),

  getSkillGap: (companyId: string) =>
    apiClient.get<ApiResponse<SkillGap>>(`/company/${companyId}/skill-gap`),

  getEligibleCompanies: () =>
    apiClient.get<ApiResponse<EligibilityResult[]>>('/company/eligible'),

  createDrive: (data: Partial<RecruitmentDrive>) =>
    apiClient.post<ApiResponse<RecruitmentDrive>>('/company/drives', data),

  getDrives: () =>
    apiClient.get<ApiResponse<RecruitmentDrive[]>>('/company/drives'),

  updateDrive: (id: string, data: Partial<RecruitmentDrive>) =>
    apiClient.put<ApiResponse<RecruitmentDrive>>(`/company/drives/${id}`, data),

  deleteDrive: (id: string) =>
    apiClient.delete<ApiResponse<boolean>>(`/company/drives/${id}`),
}
