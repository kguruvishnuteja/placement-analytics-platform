using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Student;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Application.Services.Implementations;

public class StudentService : IStudentService
{
    private readonly IRepository<Student> _studentRepo;
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<StudentSkill> _studentSkillRepo;
    private readonly IRepository<Skill> _skillRepo;
    private readonly IRepository<Project> _projectRepo;
    private readonly IRepository<Certification> _certRepo;
    private readonly IRepository<InternshipExperience> _internshipRepo;
    private readonly IUnitOfWork _unitOfWork;

    public StudentService(
        IRepository<Student> studentRepo,
        IRepository<User> userRepo,
        IRepository<StudentSkill> studentSkillRepo,
        IRepository<Skill> skillRepo,
        IRepository<Project> projectRepo,
        IRepository<Certification> certRepo,
        IRepository<InternshipExperience> internshipRepo,
        IUnitOfWork unitOfWork)
    {
        _studentRepo = studentRepo;
        _userRepo = userRepo;
        _studentSkillRepo = studentSkillRepo;
        _skillRepo = skillRepo;
        _projectRepo = projectRepo;
        _certRepo = certRepo;
        _internshipRepo = internshipRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StudentProfileDto>> GetProfileAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.User)
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

        if (student == null)
            return ApiResponse<StudentProfileDto>.FailureResponse("Student profile not found.");

