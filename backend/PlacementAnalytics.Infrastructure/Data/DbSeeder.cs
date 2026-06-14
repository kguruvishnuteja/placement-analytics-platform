using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Domain.Entities;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        // Seed Skills
        if (!await context.Skills.AnyAsync())
        {
            var skills = new List<Skill>
            {
                new() { Name = "Java", Category = "Programming" },
                new() { Name = "Python", Category = "Programming" },
                new() { Name = "C#", Category = "Programming" },
                new() { Name = "JavaScript", Category = "Programming" },
                new() { Name = "TypeScript", Category = "Programming" },
                new() { Name = "C++", Category = "Programming" },
                new() { Name = "SQL", Category = "Database" },
                new() { Name = "MySQL", Category = "Database" },
                new() { Name = "PostgreSQL", Category = "Database" },
                new() { Name = "MongoDB", Category = "Database" },
                new() { Name = "DBMS", Category = "Database" },
                new() { Name = "OOP", Category = "Concepts" },
                new() { Name = "Data Structures", Category = "Concepts" },
                new() { Name = "Algorithms", Category = "Concepts" },
                new() { Name = "Networking", Category = "Networking" },
                new() { Name = "REST API", Category = "Web" },
                new() { Name = "REST Security", Category = "Web" },
                new() { Name = "React", Category = "Framework" },
                new() { Name = "Node.js", Category = "Framework" },
                new() { Name = "ASP.NET", Category = "Framework" },
                new() { Name = "Docker", Category = "DevOps" },
                new() { Name = "AWS", Category = "Cloud" },
                new() { Name = "Azure", Category = "Cloud" },
                new() { Name = "Communication", Category = "Soft Skills" },
                new() { Name = "Aptitude", Category = "Aptitude" },
                new() { Name = "Git", Category = "Tools" },
                new() { Name = "Linux", Category = "OS" },
                new() { Name = "Machine Learning", Category = "AI/ML" },
                new() { Name = "Spring Boot", Category = "Framework" },
                new() { Name = "Microservices", Category = "Architecture" }
            };
            await context.Skills.AddRangeAsync(skills);
            await context.SaveChangesAsync();
        }

        // Seed Scoring Rules
        if (!await context.ScoringRules.AnyAsync())
        {
            var rules = new List<ScoringRule>
            {
                new() { RuleName = "Academic Performance", Category = "Academics", WeightPercent = 25, Description = "CGPA, SSC, Intermediate scores" },
                new() { RuleName = "Projects", Category = "Projects", WeightPercent = 20, Description = "Number and quality of projects" },
                new() { RuleName = "Technical Skills", Category = "Skills", WeightPercent = 20, Description = "Number of verified skills" },
                new() { RuleName = "Resume Quality", Category = "Resume", WeightPercent = 15, Description = "ATS score from resume analysis" },
                new() { RuleName = "Coding Profiles", Category = "CodingProfiles", WeightPercent = 10, Description = "LeetCode, HackerRank, CodeChef activity" },
                new() { RuleName = "Certifications", Category = "Certifications", WeightPercent = 10, Description = "Professional certifications" }
            };
            await context.ScoringRules.AddRangeAsync(rules);
            await context.SaveChangesAsync();
        }

        // Seed Admin User
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            var admin = new User
            {
                Email = "admin@placement.edu",
                FirstName = "System",
                LastName = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsEmailVerified = true,
                IsActive = true
            };
            await context.Users.AddAsync(admin);
            await context.SaveChangesAsync();
        }

        // Seed Placement Officer
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.PlacementOfficer))
        {
            var officer = new User
            {
                Email = "officer@placement.edu",
                FirstName = "John",
                LastName = "Officer",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Officer@123"),
                Role = UserRole.PlacementOfficer,
                IsEmailVerified = true,
                IsActive = true
            };
            await context.Users.AddAsync(officer);
            await context.SaveChangesAsync();
        }

        // Seed Demo Student
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Student))
        {
            var studentUser = new User
            {
                Email = "student@placement.edu",
                FirstName = "Alice",
                LastName = "Student",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRole.Student,
                IsEmailVerified = true,
                IsActive = true
            };
            await context.Users.AddAsync(studentUser);
            await context.SaveChangesAsync();

            var student = new Student
            {
                UserId = studentUser.Id,
                Phone = "9876543210",
                Branch = "Computer Science",
                Section = "A",
                GraduationYear = 2025,
                RollNumber = "CS2021001",
                SscPercentage = 90,
                IntermediatePercentage = 88,
                CurrentCgpa = 8.5m,
                ActiveBacklogs = 0,
                GitHubProfile = "https://github.com/alice",
                LinkedInProfile = "https://linkedin.com/in/alice",
                LeetCodeSolved = 150,
                GitHubRepos = 8,
                ProfileCompletionPercent = 85
            };
            await context.Students.AddAsync(student);
            await context.SaveChangesAsync();

            // Add some skills
            var sqlSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == "SQL");
            var oopSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == "OOP");
            var javaSkill = await context.Skills.FirstOrDefaultAsync(s => s.Name == "Java");

            if (sqlSkill != null && oopSkill != null && javaSkill != null)
            {
                await context.StudentSkills.AddRangeAsync(
                    new StudentSkill { StudentId = student.Id, SkillId = sqlSkill.Id, ProficiencyLevel = 4 },
                    new StudentSkill { StudentId = student.Id, SkillId = oopSkill.Id, ProficiencyLevel = 4 },
                    new StudentSkill { StudentId = student.Id, SkillId = javaSkill.Id, ProficiencyLevel = 3 }
                );
            }

            // Add a project
            await context.Projects.AddAsync(new Project
            {
                StudentId = student.Id,
                Title = "E-Commerce Web App",
                Description = "Full-stack e-commerce application with payment integration",
                TechStack = "React, Node.js, MongoDB",
                GitHubUrl = "https://github.com/alice/ecommerce",
                StartDate = new DateTime(2023, 6, 1),
                EndDate = new DateTime(2023, 9, 30)
            });

            await context.SaveChangesAsync();
        }

        // Seed Sample Companies
        if (!await context.Companies.AnyAsync())
        {
            var officer = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.PlacementOfficer);
            var officerId = officer?.Id ?? Guid.NewGuid();

            var skills = await context.Skills.ToListAsync();
            var sqlId = skills.FirstOrDefault(s => s.Name == "SQL")?.Id;
            var oopId = skills.FirstOrDefault(s => s.Name == "OOP")?.Id;
            var dbmsId = skills.FirstOrDefault(s => s.Name == "DBMS")?.Id;
            var networkId = skills.FirstOrDefault(s => s.Name == "Networking")?.Id;
            var restId = skills.FirstOrDefault(s => s.Name == "REST API")?.Id;
            var javaId = skills.FirstOrDefault(s => s.Name == "Java")?.Id;
            var aptId = skills.FirstOrDefault(s => s.Name == "Aptitude")?.Id;
            var commId = skills.FirstOrDefault(s => s.Name == "Communication")?.Id;

            var companies = new List<Company>
            {
                new()
                {
                    Name = "Cisco",
                    Industry = "Networking",
                    Description = "Global leader in networking technology",
                    Website = "https://cisco.com",
                    PackageLpa = 12.5m,
                    JobRole = "Network Engineer",
                    EligibilityCgpa = 7.5m,
                    MaxBacklogsAllowed = 0,
                    EligibleBranches = "[\"Computer Science\",\"Electronics\",\"Information Technology\"]",
                    CreatedByUserId = officerId
                },
                new()
                {
                    Name = "Infosys",
                    Industry = "IT Services",
                    Description = "Leading IT services and consulting company",
                    Website = "https://infosys.com",
                    PackageLpa = 6.5m,
                    JobRole = "Systems Engineer",
                    EligibilityCgpa = 6.0m,
                    MaxBacklogsAllowed = 1,
                    EligibleBranches = "[\"Computer Science\",\"Information Technology\",\"Electronics\",\"Mechanical\"]",
                    CreatedByUserId = officerId
                },
                new()
                {
                    Name = "TCS",
                    Industry = "IT Services",
                    Description = "Tata Consultancy Services - world's leading IT company",
                    Website = "https://tcs.com",
                    PackageLpa = 7.0m,
                    JobRole = "Software Developer",
                    EligibilityCgpa = 6.0m,
                    MaxBacklogsAllowed = 0,
                    EligibleBranches = "[\"Computer Science\",\"Information Technology\",\"Electronics\",\"Civil\",\"Mechanical\"]",
                    CreatedByUserId = officerId
                }
            };

            await context.Companies.AddRangeAsync(companies);
            await context.SaveChangesAsync();

            // Add company skills
            var cisco = companies[0];
            var infosys = companies[1];
            var tcs = companies[2];

            var companySkills = new List<CompanySkill>();

            if (networkId.HasValue) companySkills.Add(new() { CompanyId = cisco.Id, SkillId = networkId.Value });
            if (oopId.HasValue) companySkills.Add(new() { CompanyId = cisco.Id, SkillId = oopId.Value });
            if (sqlId.HasValue) companySkills.Add(new() { CompanyId = cisco.Id, SkillId = sqlId.Value });
            if (restId.HasValue) companySkills.Add(new() { CompanyId = cisco.Id, SkillId = restId.Value });

            if (javaId.HasValue) companySkills.Add(new() { CompanyId = infosys.Id, SkillId = javaId.Value });
            if (dbmsId.HasValue) companySkills.Add(new() { CompanyId = infosys.Id, SkillId = dbmsId.Value });
            if (aptId.HasValue) companySkills.Add(new() { CompanyId = infosys.Id, SkillId = aptId.Value });

            if (oopId.HasValue) companySkills.Add(new() { CompanyId = tcs.Id, SkillId = oopId.Value });
            if (sqlId.HasValue) companySkills.Add(new() { CompanyId = tcs.Id, SkillId = sqlId.Value });
            if (commId.HasValue) companySkills.Add(new() { CompanyId = tcs.Id, SkillId = commId.Value });

            await context.CompanySkills.AddRangeAsync(companySkills);
            await context.SaveChangesAsync();
        }
    }
}
