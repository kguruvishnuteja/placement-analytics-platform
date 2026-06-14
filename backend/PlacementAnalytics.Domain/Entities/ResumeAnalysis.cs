using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class ResumeAnalysis : BaseEntity
{
    public Guid StudentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ExtractedText { get; set; } = string.Empty;
    public string ExtractedSkills { get; set; } = "[]"; // JSON
    public string ExtractedProjects { get; set; } = "[]"; // JSON
    public string ExtractedCertifications { get; set; } = "[]"; // JSON
    public int AtsScore { get; set; }
    public int FormatScore { get; set; }
    public int KeywordScore { get; set; }
    public int ProjectScore { get; set; }
    public int CertificationScore { get; set; }
    public int ExperienceScore { get; set; }
    public int SkillMatchScore { get; set; }
    public string Suggestions { get; set; } = "[]"; // JSON
    public bool IsLatest { get; set; } = true;

    public Student Student { get; set; } = null!;
}
