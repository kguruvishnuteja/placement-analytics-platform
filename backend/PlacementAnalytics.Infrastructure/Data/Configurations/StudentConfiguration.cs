using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Infrastructure.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Phone).HasMaxLength(20);
        builder.Property(s => s.Branch).HasMaxLength(100);
        builder.Property(s => s.Section).HasMaxLength(10);
        builder.Property(s => s.RollNumber).HasMaxLength(50);
        builder.Property(s => s.LeetCodeProfile).HasMaxLength(500);
        builder.Property(s => s.HackerRankProfile).HasMaxLength(500);
        builder.Property(s => s.CodeChefProfile).HasMaxLength(500);
        builder.Property(s => s.GitHubProfile).HasMaxLength(500);
        builder.Property(s => s.LinkedInProfile).HasMaxLength(500);
        builder.HasIndex(s => s.UserId).IsUnique();
        builder.HasIndex(s => s.Branch);
        builder.HasIndex(s => s.RollNumber);
    }
}
