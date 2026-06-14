using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Company;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface ICompanyService
{
    Task<ApiResponse<CompanyDto>> CreateCompanyAsync(Guid officerUserId, CreateCompanyDto dto);
    Task<ApiResponse<CompanyDto>> UpdateCompanyAsync(Guid companyId, UpdateCompanyDto dto);
    Task<ApiResponse<bool>> DeleteCompanyAsync(Guid companyId);
    Task<ApiResponse<CompanyDto>> GetCompanyByIdAsync(Guid companyId);
    Task<ApiResponse<List<CompanyDto>>> GetAllCompaniesAsync(PagedRequest request);
    Task<ApiResponse<List<EligibilityResultDto>>> GetEligibleCompaniesForStudentAsync(Guid userId);
    Task<ApiResponse<EligibilityResultDto>> CheckEligibilityAsync(Guid userId, Guid companyId);
    Task<ApiResponse<SkillGapDto>> GetSkillGapAsync(Guid userId, Guid companyId);
    Task<ApiResponse<RecruitmentDriveDto>> CreateDriveAsync(CreateRecruitmentDriveDto dto);
    Task<ApiResponse<RecruitmentDriveDto>> UpdateDriveAsync(Guid driveId, UpdateRecruitmentDriveDto dto);
    Task<ApiResponse<bool>> DeleteDriveAsync(Guid driveId);
    Task<ApiResponse<List<RecruitmentDriveDto>>> GetDrivesAsync();
}
