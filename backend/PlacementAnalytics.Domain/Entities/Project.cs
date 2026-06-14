using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class Project : BaseEntity
{
    public Guid StudentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string? GitHubUrl { get; set; }
    public string? LiveUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsOngoing { get; set; } = false;

    public Student Student { get; set; } = null!;
}
