using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResumeController : ControllerBase
{
    private readonly IResumeService _resumeService;

    public ResumeController(IResumeService resumeService) => _resumeService = resumeService;

    /// <summary>Upload and analyze resume (PDF/DOC/DOCX, max 10MB)</summary>
    [HttpPost("upload")]
    [Authorize(Roles = "Student")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        var result = await _resumeService.AnalyzeResumeAsync(User.GetUserId(), file);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get latest resume analysis</summary>
    [HttpGet("latest")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetLatest()
    {
        var result = await _resumeService.GetLatestAnalysisAsync(User.GetUserId());
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>Get resume analysis history</summary>
    [HttpGet("history")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetHistory()
    {
        var result = await _resumeService.GetAnalysisHistoryAsync(User.GetUserId());
        return Ok(result);
    }

    /// <summary>Get specific resume analysis by ID</summary>
    [HttpGet("{analysisId:guid}")]
    public async Task<IActionResult> GetById(Guid analysisId)
    {
        var result = await _resumeService.GetAnalysisByIdAsync(analysisId);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
