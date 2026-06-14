using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class StudentEligibility : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid CompanyId { get; set; }
    public bool IsEligible { get; set; }
    public decimal EligibilityPercent { get; set; }
    public string MissingSkills { get; set; } = "[]"; // JSON
    public string Reasons { get; set; } = "[]"; // JSON
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

    public Student Student { get; set; } = null!;
    public Company Company { get; set; } = null!;
}

public class ScoringRule : BaseEntity
{
    public string RuleName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Academics, Projects, Skills, Resume, CodingProfiles, Certifications
    public decimal WeightPercent { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
}
