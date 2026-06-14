using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<StudentSkill> StudentSkills => Set<StudentSkill>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<InternshipExperience> Internships => Set<InternshipExperience>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanySkill> CompanySkills => Set<CompanySkill>();
    public DbSet<RecruitmentDrive> RecruitmentDrives => Set<RecruitmentDrive>();
    public DbSet<StudentEligibility> StudentEligibilities => Set<StudentEligibility>();
    public DbSet<ScoringRule> ScoringRules => Set<ScoringRule>();
    public DbSet<ResumeAnalysis> ResumeAnalyses => Set<ResumeAnalysis>();
    public DbSet<PlacementScore> PlacementScores => Set<PlacementScore>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Soft delete global filter
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Student>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<Company>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Skill>().HasQueryFilter(s => !s.IsDeleted);

        // Decimal precision
        modelBuilder.Entity<Student>(b =>
        {
            b.Property(s => s.SscPercentage).HasPrecision(5, 2);
            b.Property(s => s.IntermediatePercentage).HasPrecision(5, 2);
            b.Property(s => s.CurrentCgpa).HasPrecision(4, 2);
        });

        modelBuilder.Entity<Company>(b =>
        {
            b.Property(c => c.PackageLpa).HasPrecision(6, 2);
            b.Property(c => c.EligibilityCgpa).HasPrecision(4, 2);
        });

        modelBuilder.Entity<PlacementScore>(b =>
        {
            b.Property(s => s.TotalScore).HasPrecision(5, 2);
            b.Property(s => s.AcademicScore).HasPrecision(5, 2);
            b.Property(s => s.ProjectScore).HasPrecision(5, 2);
            b.Property(s => s.SkillScore).HasPrecision(5, 2);
            b.Property(s => s.ResumeScore).HasPrecision(5, 2);
            b.Property(s => s.CodingProfileScore).HasPrecision(5, 2);
            b.Property(s => s.CertificationScore).HasPrecision(5, 2);
        });

        modelBuilder.Entity<StudentEligibility>(b =>
        {
            b.Property(e => e.EligibilityPercent).HasPrecision(5, 2);
        });

        modelBuilder.Entity<Prediction>(b =>
        {
            b.Property(p => p.PredictionScore).HasPrecision(5, 2);
        });

        modelBuilder.Entity<ScoringRule>(b =>
        {
            b.Property(r => r.WeightPercent).HasPrecision(5, 2);
        });

        modelBuilder.Entity<InternshipExperience>(b =>
        {
            b.Property(i => i.Stipend).HasPrecision(10, 2);
        });

        // Indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Student>().HasIndex(s => s.UserId).IsUnique();
        modelBuilder.Entity<Student>().HasIndex(s => s.RollNumber);
        modelBuilder.Entity<Company>().HasIndex(c => c.Name);
        modelBuilder.Entity<Skill>().HasIndex(s => s.Name).IsUnique();
        modelBuilder.Entity<StudentSkill>().HasIndex(ss => new { ss.StudentId, ss.SkillId }).IsUnique();
        modelBuilder.Entity<CompanySkill>().HasIndex(cs => new { cs.CompanyId, cs.SkillId }).IsUnique();
        modelBuilder.Entity<StudentEligibility>().HasIndex(se => new { se.StudentId, se.CompanyId });

        // Relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Student)
            .WithOne(s => s.User)
            .HasForeignKey<Student>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentSkill>()
            .HasOne(ss => ss.Student)
            .WithMany(s => s.StudentSkills)
            .HasForeignKey(ss => ss.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CompanySkill>()
            .HasOne(cs => cs.Company)
            .WithMany(c => c.RequiredSkills)
            .HasForeignKey(cs => cs.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
