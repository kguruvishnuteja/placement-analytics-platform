using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Company;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Application.Services.Implementations;

public class CompanyService : ICompanyService
{
    private readonly IRepository<Company> _companyRepo;
    private readonly IRepository<CompanySkill> _companySkillRepo;
    private readonly IRepository<Skill> _skillRepo;
    private readonly IRepository<Student> _studentRepo;
    private readonly IRepository<StudentEligibility> _eligibilityRepo;
    private readonly IRepository<RecruitmentDrive> _driveRepo;
    private readonly IUnitOfWork _unitOfWork;

    public CompanyService(
        IRepository<Company> companyRepo,
        IRepository<CompanySkill> companySkillRepo,
        IRepository<Skill> skillRepo,
        IRepository<Student> studentRepo,
        IRepository<StudentEligibility> eligibilityRepo,
        IRepository<RecruitmentDrive> driveRepo,
        IUnitOfWork unitOfWork)
    {
        _companyRepo = companyRepo;
        _companySkillRepo = companySkillRepo;
        _skillRepo = skillRepo;
        _studentRepo = studentRepo;
        _eligibilityRepo = eligibilityRepo;
        _driveRepo = driveRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<CompanyDto>> CreateCompanyAsync(Guid officerUserId, CreateCompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name,
            Industry = dto.Industry,
            Description = dto.Description,
            Website = dto.Website,
            PackageLpa = dto.PackageLpa,
            JobRole = dto.JobRole,
            EligibilityCgpa = dto.EligibilityCgpa,
            MaxBacklogsAllowed = dto.MaxBacklogsAllowed,
            EligibleBranches = JsonSerializer.Serialize(dto.EligibleBranches),
            CreatedByUserId = officerUserId
        };

        await _companyRepo.AddAsync(company);
        await _unitOfWork.SaveChangesAsync();

        foreach (var skillId in dto.RequiredSkillIds)
        {
            await _companySkillRepo.AddAsync(new CompanySkill
            {
                CompanyId = company.Id,
                SkillId = skillId,
                IsRequired = true
            });
        }
        await _unitOfWork.SaveChangesAsync();

        return await GetCompanyByIdAsync(company.Id);
    }

    public async Task<ApiResponse<CompanyDto>> UpdateCompanyAsync(Guid companyId, UpdateCompanyDto dto)
    {
        var company = await _companyRepo.GetByIdAsync(companyId);
        if (company == null) return ApiResponse<CompanyDto>.FailureResponse("Company not found.");

        company.Name = dto.Name;
        company.Industry = dto.Industry;
        company.Description = dto.Description;
        company.Website = dto.Website;
        company.PackageLpa = dto.PackageLpa;
        company.JobRole = dto.JobRole;
        company.EligibilityCgpa = dto.EligibilityCgpa;
        company.MaxBacklogsAllowed = dto.MaxBacklogsAllowed;
        company.EligibleBranches = JsonSerializer.Serialize(dto.EligibleBranches);
        company.IsActive = dto.IsActive;
        company.UpdatedAt = DateTime.UtcNow;
        _companyRepo.Update(company);

        // Update skills
        var existingSkills = await _companySkillRepo.FindAsync(cs => cs.CompanyId == companyId);
        _companySkillRepo.RemoveRange(existingSkills);
        foreach (var skillId in dto.RequiredSkillIds)
        {
            await _companySkillRepo.AddAsync(new CompanySkill
            {
                CompanyId = companyId,
                SkillId = skillId,
                IsRequired = true
            });
        }
        await _unitOfWork.SaveChangesAsync();

        return await GetCompanyByIdAsync(companyId);
    }

    public async Task<ApiResponse<bool>> DeleteCompanyAsync(Guid companyId)
    {
        var company = await _companyRepo.GetByIdAsync(companyId);
        if (company == null) return ApiResponse<bool>.FailureResponse("Company not found.");

        company.IsDeleted = true;
        _companyRepo.Update(company);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Company deleted.");
    }

