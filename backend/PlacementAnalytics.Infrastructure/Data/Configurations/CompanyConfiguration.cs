using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Infrastructure.Data.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Industry).HasMaxLength(100);
        builder.Property(c => c.JobRole).HasMaxLength(200);
        builder.Property(c => c.Website).HasMaxLength(500);
        builder.Property(c => c.LogoUrl).HasMaxLength(500);
        builder.Property(c => c.EligibleBranches).HasColumnType("nvarchar(max)");
        builder.HasIndex(c => c.Name);
    }
}

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("Skills");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Category).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Description).HasMaxLength(500);
        builder.HasIndex(s => s.Name).IsUnique();
    }
}
