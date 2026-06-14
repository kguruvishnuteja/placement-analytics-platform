namespace PlacementAnalytics.Application.DTOs.Company;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public decimal PackageLpa { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public decimal EligibilityCgpa { get; set; }
    public int MaxBacklogsAllowed { get; set; }
    public List<string> EligibleBranches { get; set; } = new();
    public List<string> RequiredSkills { get; set; } = new();
    public bool IsActive { get; set; }
}

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public decimal PackageLpa { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public decimal EligibilityCgpa { get; set; }
    public int MaxBacklogsAllowed { get; set; }
    public List<string> EligibleBranches { get; set; } = new();
    public List<Guid> RequiredSkillIds { get; set; } = new();
}

public class UpdateCompanyDto : CreateCompanyDto
{
    public bool IsActive { get; set; } = true;
}

public class EligibilityResultDto
{
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobRole { get; set; } = string.Empty;
    public decimal PackageLpa { get; set; }
    public bool IsEligible { get; set; }
    public decimal EligibilityPercent { get; set; }
    public List<string> MissingSkills { get; set; } = new();
    public List<string> Reasons { get; set; } = new();
}

public class SkillGapDto
{
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public List<string> StudentSkills { get; set; } = new();
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> MissingSkills { get; set; } = new();
    public List<string> MatchedSkills { get; set; } = new();
    public decimal MatchPercent { get; set; }
    public List<LearningRecommendationDto> Recommendations { get; set; } = new();
}

public class LearningRecommendationDto
{
    public string SkillName { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; // High, Medium, Low
    public string RecommendedAction { get; set; } = string.Empty;
    public List<string> Resources { get; set; } = new();
}

public class RecruitmentDriveDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string DriveName { get; set; } = string.Empty;
    public DateTime DriveDate { get; set; }
    public string? Venue { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateRecruitmentDriveDto
{
    public Guid CompanyId { get; set; }
    public string DriveName { get; set; } = string.Empty;
    public DateTime DriveDate { get; set; }
    public string? Venue { get; set; }
    public string? Notes { get; set; }
}

public class UpdateRecruitmentDriveDto : CreateRecruitmentDriveDto
{
    public string Status { get; set; } = "Upcoming";
}