    public async Task<ApiResponse<CompanyDto>> GetCompanyByIdAsync(Guid companyId)
    {
        var company = await _companyRepo.Query()
            .Include(c => c.RequiredSkills).ThenInclude(cs => cs.Skill)
            .FirstOrDefaultAsync(c => c.Id == companyId && !c.IsDeleted);

        if (company == null) return ApiResponse<CompanyDto>.FailureResponse("Company not found.");
        return ApiResponse<CompanyDto>.SuccessResponse(MapToDto(company));
    }

    public async Task<ApiResponse<List<CompanyDto>>> GetAllCompaniesAsync(PagedRequest request)
    {
        var query = _companyRepo.Query()
            .Include(c => c.RequiredSkills).ThenInclude(cs => cs.Skill)
            .Where(c => !c.IsDeleted && c.IsActive);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(term) || c.Industry.ToLower().Contains(term));
        }

        var companies = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return ApiResponse<List<CompanyDto>>.SuccessResponse(companies.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<List<EligibilityResultDto>>> GetEligibleCompaniesForStudentAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return ApiResponse<List<EligibilityResultDto>>.FailureResponse("Student not found.");

        var companies = await _companyRepo.Query()
            .Include(c => c.RequiredSkills).ThenInclude(cs => cs.Skill)
            .Where(c => !c.IsDeleted && c.IsActive)
            .ToListAsync();

        var results = companies.Select(c => EvaluateEligibility(student, c)).ToList();
        return ApiResponse<List<EligibilityResultDto>>.SuccessResponse(results);
    }

    public async Task<ApiResponse<EligibilityResultDto>> CheckEligibilityAsync(Guid userId, Guid companyId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        var company = await _companyRepo.Query()
            .Include(c => c.RequiredSkills).ThenInclude(cs => cs.Skill)
            .FirstOrDefaultAsync(c => c.Id == companyId && !c.IsDeleted);

        if (student == null || company == null)
            return ApiResponse<EligibilityResultDto>.FailureResponse("Student or Company not found.");

        var result = EvaluateEligibility(student, company);

        // Persist eligibility
        var existing = await _eligibilityRepo.FirstOrDefaultAsync(e =>
            e.StudentId == student.Id && e.CompanyId == companyId);

        if (existing != null)
        {
            existing.IsEligible = result.IsEligible;
            existing.EligibilityPercent = result.EligibilityPercent;
            existing.MissingSkills = JsonSerializer.Serialize(result.MissingSkills);
            existing.Reasons = JsonSerializer.Serialize(result.Reasons);
            existing.EvaluatedAt = DateTime.UtcNow;
            _eligibilityRepo.Update(existing);
        }
        else
        {
            await _eligibilityRepo.AddAsync(new StudentEligibility
            {
                StudentId = student.Id,
                CompanyId = companyId,
                IsEligible = result.IsEligible,
                EligibilityPercent = result.EligibilityPercent,
                MissingSkills = JsonSerializer.Serialize(result.MissingSkills),
                Reasons = JsonSerializer.Serialize(result.Reasons),
                EvaluatedAt = DateTime.UtcNow
            });
        }
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<EligibilityResultDto>.SuccessResponse(result);
    }

    public async Task<ApiResponse<SkillGapDto>> GetSkillGapAsync(Guid userId, Guid companyId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        var company = await _companyRepo.Query()
            .Include(c => c.RequiredSkills).ThenInclude(cs => cs.Skill)
            .FirstOrDefaultAsync(c => c.Id == companyId && !c.IsDeleted);

        if (student == null || company == null)
            return ApiResponse<SkillGapDto>.FailureResponse("Student or Company not found.");

        var studentSkills = student.StudentSkills
            .Select(ss => ss.Skill.Name.ToLower()).ToHashSet();
        var requiredSkills = company.RequiredSkills
            .Select(cs => cs.Skill.Name).ToList();
        var missingSkills = requiredSkills
            .Where(s => !studentSkills.Contains(s.ToLower())).ToList();
        var matchedSkills = requiredSkills
            .Where(s => studentSkills.Contains(s.ToLower())).ToList();

        var matchPercent = requiredSkills.Count > 0
            ? (decimal)matchedSkills.Count / requiredSkills.Count * 100
            : 100;

        var recommendations = missingSkills.Select((skill, idx) => new LearningRecommendationDto
        {
            SkillName = skill,
            Priority = idx == 0 ? "High" : idx < 3 ? "Medium" : "Low",
            RecommendedAction = $"Learn {skill} fundamentals and build a project",
            Resources = new List<string>
            {
                $"https://www.coursera.org/search?query={Uri.EscapeDataString(skill)}",
                $"https://www.udemy.com/courses/search/?q={Uri.EscapeDataString(skill)}"
            }
        }).ToList();

        return ApiResponse<SkillGapDto>.SuccessResponse(new SkillGapDto
        {
            CompanyId = company.Id,
            CompanyName = company.Name,
            StudentSkills = studentSkills.ToList(),
            RequiredSkills = requiredSkills,
            MissingSkills = missingSkills,
            MatchedSkills = matchedSkills,
            MatchPercent = Math.Round(matchPercent, 1),
            Recommendations = recommendations
        });
    }

    public async Task<ApiResponse<RecruitmentDriveDto>> CreateDriveAsync(CreateRecruitmentDriveDto dto)
    {
        var company = await _companyRepo.GetByIdAsync(dto.CompanyId);
        if (company == null) return ApiResponse<RecruitmentDriveDto>.FailureResponse("Company not found.");

        var drive = new RecruitmentDrive
        {
            CompanyId = dto.CompanyId,
            DriveName = dto.DriveName,
            DriveDate = dto.DriveDate,
            Venue = dto.Venue,
            Notes = dto.Notes,
            Status = "Upcoming"
        };
        await _driveRepo.AddAsync(drive);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<RecruitmentDriveDto>.SuccessResponse(new RecruitmentDriveDto
        {
            Id = drive.Id,
            CompanyId = drive.CompanyId,
            CompanyName = company.Name,
            DriveName = drive.DriveName,
            DriveDate = drive.DriveDate,
            Venue = drive.Venue,
            Status = drive.Status,
            Notes = drive.Notes
        });
    }

    public async Task<ApiResponse<List<RecruitmentDriveDto>>> GetDrivesAsync()
    {
        var drives = await _driveRepo.Query()
            .Include(d => d.Company)
            .Where(d => !d.IsDeleted)
            .OrderByDescending(d => d.DriveDate)
            .ToListAsync();

        return ApiResponse<List<RecruitmentDriveDto>>.SuccessResponse(drives.Select(d => new RecruitmentDriveDto
        {
            Id = d.Id,
            CompanyId = d.CompanyId,
            CompanyName = d.Company?.Name ?? string.Empty,
            DriveName = d.DriveName,
            DriveDate = d.DriveDate,
            Venue = d.Venue,
            Status = d.Status,
            Notes = d.Notes
        }).ToList());
    }

    public async Task<ApiResponse<RecruitmentDriveDto>> UpdateDriveAsync(
        Guid driveId, UpdateRecruitmentDriveDto dto)
    {
        var drive = await _driveRepo.Query()
            .Include(d => d.Company)
            .FirstOrDefaultAsync(d => d.Id == driveId && !d.IsDeleted);
        if (drive == null)
            return ApiResponse<RecruitmentDriveDto>.FailureResponse("Recruitment drive not found.");

        var company = await _companyRepo.GetByIdAsync(dto.CompanyId);
        if (company == null || company.IsDeleted)
            return ApiResponse<RecruitmentDriveDto>.FailureResponse("Company not found.");

        var statuses = new[] { "Upcoming", "Ongoing", "Completed", "Cancelled" };
        if (!statuses.Contains(dto.Status, StringComparer.OrdinalIgnoreCase))
            return ApiResponse<RecruitmentDriveDto>.FailureResponse("Invalid drive status.");

        drive.CompanyId = dto.CompanyId;
        drive.Company = company;
        drive.DriveName = dto.DriveName;
        drive.DriveDate = dto.DriveDate;
        drive.Venue = dto.Venue;
        drive.Notes = dto.Notes;
        drive.Status = statuses.First(s => s.Equals(dto.Status, StringComparison.OrdinalIgnoreCase));
        drive.UpdatedAt = DateTime.UtcNow;
        _driveRepo.Update(drive);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<RecruitmentDriveDto>.SuccessResponse(MapDriveToDto(drive), "Drive updated.");
    }

    public async Task<ApiResponse<bool>> DeleteDriveAsync(Guid driveId)
    {
        var drive = await _driveRepo.GetByIdAsync(driveId);
        if (drive == null || drive.IsDeleted)
            return ApiResponse<bool>.FailureResponse("Recruitment drive not found.");

        drive.IsDeleted = true;
        drive.UpdatedAt = DateTime.UtcNow;
        _driveRepo.Update(drive);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Drive deleted.");
    }

    private static EligibilityResultDto EvaluateEligibility(Student student, Company company)
    {
        var reasons = new List<string>();
        var missingSkills = new List<string>();
        bool eligible = true;

        if (student.CurrentCgpa < company.EligibilityCgpa)
        {
            eligible = false;
            reasons.Add($"CGPA {student.CurrentCgpa} is below required {company.EligibilityCgpa}");
        }

        if (student.ActiveBacklogs > company.MaxBacklogsAllowed)
        {
            eligible = false;
            reasons.Add($"Active backlogs ({student.ActiveBacklogs}) exceed allowed ({company.MaxBacklogsAllowed})");
        }

        var branches = JsonSerializer.Deserialize<List<string>>(company.EligibleBranches) ?? new();
        if (branches.Count > 0 && !branches.Any(b => b.Equals(student.Branch, StringComparison.OrdinalIgnoreCase)))
        {
            eligible = false;
            reasons.Add($"Branch '{student.Branch}' not in eligible branches");
        }

        var studentSkillNames = student.StudentSkills
            .Select(ss => ss.Skill?.Name?.ToLower() ?? string.Empty).ToHashSet();

        foreach (var cs in company.RequiredSkills.Where(cs => cs.IsRequired))
        {
            if (!studentSkillNames.Contains(cs.Skill?.Name?.ToLower() ?? string.Empty))
            {
                missingSkills.Add(cs.Skill?.Name ?? string.Empty);
            }
        }

        int totalRequired = company.RequiredSkills.Count(cs => cs.IsRequired);
        int matched = totalRequired - missingSkills.Count;
        decimal skillMatchPercent = totalRequired > 0 ? (decimal)matched / totalRequired * 100 : 100;

        // Overall eligibility percent
        decimal cgpaOk = student.CurrentCgpa >= company.EligibilityCgpa ? 100 : 0;
        decimal backlogOk = student.ActiveBacklogs <= company.MaxBacklogsAllowed ? 100 : 0;
        decimal branchOk = (branches.Count == 0 ||
            branches.Any(b => b.Equals(student.Branch, StringComparison.OrdinalIgnoreCase))) ? 100 : 0;
        decimal eligibilityPercent = (cgpaOk + backlogOk + branchOk + skillMatchPercent) / 4;

        return new EligibilityResultDto
        {
            CompanyId = company.Id,
            CompanyName = company.Name,
            JobRole = company.JobRole,
            PackageLpa = company.PackageLpa,
            IsEligible = eligible && missingSkills.Count == 0,
            EligibilityPercent = Math.Round(eligibilityPercent, 1),
            MissingSkills = missingSkills,
            Reasons = reasons
        };
    }

    private static CompanyDto MapToDto(Company c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Industry = c.Industry,
        Description = c.Description,
        Website = c.Website,
        PackageLpa = c.PackageLpa,
        JobRole = c.JobRole,
        EligibilityCgpa = c.EligibilityCgpa,
        MaxBacklogsAllowed = c.MaxBacklogsAllowed,
        EligibleBranches = JsonSerializer.Deserialize<List<string>>(c.EligibleBranches) ?? new(),
        RequiredSkills = c.RequiredSkills?.Select(cs => cs.Skill?.Name ?? string.Empty).ToList() ?? new(),
        IsActive = c.IsActive
    };

    private static RecruitmentDriveDto MapDriveToDto(RecruitmentDrive drive) => new()
    {
        Id = drive.Id,
        CompanyId = drive.CompanyId,
        CompanyName = drive.Company?.Name ?? string.Empty,
        DriveName = drive.DriveName,
        DriveDate = drive.DriveDate,
        Venue = drive.Venue,
        Status = drive.Status,
        Notes = drive.Notes
    };
}
