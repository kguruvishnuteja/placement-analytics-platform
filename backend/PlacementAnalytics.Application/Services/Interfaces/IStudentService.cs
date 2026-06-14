using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Student;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface IStudentService
{
    Task<ApiResponse<StudentProfileDto>> GetProfileAsync(Guid userId);
    Task<ApiResponse<StudentProfileDto>> UpdateProfileAsync(Guid userId, UpdateStudentProfileDto dto);
    Task<ApiResponse<List<StudentProfileDto>>> GetAllStudentsAsync(PagedRequest request);
    Task<ApiResponse<StudentProfileDto>> GetStudentByIdAsync(Guid studentId);
    Task<ApiResponse<bool>> AddSkillAsync(Guid userId, AddStudentSkillDto dto);
    Task<ApiResponse<bool>> RemoveSkillAsync(Guid userId, Guid skillId);
    Task<ApiResponse<ProjectDto>> AddProjectAsync(Guid userId, CreateProjectDto dto);
    Task<ApiResponse<bool>> UpdateProjectAsync(Guid userId, Guid projectId, CreateProjectDto dto);
    Task<ApiResponse<bool>> DeleteProjectAsync(Guid userId, Guid projectId);
    Task<ApiResponse<CertificationDto>> AddCertificationAsync(Guid userId, CreateCertificationDto dto);
    Task<ApiResponse<bool>> UpdateCertificationAsync(Guid userId, Guid certId, CreateCertificationDto dto);
    Task<ApiResponse<bool>> DeleteCertificationAsync(Guid userId, Guid certId);
    Task<ApiResponse<InternshipDto>> AddInternshipAsync(Guid userId, CreateInternshipDto dto);
    Task<ApiResponse<bool>> UpdateInternshipAsync(Guid userId, Guid internshipId, CreateInternshipDto dto);
    Task<ApiResponse<bool>> DeleteInternshipAsync(Guid userId, Guid internshipId);
    Task<ApiResponse<int>> CalculateProfileCompletionAsync(Guid userId);
}
