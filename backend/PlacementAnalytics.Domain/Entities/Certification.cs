using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class Certification : BaseEntity
{
    public Guid StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }

    public Student Student { get; set; } = null!;
}
