using PlacementAnalytics.Domain.Common;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public bool IsEmailSent { get; set; } = false;
    public string? ActionUrl { get; set; }

    public User User { get; set; } = null!;
}

public class Report : BaseEntity
{
    public string ReportName { get; set; } = string.Empty;
    public ReportType ReportType { get; set; }
    public ReportFormat Format { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public Guid GeneratedByUserId { get; set; }
    public string Parameters { get; set; } = "{}"; // JSON
}
