using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Analytics;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface IAnalyticsService
{
    Task<ApiResponse<PlacementReadinessDto>> CalculateReadinessScoreAsync(Guid userId);
    Task<ApiResponse<PlacementPredictionDto>> GetPredictionAsync(Guid userId);
    Task<ApiResponse<StudentDashboardDto>> GetStudentDashboardAsync(Guid userId);
    Task<ApiResponse<OfficerDashboardDto>> GetOfficerDashboardAsync();
    Task<ApiResponse<AdminDashboardDto>> GetAdminDashboardAsync();
    Task<ApiResponse<List<ScoringRuleDto>>> GetScoringRulesAsync();
    Task<ApiResponse<ScoringRuleDto>> UpdateScoringRuleAsync(Guid ruleId, UpdateScoringRuleDto dto);
    Task<ApiResponse<List<StudentReadinessReportDto>>> GetStudentReadinessReportAsync();
}
