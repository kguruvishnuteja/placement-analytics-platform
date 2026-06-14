namespace PlacementAnalytics.Application.DTOs.Resume;

public class ResumeAnalysisDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public int AtsScore { get; set; }
    public int FormatScore { get; set; }
    public int KeywordScore { get; set; }
    public int ProjectScore { get; set; }
    public int CertificationScore { get; set; }
    public int ExperienceScore { get; set; }
    public int SkillMatchScore { get; set; }
    public List<string> ExtractedSkills { get; set; } = new();
    public List<string> ExtractedProjects { get; set; } = new();
    public List<string> ExtractedCertifications { get; set; } = new();
    public List<ResumeSuggestionDto> Suggestions { get; set; } = new();
    public DateTime AnalyzedAt { get; set; }
}

public class ResumeSuggestionDto
{
    public string Category { get; set; } = string.Empty;
    public string Issue { get; set; } = string.Empty;
    public string Suggestion { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; // High, Medium, Low
}

public class AtsScoreBreakdownDto
{
    public int TotalScore { get; set; }
    public int FormatScore { get; set; }
    public int KeywordScore { get; set; }
    public int ProjectScore { get; set; }
    public int CertificationScore { get; set; }
    public int ExperienceScore { get; set; }
    public int SkillMatchScore { get; set; }
    public string Grade { get; set; } = string.Empty;
}
