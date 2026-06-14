using PlacementAnalytics.Domain.Common;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Domain.Entities;

public class PlacementScore : BaseEntity
{
    public Guid StudentId { get; set; }
    public decimal TotalScore { get; set; }
    public decimal AcademicScore { get; set; }
    public decimal ProjectScore { get; set; }
    public decimal SkillScore { get; set; }
    public decimal ResumeScore { get; set; }
    public decimal CodingProfileScore { get; set; }
    public decimal CertificationScore { get; set; }
    public ReadinessLevel ReadinessLevel { get; set; }
    public bool IsLatest { get; set; } = true;

    public Student Student { get; set; } = null!;
}

public class Prediction : BaseEntity
{
    public Guid StudentId { get; set; }
    public decimal PredictionScore { get; set; }
    public PredictionLevel PredictionLevel { get; set; }
    public string InputSnapshot { get; set; } = "{}"; // JSON of inputs
    public string Reasoning { get; set; } = string.Empty;

    public Student Student { get; set; } = null!;
}
