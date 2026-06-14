using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Student;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface ISkillService
{
    Task<ApiResponse<List<SkillDto>>> GetAllSkillsAsync(string? category = null);
    Task<ApiResponse<SkillDto>> CreateSkillAsync(string name, string category, string? description = null);
    Task<ApiResponse<bool>> DeleteSkillAsync(Guid skillId);
}
