namespace PlacementAnalytics.Application.DTOs.Student;

public class StudentProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int GraduationYear { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public decimal SscPercentage { get; set; }
    public decimal IntermediatePercentage { get; set; }
    public decimal CurrentCgpa { get; set; }
    public int ActiveBacklogs { get; set; }
    public string? LeetCodeProfile { get; set; }
    public string? HackerRankProfile { get; set; }
    public string? CodeChefProfile { get; set; }
    public string? GitHubProfile { get; set; }
    public string? LinkedInProfile { get; set; }
    public int LeetCodeSolved { get; set; }
    public int HackerRankStars { get; set; }
    public int CodeChefRating { get; set; }
    public int GitHubRepos { get; set; }
    public int ProfileCompletionPercent { get; set; }
    public List<SkillDto> Skills { get; set; } = new();
    public List<ProjectDto> Projects { get; set; } = new();
    public List<CertificationDto> Certifications { get; set; } = new();
    public List<InternshipDto> Internships { get; set; } = new();
}

public class UpdateStudentProfileDto
{
    public string Phone { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int GraduationYear { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public decimal SscPercentage { get; set; }
    public decimal IntermediatePercentage { get; set; }
    public decimal CurrentCgpa { get; set; }
    public int ActiveBacklogs { get; set; }
    public string? LeetCodeProfile { get; set; }
    public string? HackerRankProfile { get; set; }
    public string? CodeChefProfile { get; set; }
    public string? GitHubProfile { get; set; }
    public string? LinkedInProfile { get; set; }
    public int LeetCodeSolved { get; set; }
    public int HackerRankStars { get; set; }
    public int CodeChefRating { get; set; }
    public int GitHubRepos { get; set; }
}

public class SkillDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int ProficiencyLevel { get; set; }
    public bool IsVerified { get; set; }
}

public class AddStudentSkillDto
{
    public Guid SkillId { get; set; }
    public int ProficiencyLevel { get; set; } = 1;
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string? GitHubUrl { get; set; }
    public string? LiveUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsOngoing { get; set; }
}

public class CreateProjectDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string? GitHubUrl { get; set; }
    public string? LiveUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsOngoing { get; set; }
}

public class CertificationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
}

public class CreateCertificationDto
{
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
}

public class InternshipDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentlyWorking { get; set; }
    public bool IsPaid { get; set; }
    public decimal? Stipend { get; set; }
}

public class CreateInternshipDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentlyWorking { get; set; }
    public bool IsPaid { get; set; }
    public decimal? Stipend { get; set; }
}
