using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class InternshipExperience : BaseEntity
{
    public Guid StudentId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentlyWorking { get; set; } = false;
    public bool IsPaid { get; set; } = false;
    public decimal? Stipend { get; set; }

    public Student Student { get; set; } = null!;
}
