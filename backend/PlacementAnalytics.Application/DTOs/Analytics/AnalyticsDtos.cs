namespace PlacementAnalytics.Application.DTOs.Analytics;

public class PlacementReadinessDto
{
    public Guid StudentId { get; set; }
    public decimal TotalScore { get; set; }
    public decimal AcademicScore { get; set; }
    public decimal ProjectScore { get; set; }
    public decimal SkillScore { get; set; }
    public decimal ResumeScore { get; set; }
    public decimal CodingProfileScore { get; set; }
    public decimal CertificationScore { get; set; }
    public string ReadinessLevel { get; set; } = string.Empty;
    public string ReadinessDescription { get; set; } = string.Empty;
    public DateTime CalculatedAt { get; set; }
}

public class PlacementPredictionDto
{
    public Guid StudentId { get; set; }
    public decimal PredictionScore { get; set; }
    public string PredictionLevel { get; set; } = string.Empty;
    public string Reasoning { get; set; } = string.Empty;
    public DateTime PredictedAt { get; set; }
    public List<PredictionHistoryDto> History { get; set; } = new();
}

public class PredictionHistoryDto
{
    public decimal Score { get; set; }
    public string Level { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class StudentDashboardDto
{
    public decimal ReadinessScore { get; set; }
    public string ReadinessLevel { get; set; } = string.Empty;
    public int AtsScore { get; set; }
    public int EligibleCompaniesCount { get; set; }
    public int ProfileCompletionPercent { get; set; }
    public int TotalSkills { get; set; }
    public int TotalProjects { get; set; }
    public int TotalCertifications { get; set; }
    public SkillGapSummaryDto SkillGapSummary { get; set; } = new();
    public List<string> RecentRecommendations { get; set; } = new();
    public List<ProgressDataDto> ProgressTimeline { get; set; } = new();
    public Dictionary<string, int> SkillsDistribution { get; set; } = new();
}

public class SkillGapSummaryDto
{
    public int TotalCompaniesAnalyzed { get; set; }
    public int EligibleCompanies { get; set; }
    public List<string> TopMissingSkills { get; set; } = new();
    public decimal AverageMatchPercent { get; set; }
}

public class ProgressDataDto
{
    public string Month { get; set; } = string.Empty;
    public decimal ReadinessScore { get; set; }
    public int AtsScore { get; set; }
}

public class OfficerDashboardDto
{
    public int TotalStudents { get; set; }
    public int PlacementReadyStudents { get; set; }
    public decimal AverageCgpa { get; set; }
    public int TotalCompanies { get; set; }
    public int UpcomingDrives { get; set; }
    public List<BranchAnalyticsDto> BranchAnalytics { get; set; } = new();
    public List<CompanyStatsDto> CompanyStats { get; set; } = new();
    public Dictionary<string, int> SkillDistribution { get; set; } = new();
    public List<PlacementTrendDto> PlacementTrends { get; set; } = new();
}

public class BranchAnalyticsDto
{
    public string Branch { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int EligibleStudents { get; set; }
    public decimal AverageCgpa { get; set; }
    public decimal AverageReadinessScore { get; set; }
}

public class CompanyStatsDto
{
    public string CompanyName { get; set; } = string.Empty;
    public int EligibleStudents { get; set; }
    public decimal PackageLpa { get; set; }
    public string JobRole { get; set; } = string.Empty;
}

public class PlacementTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int EligibleStudents { get; set; }
    public int HighlyCompetitiveStudents { get; set; }
}

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalOfficers { get; set; }
    public int TotalCompanies { get; set; }
    public int TotalResumesAnalyzed { get; set; }
    public decimal SystemHealth { get; set; }
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class RecentActivityDto
{
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string UserName { get; set; } = string.Empty;
}

public class ScoringRuleDto
{
    public Guid Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal WeightPercent { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }
}

public class UpdateScoringRuleDto
{
    public decimal WeightPercent { get; set; }
    public bool IsActive { get; set; }
}

public class StudentReadinessReportDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public decimal CurrentCgpa { get; set; }
    public int ActiveBacklogs { get; set; }
    public decimal ReadinessScore { get; set; }
    public string ReadinessLevel { get; set; } = string.Empty;
    public int AtsScore { get; set; }
    public decimal PredictionScore { get; set; }
    public string PredictionLevel { get; set; } = string.Empty;
    public int ProfileCompletionPercent { get; set; }
}
