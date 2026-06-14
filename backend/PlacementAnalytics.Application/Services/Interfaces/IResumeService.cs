using Microsoft.AspNetCore.Http;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Resume;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface IResumeService
{
    Task<ApiResponse<ResumeAnalysisDto>> AnalyzeResumeAsync(Guid userId, IFormFile file);
    Task<ApiResponse<ResumeAnalysisDto>> GetLatestAnalysisAsync(Guid userId);
    Task<ApiResponse<List<ResumeAnalysisDto>>> GetAnalysisHistoryAsync(Guid userId);
    Task<ApiResponse<ResumeAnalysisDto>> GetAnalysisByIdAsync(Guid analysisId);
}