        return ApiResponse<StudentProfileDto>.SuccessResponse(MapToDto(student));
    }

    public async Task<ApiResponse<StudentProfileDto>> UpdateProfileAsync(Guid userId, UpdateStudentProfileDto dto)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            student = new Student { UserId = userId };
            await _studentRepo.AddAsync(student);
        }

        student.Phone = dto.Phone;
        student.Branch = dto.Branch;
        student.Section = dto.Section;
        student.GraduationYear = dto.GraduationYear;
        student.RollNumber = dto.RollNumber;
        student.SscPercentage = dto.SscPercentage;
        student.IntermediatePercentage = dto.IntermediatePercentage;
        student.CurrentCgpa = dto.CurrentCgpa;
        student.ActiveBacklogs = dto.ActiveBacklogs;
        student.LeetCodeProfile = dto.LeetCodeProfile;
        student.HackerRankProfile = dto.HackerRankProfile;
        student.CodeChefProfile = dto.CodeChefProfile;
        student.GitHubProfile = dto.GitHubProfile;
        student.LinkedInProfile = dto.LinkedInProfile;
        student.LeetCodeSolved = dto.LeetCodeSolved;
        student.HackerRankStars = dto.HackerRankStars;
        student.CodeChefRating = dto.CodeChefRating;
        student.GitHubRepos = dto.GitHubRepos;
        student.UpdatedAt = DateTime.UtcNow;

        student.ProfileCompletionPercent = CalculateCompletion(student);
        _studentRepo.Update(student);
        await _unitOfWork.SaveChangesAsync();

        return await GetProfileAsync(userId);
    }

    public async Task<ApiResponse<List<StudentProfileDto>>> GetAllStudentsAsync(PagedRequest request)
    {
        var query = _studentRepo.Query()
            .Include(s => s.User)
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .Where(s => !s.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.User.FirstName.ToLower().Contains(term) ||
                s.User.LastName.ToLower().Contains(term) ||
                s.User.Email.ToLower().Contains(term) ||
                s.Branch.ToLower().Contains(term) ||
                s.RollNumber.ToLower().Contains(term));
        }

        var students = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return ApiResponse<List<StudentProfileDto>>.SuccessResponse(students.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<StudentProfileDto>> GetStudentByIdAsync(Guid studentId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.User)
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.Id == studentId && !s.IsDeleted);

        if (student == null)
            return ApiResponse<StudentProfileDto>.FailureResponse("Student not found.");

        return ApiResponse<StudentProfileDto>.SuccessResponse(MapToDto(student));
    }

    public async Task<ApiResponse<bool>> AddSkillAsync(Guid userId, AddStudentSkillDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null)
            return ApiResponse<bool>.FailureResponse("Student not found.");

        var skill = await _skillRepo.GetByIdAsync(dto.SkillId);
        if (skill == null)
            return ApiResponse<bool>.FailureResponse("Skill not found.");

        var exists = await _studentSkillRepo.ExistsAsync(ss => ss.StudentId == student.Id && ss.SkillId == dto.SkillId);
        if (exists)
            return ApiResponse<bool>.FailureResponse("Skill already added.");

        await _studentSkillRepo.AddAsync(new StudentSkill
        {
            StudentId = student.Id,
            SkillId = dto.SkillId,
            ProficiencyLevel = dto.ProficiencyLevel
        });
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Skill added.");
    }

    public async Task<ApiResponse<bool>> RemoveSkillAsync(Guid userId, Guid skillId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var ss = await _studentSkillRepo.FirstOrDefaultAsync(x => x.StudentId == student.Id && x.SkillId == skillId);
        if (ss == null) return ApiResponse<bool>.FailureResponse("Skill not found in profile.");

        _studentSkillRepo.Remove(ss);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Skill removed.");
    }

    public async Task<ApiResponse<ProjectDto>> AddProjectAsync(Guid userId, CreateProjectDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<ProjectDto>.FailureResponse("Student not found.");

        var project = new Project
        {
            StudentId = student.Id,
            Title = dto.Title,
            Description = dto.Description,
            TechStack = dto.TechStack,
            GitHubUrl = dto.GitHubUrl,
            LiveUrl = dto.LiveUrl,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsOngoing = dto.IsOngoing
        };
        await _projectRepo.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<ProjectDto>.SuccessResponse(MapProjectDto(project), "Project added.");
    }

    public async Task<ApiResponse<bool>> UpdateProjectAsync(Guid userId, Guid projectId, CreateProjectDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var project = await _projectRepo.FirstOrDefaultAsync(p => p.Id == projectId && p.StudentId == student.Id);
        if (project == null) return ApiResponse<bool>.FailureResponse("Project not found.");

        project.Title = dto.Title;
        project.Description = dto.Description;
        project.TechStack = dto.TechStack;
        project.GitHubUrl = dto.GitHubUrl;
        project.LiveUrl = dto.LiveUrl;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.IsOngoing = dto.IsOngoing;
        project.UpdatedAt = DateTime.UtcNow;
        _projectRepo.Update(project);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Project updated.");
    }

    public async Task<ApiResponse<bool>> DeleteProjectAsync(Guid userId, Guid projectId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var project = await _projectRepo.FirstOrDefaultAsync(p => p.Id == projectId && p.StudentId == student.Id);
        if (project == null) return ApiResponse<bool>.FailureResponse("Project not found.");

        _projectRepo.Remove(project);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Project deleted.");
    }

    public async Task<ApiResponse<CertificationDto>> AddCertificationAsync(Guid userId, CreateCertificationDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<CertificationDto>.FailureResponse("Student not found.");

        var cert = new Certification
        {
            StudentId = student.Id,
            Name = dto.Name,
            IssuingOrganization = dto.IssuingOrganization,
            IssueDate = dto.IssueDate,
            ExpiryDate = dto.ExpiryDate,
            CredentialId = dto.CredentialId,
            CredentialUrl = dto.CredentialUrl
        };
        await _certRepo.AddAsync(cert);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<CertificationDto>.SuccessResponse(MapCertDto(cert), "Certification added.");
    }

    public async Task<ApiResponse<bool>> UpdateCertificationAsync(Guid userId, Guid certId, CreateCertificationDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var cert = await _certRepo.FirstOrDefaultAsync(c => c.Id == certId && c.StudentId == student.Id);
        if (cert == null) return ApiResponse<bool>.FailureResponse("Certification not found.");

        cert.Name = dto.Name;
        cert.IssuingOrganization = dto.IssuingOrganization;
        cert.IssueDate = dto.IssueDate;
        cert.ExpiryDate = dto.ExpiryDate;
        cert.CredentialId = dto.CredentialId;
        cert.CredentialUrl = dto.CredentialUrl;
        cert.UpdatedAt = DateTime.UtcNow;
        _certRepo.Update(cert);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Certification updated.");
    }

    public async Task<ApiResponse<bool>> DeleteCertificationAsync(Guid userId, Guid certId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var cert = await _certRepo.FirstOrDefaultAsync(c => c.Id == certId && c.StudentId == student.Id);
        if (cert == null) return ApiResponse<bool>.FailureResponse("Certification not found.");

        _certRepo.Remove(cert);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Certification deleted.");
    }

    public async Task<ApiResponse<InternshipDto>> AddInternshipAsync(Guid userId, CreateInternshipDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<InternshipDto>.FailureResponse("Student not found.");

        var internship = new InternshipExperience
        {
            StudentId = student.Id,
            CompanyName = dto.CompanyName,
            Role = dto.Role,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsCurrentlyWorking = dto.IsCurrentlyWorking,
            IsPaid = dto.IsPaid,
            Stipend = dto.Stipend
        };
        await _internshipRepo.AddAsync(internship);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<InternshipDto>.SuccessResponse(MapInternshipDto(internship), "Internship added.");
    }

    public async Task<ApiResponse<bool>> UpdateInternshipAsync(Guid userId, Guid internshipId, CreateInternshipDto dto)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var internship = await _internshipRepo.FirstOrDefaultAsync(i => i.Id == internshipId && i.StudentId == student.Id);
        if (internship == null) return ApiResponse<bool>.FailureResponse("Internship not found.");

        internship.CompanyName = dto.CompanyName;
        internship.Role = dto.Role;
        internship.Description = dto.Description;
        internship.StartDate = dto.StartDate;
        internship.EndDate = dto.EndDate;
        internship.IsCurrentlyWorking = dto.IsCurrentlyWorking;
        internship.IsPaid = dto.IsPaid;
        internship.Stipend = dto.Stipend;
        internship.UpdatedAt = DateTime.UtcNow;
        _internshipRepo.Update(internship);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Internship updated.");
    }

    public async Task<ApiResponse<bool>> DeleteInternshipAsync(Guid userId, Guid internshipId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<bool>.FailureResponse("Student not found.");

        var internship = await _internshipRepo.FirstOrDefaultAsync(i => i.Id == internshipId && i.StudentId == student.Id);
        if (internship == null) return ApiResponse<bool>.FailureResponse("Internship not found.");

        _internshipRepo.Remove(internship);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Internship deleted.");
    }

    public async Task<ApiResponse<int>> CalculateProfileCompletionAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return ApiResponse<int>.FailureResponse("Student not found.");
        var percent = CalculateCompletion(student);
        student.ProfileCompletionPercent = percent;
        _studentRepo.Update(student);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<int>.SuccessResponse(percent);
    }

    private static int CalculateCompletion(Student s)
    {
        int score = 0;
        if (!string.IsNullOrEmpty(s.Phone)) score += 10;
        if (!string.IsNullOrEmpty(s.Branch)) score += 5;
        if (!string.IsNullOrEmpty(s.RollNumber)) score += 5;
        if (s.SscPercentage > 0) score += 5;
        if (s.IntermediatePercentage > 0) score += 5;
        if (s.CurrentCgpa > 0) score += 10;
        if (s.StudentSkills?.Count > 0) score += 15;
        if (s.Projects?.Count > 0) score += 15;
        if (s.Certifications?.Count > 0) score += 10;
        if (!string.IsNullOrEmpty(s.GitHubProfile)) score += 10;
        if (!string.IsNullOrEmpty(s.LinkedInProfile)) score += 10;
        return Math.Min(score, 100);
    }

    private static StudentProfileDto MapToDto(Student s) => new()
    {
        Id = s.Id,
        UserId = s.UserId,
        Email = s.User?.Email ?? string.Empty,
        FirstName = s.User?.FirstName ?? string.Empty,
        LastName = s.User?.LastName ?? string.Empty,
        Phone = s.Phone,
        Branch = s.Branch,
        Section = s.Section,
        GraduationYear = s.GraduationYear,
        RollNumber = s.RollNumber,
        SscPercentage = s.SscPercentage,
        IntermediatePercentage = s.IntermediatePercentage,
        CurrentCgpa = s.CurrentCgpa,
        ActiveBacklogs = s.ActiveBacklogs,
        LeetCodeProfile = s.LeetCodeProfile,
        HackerRankProfile = s.HackerRankProfile,
        CodeChefProfile = s.CodeChefProfile,
        GitHubProfile = s.GitHubProfile,
        LinkedInProfile = s.LinkedInProfile,
        LeetCodeSolved = s.LeetCodeSolved,
        HackerRankStars = s.HackerRankStars,
        CodeChefRating = s.CodeChefRating,
        GitHubRepos = s.GitHubRepos,
        ProfileCompletionPercent = s.ProfileCompletionPercent,
        Skills = s.StudentSkills?.Select(ss => new SkillDto
        {
            Id = ss.SkillId,
            Name = ss.Skill?.Name ?? string.Empty,
            Category = ss.Skill?.Category ?? string.Empty,
            ProficiencyLevel = ss.ProficiencyLevel,
            IsVerified = ss.IsVerified
        }).ToList() ?? new(),
        Projects = s.Projects?.Select(MapProjectDto).ToList() ?? new(),
        Certifications = s.Certifications?.Select(MapCertDto).ToList() ?? new(),
        Internships = s.Internships?.Select(MapInternshipDto).ToList() ?? new()
    };

    private static ProjectDto MapProjectDto(Project p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Description = p.Description,
        TechStack = p.TechStack,
        GitHubUrl = p.GitHubUrl,
        LiveUrl = p.LiveUrl,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        IsOngoing = p.IsOngoing
    };

    private static CertificationDto MapCertDto(Certification c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        IssuingOrganization = c.IssuingOrganization,
        IssueDate = c.IssueDate,
        ExpiryDate = c.ExpiryDate,
        CredentialId = c.CredentialId,
        CredentialUrl = c.CredentialUrl
    };

    private static InternshipDto MapInternshipDto(InternshipExperience i) => new()
    {
        Id = i.Id,
        CompanyName = i.CompanyName,
        Role = i.Role,
        Description = i.Description,
        StartDate = i.StartDate,
        EndDate = i.EndDate,
        IsCurrentlyWorking = i.IsCurrentlyWorking,
        IsPaid = i.IsPaid,
        Stipend = i.Stipend
    };
}
