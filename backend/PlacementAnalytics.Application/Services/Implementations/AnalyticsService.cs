using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Analytics;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Application.Services.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IRepository<Student> _studentRepo;
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<Company> _companyRepo;
    private readonly IRepository<PlacementScore> _scoreRepo;
    private readonly IRepository<Prediction> _predictionRepo;
    private readonly IRepository<ResumeAnalysis> _resumeRepo;
    private readonly IRepository<StudentEligibility> _eligibilityRepo;
    private readonly IRepository<ScoringRule> _scoringRuleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AnalyticsService(
        IRepository<Student> studentRepo,
        IRepository<User> userRepo,
        IRepository<Company> companyRepo,
        IRepository<PlacementScore> scoreRepo,
        IRepository<Prediction> predictionRepo,
        IRepository<ResumeAnalysis> resumeRepo,
        IRepository<StudentEligibility> eligibilityRepo,
        IRepository<ScoringRule> scoringRuleRepo,
        IUnitOfWork unitOfWork)
    {
        _studentRepo = studentRepo;
        _userRepo = userRepo;
        _companyRepo = companyRepo;
        _scoreRepo = scoreRepo;
        _predictionRepo = predictionRepo;
        _resumeRepo = resumeRepo;
        _eligibilityRepo = eligibilityRepo;
        _scoringRuleRepo = scoringRuleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PlacementReadinessDto>> CalculateReadinessScoreAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return ApiResponse<PlacementReadinessDto>.FailureResponse("Student not found.");

        var resume = await _resumeRepo.Query()
            .Where(r => r.StudentId == student.Id && r.IsLatest)
            .FirstOrDefaultAsync();

        // Get configurable weights
        var rules = await _scoringRuleRepo.Query()
            .Where(r => r.IsActive)
            .ToListAsync();

        decimal academicWeight = GetWeight(rules, "Academics", 25);
        decimal projectWeight = GetWeight(rules, "Projects", 20);
        decimal skillWeight = GetWeight(rules, "Skills", 20);
        decimal resumeWeight = GetWeight(rules, "Resume", 15);
        decimal codingWeight = GetWeight(rules, "CodingProfiles", 10);
        decimal certWeight = GetWeight(rules, "Certifications", 10);

        // Calculate component scores
        decimal academicScore = CalculateAcademicScore(student);
        decimal projectScore = CalculateProjectScore(student);
        decimal skillScore = CalculateSkillScore(student);
        decimal resumeScore = resume != null ? resume.AtsScore : 0;
        decimal codingScore = CalculateCodingScore(student);
        decimal certScore = CalculateCertificationScore(student);

        decimal total = (academicScore * academicWeight / 100)
                      + (projectScore * projectWeight / 100)
                      + (skillScore * skillWeight / 100)
                      + (resumeScore * resumeWeight / 100)
                      + (codingScore * codingWeight / 100)
                      + (certScore * certWeight / 100);

        var level = total switch
        {
            <= 40 => ReadinessLevel.Beginner,
            <= 60 => ReadinessLevel.Improving,
            <= 80 => ReadinessLevel.PlacementReady,
            _ => ReadinessLevel.HighlyCompetitive
        };

        // Mark previous scores as not latest
        var previousScores = await _scoreRepo.FindAsync(s => s.StudentId == student.Id && s.IsLatest);
        foreach (var ps in previousScores)
        {
            ps.IsLatest = false;
            _scoreRepo.Update(ps);
        }

        var score = new PlacementScore
        {
            StudentId = student.Id,
            TotalScore = Math.Round(total, 1),
            AcademicScore = Math.Round(academicScore, 1),
            ProjectScore = Math.Round(projectScore, 1),
            SkillScore = Math.Round(skillScore, 1),
            ResumeScore = Math.Round(resumeScore, 1),
            CodingProfileScore = Math.Round(codingScore, 1),
            CertificationScore = Math.Round(certScore, 1),
            ReadinessLevel = level,
            IsLatest = true
        };

        await _scoreRepo.AddAsync(score);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<PlacementReadinessDto>.SuccessResponse(new PlacementReadinessDto
        {
            StudentId = student.Id,
            TotalScore = score.TotalScore,
            AcademicScore = score.AcademicScore,
            ProjectScore = score.ProjectScore,
            SkillScore = score.SkillScore,
            ResumeScore = score.ResumeScore,
            CodingProfileScore = score.CodingProfileScore,
            CertificationScore = score.CertificationScore,
            ReadinessLevel = level.ToString(),
            ReadinessDescription = GetReadinessDescription(level),
            CalculatedAt = score.CreatedAt
        });
    }

    public async Task<ApiResponse<PlacementPredictionDto>> GetPredictionAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return ApiResponse<PlacementPredictionDto>.FailureResponse("Student not found.");

        var resume = await _resumeRepo.Query()
            .Where(r => r.StudentId == student.Id && r.IsLatest)
            .FirstOrDefaultAsync();

        // Weighted prediction algorithm
        double cgpaFactor = Math.Min((double)student.CurrentCgpa / 10.0 * 100, 100);
        double skillFactor = Math.Min(student.StudentSkills.Count * 10.0, 100);
        double certFactor = Math.Min(student.Certifications.Count * 20.0, 100);
        double projectFactor = Math.Min(student.Projects.Count * 20.0, 100);
        double atsFactor = resume?.AtsScore ?? 0;
        double codingFactor = Math.Min(
            (student.LeetCodeSolved / 5.0 + student.HackerRankStars * 10 + student.CodeChefRating / 100.0), 100);

        double predictionScore = cgpaFactor * 0.25 + skillFactor * 0.20 + certFactor * 0.10
                                + projectFactor * 0.20 + atsFactor * 0.15 + codingFactor * 0.10;

        var level = predictionScore switch
        {
            < 40 => PredictionLevel.LowChance,
            < 70 => PredictionLevel.ModerateChance,
            _ => PredictionLevel.HighChance
        };

        string reasoning = level switch
        {
            PredictionLevel.HighChance => "Strong academic record, good skills, and solid project portfolio indicate high placement probability.",
            PredictionLevel.ModerateChance => "Decent profile with room for improvement in skills and projects.",
            _ => "Focus on improving CGPA, adding projects, and building technical skills."
        };

        var prediction = new Prediction
        {
            StudentId = student.Id,
            PredictionScore = Math.Round((decimal)predictionScore, 1),
            PredictionLevel = level,
            Reasoning = reasoning,
            InputSnapshot = System.Text.Json.JsonSerializer.Serialize(new
            {
                Cgpa = student.CurrentCgpa,
                Skills = student.StudentSkills.Count,
                Projects = student.Projects.Count,
                Certifications = student.Certifications.Count,
                AtsScore = resume?.AtsScore ?? 0,
                LeetCodeSolved = student.LeetCodeSolved
            })
        };

        await _predictionRepo.AddAsync(prediction);
        await _unitOfWork.SaveChangesAsync();

        var history = await _predictionRepo.Query()
            .Where(p => p.StudentId == student.Id)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .ToListAsync();

        return ApiResponse<PlacementPredictionDto>.SuccessResponse(new PlacementPredictionDto
        {
            StudentId = student.Id,
            PredictionScore = prediction.PredictionScore,
            PredictionLevel = level.ToString(),
            Reasoning = reasoning,
            PredictedAt = prediction.CreatedAt,
            History = history.Select(h => new PredictionHistoryDto
            {
                Score = h.PredictionScore,
                Level = h.PredictionLevel.ToString(),
                Date = h.CreatedAt
            }).ToList()
        });
    }

    public async Task<ApiResponse<StudentDashboardDto>> GetStudentDashboardAsync(Guid userId)
    {
        var student = await _studentRepo.Query()
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .Include(s => s.Projects)
            .Include(s => s.Certifications)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return ApiResponse<StudentDashboardDto>.FailureResponse("Student not found.");

        var latestScore = await _scoreRepo.Query()
            .Where(s => s.StudentId == student.Id && s.IsLatest)
            .FirstOrDefaultAsync();

        var latestResume = await _resumeRepo.Query()
            .Where(r => r.StudentId == student.Id && r.IsLatest)
            .FirstOrDefaultAsync();

        var eligibleCount = await _eligibilityRepo.CountAsync(e =>
            e.StudentId == student.Id && e.IsEligible);

        var skillsDistribution = student.StudentSkills
            .Where(ss => ss.Skill != null)
            .GroupBy(ss => ss.Skill!.Category)
            .ToDictionary(g => g.Key, g => g.Count());

        var scoreHistory = await _scoreRepo.Query()
            .Where(s => s.StudentId == student.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Take(6)
            .ToListAsync();

        var progressTimeline = scoreHistory.Select(s => new ProgressDataDto
        {
            Month = s.CreatedAt.ToString("MMM yyyy"),
            ReadinessScore = s.TotalScore,
            AtsScore = 0
        }).ToList();

        return ApiResponse<StudentDashboardDto>.SuccessResponse(new StudentDashboardDto
        {
            ReadinessScore = latestScore?.TotalScore ?? 0,
            ReadinessLevel = latestScore?.ReadinessLevel.ToString() ?? "Not Calculated",
            AtsScore = latestResume?.AtsScore ?? 0,
            EligibleCompaniesCount = eligibleCount,
            ProfileCompletionPercent = student.ProfileCompletionPercent,
            TotalSkills = student.StudentSkills.Count,
            TotalProjects = student.Projects.Count,
            TotalCertifications = student.Certifications.Count,
            SkillGapSummary = new SkillGapSummaryDto
            {
                TotalCompaniesAnalyzed = await _eligibilityRepo.CountAsync(e => e.StudentId == student.Id),
                EligibleCompanies = eligibleCount
            },
            RecentRecommendations = new List<string>
            {
                "Complete your profile to 100%",
                "Upload and analyze your resume",
                "Add more technical projects",
                "Practice coding on LeetCode/HackerRank"
            },
            ProgressTimeline = progressTimeline,
            SkillsDistribution = skillsDistribution
        });
    }

    public async Task<ApiResponse<OfficerDashboardDto>> GetOfficerDashboardAsync()
    {
        var totalStudents = await _studentRepo.CountAsync();
        var allStudents = await _studentRepo.Query()
            .Include(s => s.StudentSkills).ThenInclude(ss => ss.Skill)
            .Include(s => s.PlacementScores)
            .ToListAsync();

        var readyStudents = allStudents.Count(s =>
            s.PlacementScores.Any(ps => ps.IsLatest && (int)ps.ReadinessLevel >= 3));

        var avgCgpa = allStudents.Count > 0 ? allStudents.Average(s => (double)s.CurrentCgpa) : 0;

        var companies = await _companyRepo.Query()
            .Include(c => c.StudentEligibilities)
            .Where(c => !c.IsDeleted && c.IsActive)
            .ToListAsync();

        var branchAnalytics = allStudents
            .GroupBy(s => s.Branch)
            .Select(g => new BranchAnalyticsDto
            {
                Branch = g.Key,
                TotalStudents = g.Count(),
                EligibleStudents = g.Count(s => s.PlacementScores.Any(ps => ps.IsLatest && (int)ps.ReadinessLevel >= 3)),
                AverageCgpa = g.Count() > 0 ? Math.Round((decimal)g.Average(s => (double)s.CurrentCgpa), 2) : 0,
                AverageReadinessScore = g.Count() > 0
                    ? Math.Round((decimal)g.Average(s => (double)(s.PlacementScores.FirstOrDefault(ps => ps.IsLatest)?.TotalScore ?? 0)), 1)
                    : 0
            })
            .Where(b => !string.IsNullOrEmpty(b.Branch))
            .ToList();

        var companyStats = companies.Select(c => new CompanyStatsDto
        {
            CompanyName = c.Name,
            EligibleStudents = c.StudentEligibilities.Count(e => e.IsEligible),
            PackageLpa = c.PackageLpa,
            JobRole = c.JobRole
        }).ToList();

        var skillDistribution = allStudents
            .SelectMany(s => s.StudentSkills)
            .Where(ss => ss.Skill != null)
            .GroupBy(ss => ss.Skill!.Name)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .ToDictionary(g => g.Key, g => g.Count());

        return ApiResponse<OfficerDashboardDto>.SuccessResponse(new OfficerDashboardDto
        {
            TotalStudents = totalStudents,
            PlacementReadyStudents = readyStudents,
            AverageCgpa = Math.Round((decimal)avgCgpa, 2),
            TotalCompanies = companies.Count,
            UpcomingDrives = 0,
            BranchAnalytics = branchAnalytics,
            CompanyStats = companyStats,
            SkillDistribution = skillDistribution,
            PlacementTrends = new List<PlacementTrendDto>()
        });
    }

    public async Task<ApiResponse<AdminDashboardDto>> GetAdminDashboardAsync()
    {
        var totalUsers = await _userRepo.CountAsync();
        var totalStudents = await _studentRepo.CountAsync();
        var totalOfficers = await _userRepo.CountAsync(u => u.Role == UserRole.PlacementOfficer);
        var totalCompanies = await _companyRepo.CountAsync(c => !c.IsDeleted);
        var totalResumes = await _resumeRepo.CountAsync();

        return ApiResponse<AdminDashboardDto>.SuccessResponse(new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            TotalStudents = totalStudents,
            TotalOfficers = totalOfficers,
            TotalCompanies = totalCompanies,
            TotalResumesAnalyzed = totalResumes,
            SystemHealth = 99.5m,
            RecentActivities = new List<RecentActivityDto>()
        });
    }

    public async Task<ApiResponse<List<ScoringRuleDto>>> GetScoringRulesAsync()
    {
        var rules = await _scoringRuleRepo.GetAllAsync();
        return ApiResponse<List<ScoringRuleDto>>.SuccessResponse(rules.Select(r => new ScoringRuleDto
        {
            Id = r.Id,
            RuleName = r.RuleName,
            Category = r.Category,
            WeightPercent = r.WeightPercent,
            IsActive = r.IsActive,
            Description = r.Description
        }).ToList());
    }

    public async Task<ApiResponse<ScoringRuleDto>> UpdateScoringRuleAsync(Guid ruleId, UpdateScoringRuleDto dto)
    {
        var rule = await _scoringRuleRepo.GetByIdAsync(ruleId);
        if (rule == null) return ApiResponse<ScoringRuleDto>.FailureResponse("Rule not found.");

        rule.WeightPercent = dto.WeightPercent;
        rule.IsActive = dto.IsActive;
        rule.UpdatedAt = DateTime.UtcNow;
        _scoringRuleRepo.Update(rule);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ScoringRuleDto>.SuccessResponse(new ScoringRuleDto
        {
            Id = rule.Id,
            RuleName = rule.RuleName,
            Category = rule.Category,
            WeightPercent = rule.WeightPercent,
            IsActive = rule.IsActive,
            Description = rule.Description
        });
    }

    public async Task<ApiResponse<List<StudentReadinessReportDto>>> GetStudentReadinessReportAsync()
    {
        var students = await _studentRepo.Query()
            .Include(s => s.User)
            .Include(s => s.PlacementScores)
            .Include(s => s.ResumeAnalyses)
            .Include(s => s.Predictions)
            .Where(s => !s.IsDeleted && !s.User.IsDeleted)
            .OrderBy(s => s.User.FirstName)
            .ThenBy(s => s.User.LastName)
            .ToListAsync();

        var rows = students.Select(student =>
        {
            var score = student.PlacementScores
                .Where(item => item.IsLatest)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefault();
            var resume = student.ResumeAnalyses
                .Where(item => item.IsLatest)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefault();
            var prediction = student.Predictions
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefault();

            return new StudentReadinessReportDto
            {
                StudentId = student.Id,
                StudentName = $"{student.User.FirstName} {student.User.LastName}".Trim(),
                Email = student.User.Email,
                RollNumber = student.RollNumber,
                Branch = student.Branch,
                CurrentCgpa = student.CurrentCgpa,
                ActiveBacklogs = student.ActiveBacklogs,
                ReadinessScore = score?.TotalScore ?? 0,
                ReadinessLevel = score?.ReadinessLevel.ToString() ?? "NotCalculated",
                AtsScore = resume?.AtsScore ?? 0,
                PredictionScore = prediction?.PredictionScore ?? 0,
                PredictionLevel = prediction?.PredictionLevel.ToString() ?? "NotCalculated",
                ProfileCompletionPercent = student.ProfileCompletionPercent
            };
        }).ToList();

        return ApiResponse<List<StudentReadinessReportDto>>.SuccessResponse(rows);
    }

    private static decimal GetWeight(List<ScoringRule> rules, string category, decimal defaultWeight)
    {
        var rule = rules.FirstOrDefault(r => r.Category == category);
        return rule?.WeightPercent ?? defaultWeight;
    }

    private static decimal CalculateAcademicScore(Student s)
    {
        decimal cgpaScore = s.CurrentCgpa / 10m * 100;
        decimal sscScore = s.SscPercentage;
        decimal interScore = s.IntermediatePercentage;
        decimal backlogPenalty = s.ActiveBacklogs * 10;
        return Math.Max(0, (cgpaScore * 0.6m + sscScore * 0.2m + interScore * 0.2m) - backlogPenalty);
    }

    private static decimal CalculateProjectScore(Student s)
        => Math.Min(s.Projects.Count * 20m, 100);

    private static decimal CalculateSkillScore(Student s)
        => Math.Min(s.StudentSkills.Count * 8m, 100);

    private static decimal CalculateCodingScore(Student s)
    {
        decimal score = 0;
        score += Math.Min(s.LeetCodeSolved / 3m, 40);
        score += Math.Min(s.HackerRankStars * 8m, 25);
        score += Math.Min(s.CodeChefRating / 40m, 20);
        score += Math.Min(s.GitHubRepos * 3m, 15);
        return Math.Min(score, 100);
    }

    private static decimal CalculateCertificationScore(Student s)
        => Math.Min(s.Certifications.Count * 20m, 100);

    private static string GetReadinessDescription(ReadinessLevel level) => level switch
    {
        ReadinessLevel.Beginner => "Focus on building fundamentals: improve CGPA, add projects, and learn core skills.",
        ReadinessLevel.Improving => "Good progress! Work on coding profiles and certifications to boost your score.",
        ReadinessLevel.PlacementReady => "You are ready for placement drives. Keep polishing your resume and interview skills.",
        ReadinessLevel.HighlyCompetitive => "Excellent profile! You are highly competitive for top companies.",
        _ => string.Empty
    };
}
