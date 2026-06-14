import apiClient from './client'
import type {
  ApiResponse, PlacementReadiness, PlacementPrediction,
  StudentDashboard, OfficerDashboard, AdminDashboard, ScoringRule, StudentReadinessReport
} from '@/types'

export const analyticsApi = {
  getReadinessScore: () =>
    apiClient.get<ApiResponse<PlacementReadiness>>('/analytics/readiness-score'),

  getPrediction: () =>
    apiClient.get<ApiResponse<PlacementPrediction>>('/analytics/prediction'),

  getStudentDashboard: () =>
    apiClient.get<ApiResponse<StudentDashboard>>('/analytics/student-dashboard'),

  getOfficerDashboard: () =>
    apiClient.get<ApiResponse<OfficerDashboard>>('/analytics/officer-dashboard'),

  getAdminDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboard>>('/analytics/admin-dashboard'),

  getScoringRules: () =>
    apiClient.get<ApiResponse<ScoringRule[]>>('/analytics/scoring-rules'),

  updateScoringRule: (id: string, data: { weightPercent: number; isActive: boolean }) =>
    apiClient.put<ApiResponse<ScoringRule>>(`/analytics/scoring-rules/${id}`, data),

  getStudentReadinessReport: () =>
    apiClient.get<ApiResponse<StudentReadinessReport[]>>('/analytics/reports/student-readiness'),
}
