using PlacementAnalytics.Domain.Common;

namespace PlacementAnalytics.Domain.Entities;

public class Student : BaseEntity
{
    public Guid UserId { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int GraduationYear { get; set; }
    public string RollNumber { get; set; } = string.Empty;

    // Academic
    public decimal SscPercentage { get; set; }
    public decimal IntermediatePercentage { get; set; }
    public decimal CurrentCgpa { get; set; }
    public int ActiveBacklogs { get; set; } = 0;

    // Coding Profiles
    public string? LeetCodeProfile { get; set; }
    public string? HackerRankProfile { get; set; }
    public string? CodeChefProfile { get; set; }
    public string? GitHubProfile { get; set; }
    public string? LinkedInProfile { get; set; }

    public int LeetCodeSolved { get; set; } = 0;
    public int HackerRankStars { get; set; } = 0;
    public int CodeChefRating { get; set; } = 0;
    public int GitHubRepos { get; set; } = 0;

    public int ProfileCompletionPercent { get; set; } = 0;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<StudentSkill> StudentSkills { get; set; } = new List<StudentSkill>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Certification> Certifications { get; set; } = new List<Certification>();
    public ICollection<InternshipExperience> Internships { get; set; } = new List<InternshipExperience>();
    public ICollection<ResumeAnalysis> ResumeAnalyses { get; set; } = new List<ResumeAnalysis>();
    public ICollection<PlacementScore> PlacementScores { get; set; } = new List<PlacementScore>();
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
    public ICollection<StudentEligibility> Eligibilities { get; set; } = new List<StudentEligibility>();
}
