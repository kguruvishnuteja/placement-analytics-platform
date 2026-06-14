using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Resume;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Application.Services.Implementations;

public class ResumeService : IResumeService
{
    private readonly IRepository<ResumeAnalysis> _resumeRepo;
    private readonly IRepository<Student> _studentRepo;
    private readonly IUnitOfWork _unitOfWork;

    // Common tech keywords for extraction
    private static readonly HashSet<string> TechKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "java", "python", "c#", "c++", "javascript", "typescript", "react", "angular", "vue",
        "node.js", "asp.net", "spring", "django", "flask", "sql", "mysql", "postgresql",
        "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "git", "linux",
        "rest", "graphql", "microservices", "machine learning", "deep learning",
        "tensorflow", "pytorch", "pandas", "numpy", "html", "css", "tailwind",
        "networking", "oop", "dbms", "data structures", "algorithms", "rest api",
        "ci/cd", "jenkins", "terraform", "ansible", "kotlin", "swift", "flutter"
    };

    public ResumeService(
        IRepository<ResumeAnalysis> resumeRepo,
        IRepository<Student> studentRepo,
        IUnitOfWork unitOfWork)
    {
        _resumeRepo = resumeRepo;
        _studentRepo = studentRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ResumeAnalysisDto>> AnalyzeResumeAsync(Guid userId, IFormFile file)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null)
            return ApiResponse<ResumeAnalysisDto>.FailureResponse("Student not found.");

        if (file == null || file.Length == 0)
            return ApiResponse<ResumeAnalysisDto>.FailureResponse("Invalid file.");

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(ext))
            return ApiResponse<ResumeAnalysisDto>.FailureResponse("Only PDF, DOC, DOCX files are allowed.");

        // Extract text (simplified - in production use iTextSharp/PdfPig for PDF)
        string extractedText = await ExtractTextAsync(file);

        // Mark previous analyses as not latest
        var previous = await _resumeRepo.FindAsync(r => r.StudentId == student.Id && r.IsLatest);
        foreach (var p in previous)
        {
            p.IsLatest = false;
            _resumeRepo.Update(p);
        }

        var skills = ExtractSkills(extractedText);
        var projects = ExtractProjects(extractedText);
        var certs = ExtractCertifications(extractedText);
        var suggestions = GenerateSuggestions(extractedText, skills, projects);

        int formatScore = CalculateFormatScore(extractedText);
        int keywordScore = CalculateKeywordScore(extractedText);
        int projectScore = Math.Min(projects.Count * 15, 100);
        int certScore = Math.Min(certs.Count * 20, 100);
        int expScore = extractedText.ToLower().Contains("internship") ||
                       extractedText.ToLower().Contains("experience") ? 80 : 30;
        int skillScore = Math.Min(skills.Count * 10, 100);

        int atsScore = (int)(formatScore * 0.15 + keywordScore * 0.25 + projectScore * 0.20
                            + certScore * 0.10 + expScore * 0.15 + skillScore * 0.15);

        var fileUrl = $"/uploads/resumes/{student.Id}/{Guid.NewGuid()}{ext}";

        var analysis = new ResumeAnalysis
        {
            StudentId = student.Id,
            FileName = file.FileName,
            FileUrl = fileUrl,
            ExtractedText = extractedText[..Math.Min(extractedText.Length, 5000)],
            ExtractedSkills = JsonSerializer.Serialize(skills),
            ExtractedProjects = JsonSerializer.Serialize(projects),
            ExtractedCertifications = JsonSerializer.Serialize(certs),
            AtsScore = atsScore,
            FormatScore = formatScore,
            KeywordScore = keywordScore,
            ProjectScore = projectScore,
            CertificationScore = certScore,
            ExperienceScore = expScore,
            SkillMatchScore = skillScore,
            Suggestions = JsonSerializer.Serialize(suggestions),
            IsLatest = true
        };

        await _resumeRepo.AddAsync(analysis);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ResumeAnalysisDto>.SuccessResponse(MapToDto(analysis), "Resume analyzed successfully.");
    }

    public async Task<ApiResponse<ResumeAnalysisDto>> GetLatestAnalysisAsync(Guid userId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<ResumeAnalysisDto>.FailureResponse("Student not found.");

        var analysis = await _resumeRepo.Query()
            .Where(r => r.StudentId == student.Id && r.IsLatest)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (analysis == null) return ApiResponse<ResumeAnalysisDto>.FailureResponse("No resume analysis found.");
        return ApiResponse<ResumeAnalysisDto>.SuccessResponse(MapToDto(analysis));
    }

    public async Task<ApiResponse<List<ResumeAnalysisDto>>> GetAnalysisHistoryAsync(Guid userId)
    {
        var student = await _studentRepo.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return ApiResponse<List<ResumeAnalysisDto>>.FailureResponse("Student not found.");

        var analyses = await _resumeRepo.Query()
            .Where(r => r.StudentId == student.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<ResumeAnalysisDto>>.SuccessResponse(analyses.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<ResumeAnalysisDto>> GetAnalysisByIdAsync(Guid analysisId)
    {
        var analysis = await _resumeRepo.GetByIdAsync(analysisId);
        if (analysis == null) return ApiResponse<ResumeAnalysisDto>.FailureResponse("Analysis not found.");
        return ApiResponse<ResumeAnalysisDto>.SuccessResponse(MapToDto(analysis));
    }

    private static async Task<string> ExtractTextAsync(IFormFile file)
    {
        // Simplified text extraction; use PdfPig or iTextSharp for real PDF parsing
        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        var text = await reader.ReadToEndAsync();
        // Clean non-printable characters
        return Regex.Replace(text, @"[^\x20-\x7E\r\n]", " ");
    }

    private static List<string> ExtractSkills(string text)
    {
        return TechKeywords
            .Where(k => text.Contains(k, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private static List<string> ExtractProjects(string text)
    {
        var projects = new List<string>();
        var lines = text.Split('\n');
        bool inProjectSection = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed.Contains("project", StringComparison.OrdinalIgnoreCase) &&
                trimmed.Length < 50)
            {
                inProjectSection = true;
                continue;
            }
            if (inProjectSection && trimmed.Length > 10 && trimmed.Length < 100)
            {
                projects.Add(trimmed);
                if (projects.Count >= 5) break;
            }
        }
        return projects;
    }

    private static List<string> ExtractCertifications(string text)
    {
        var certs = new List<string>();
        var certKeywords = new[] { "certified", "certification", "certificate", "aws", "azure", "google cloud", "oracle", "microsoft" };
        var lines = text.Split('\n');

        foreach (var line in lines)
        {
            if (certKeywords.Any(k => line.Contains(k, StringComparison.OrdinalIgnoreCase))
                && line.Trim().Length < 150)
            {
                certs.Add(line.Trim());
            }
        }
        return certs.Take(5).ToList();
    }

    private static int CalculateFormatScore(string text)
    {
        int score = 50;
        if (text.Contains("@")) score += 10; // Has email
        if (Regex.IsMatch(text, @"\d{10}")) score += 10; // Has phone
        if (text.Length > 1000) score += 10; // Adequate length
        if (text.Contains("github", StringComparison.OrdinalIgnoreCase)) score += 10;
        if (text.Contains("linkedin", StringComparison.OrdinalIgnoreCase)) score += 10;
        return Math.Min(score, 100);
    }

    private static int CalculateKeywordScore(string text)
    {
        var importantKeywords = new[] {
            "experience", "project", "education", "skill", "certification",
            "achievement", "responsibility", "objective", "summary"
        };
        int found = importantKeywords.Count(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
        return (int)((double)found / importantKeywords.Length * 100);
    }

    private static List<ResumeSuggestionDto> GenerateSuggestions(string text, List<string> skills, List<string> projects)
    {
        var suggestions = new List<ResumeSuggestionDto>();

        if (!text.Contains("github", StringComparison.OrdinalIgnoreCase))
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Links",
                Issue = "Missing GitHub profile",
                Suggestion = "Add your GitHub profile URL to showcase your code",
                Priority = "High"
            });
        }

        if (projects.Count < 2)
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Projects",
                Issue = "Insufficient projects",
                Suggestion = "Add at least 2-3 projects with descriptions and tech stack",
                Priority = "High"
            });
        }

        if (!Regex.IsMatch(text, @"\d+%|\d+ percent|improved|increased|reduced", RegexOptions.IgnoreCase))
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Achievements",
                Issue = "No measurable achievements",
                Suggestion = "Add quantifiable achievements (e.g., improved performance by 30%)",
                Priority = "High"
            });
        }

        if (skills.Count < 5)
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Skills",
                Issue = "Low skill count",
                Suggestion = "List more relevant technical skills in a dedicated Skills section",
                Priority = "Medium"
            });
        }

        if (!text.Contains("linkedin", StringComparison.OrdinalIgnoreCase))
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Links",
                Issue = "Missing LinkedIn profile",
                Suggestion = "Add your LinkedIn profile URL",
                Priority = "Medium"
            });
        }

        if (text.Length < 500)
        {
            suggestions.Add(new ResumeSuggestionDto
            {
                Category = "Content",
                Issue = "Resume is too short",
                Suggestion = "Expand resume content with more details about experience and projects",
                Priority = "High"
            });
        }

        return suggestions;
    }

    private static ResumeAnalysisDto MapToDto(ResumeAnalysis r) => new()
    {
        Id = r.Id,
        StudentId = r.StudentId,
        FileName = r.FileName,
        AtsScore = r.AtsScore,
        FormatScore = r.FormatScore,
        KeywordScore = r.KeywordScore,
        ProjectScore = r.ProjectScore,
        CertificationScore = r.CertificationScore,
        ExperienceScore = r.ExperienceScore,
        SkillMatchScore = r.SkillMatchScore,
        ExtractedSkills = JsonSerializer.Deserialize<List<string>>(r.ExtractedSkills) ?? new(),
        ExtractedProjects = JsonSerializer.Deserialize<List<string>>(r.ExtractedProjects) ?? new(),
        ExtractedCertifications = JsonSerializer.Deserialize<List<string>>(r.ExtractedCertifications) ?? new(),
        Suggestions = JsonSerializer.Deserialize<List<ResumeSuggestionDto>>(r.Suggestions) ?? new(),
        AnalyzedAt = r.CreatedAt
    };
}
