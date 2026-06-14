using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public decimal PackageLpa { get; set; }
    public string JobRole { get; set; } = string.Empty;
    public decimal EligibilityCgpa { get; set; }
    public int MaxBacklogsAllowed { get; set; } = 0;
    public string EligibleBranches { get; set; } = string.Empty; // JSON array
    public bool IsActive { get; set; } = true;
    public Guid CreatedByUserId { get; set; }

    public ICollection<CompanySkill> RequiredSkills { get; set; } = new List<CompanySkill>();
    public ICollection<StudentEligibility> StudentEligibilities { get; set; } = new List<StudentEligibility>();
    public ICollection<RecruitmentDrive> RecruitmentDrives { get; set; } = new List<RecruitmentDrive>();
}

public class CompanySkill : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid SkillId { get; set; }
    public bool IsRequired { get; set; } = true;
    public int MinProficiencyLevel { get; set; } = 1;

    public Company Company { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}

public class RecruitmentDrive : BaseEntity
{
    public Guid CompanyId { get; set; }
    public string DriveName { get; set; } = string.Empty;
    public DateTime DriveDate { get; set; }
    public string? Venue { get; set; }
    public string Status { get; set; } = "Upcoming"; // Upcoming, Ongoing, Completed
    public string? Notes { get; set; }

    public Company Company { get; set; } = null!;
}
