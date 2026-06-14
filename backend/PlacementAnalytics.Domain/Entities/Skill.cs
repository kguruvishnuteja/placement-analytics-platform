using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Programming, Database, Framework, Networking, etc.
    public string? Description { get; set; }

    public ICollection<StudentSkill> StudentSkills { get; set; } = new List<StudentSkill>();
    public ICollection<CompanySkill> CompanySkills { get; set; } = new List<CompanySkill>();
}

public class StudentSkill : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid SkillId { get; set; }
    public int ProficiencyLevel { get; set; } = 1; // 1-5
    public bool IsVerified { get; set; } = false;

    public Student Student { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
