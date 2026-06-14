using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.DTOs.Analytics;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService) => _analyticsService = analyticsService;

    /// <summary>Calculate and get placement readiness score</summary>
    [HttpGet("readiness-score")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetReadinessScore()
    {
        var result = await _analyticsService.CalculateReadinessScoreAsync(User.GetUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get placement prediction</summary>
    [HttpGet("prediction")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetPrediction()
    {
        var result = await _analyticsService.GetPredictionAsync(User.GetUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get student dashboard data</summary>
    [HttpGet("student-dashboard")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetStudentDashboard()
    {
        var result = await _analyticsService.GetStudentDashboardAsync(User.GetUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get placement officer dashboard data</summary>
    [HttpGet("officer-dashboard")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> GetOfficerDashboard()
    {
        var result = await _analyticsService.GetOfficerDashboardAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get admin dashboard data</summary>
    [HttpGet("admin-dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var result = await _analyticsService.GetAdminDashboardAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get scoring rules configuration</summary>
    [HttpGet("scoring-rules")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetScoringRules()
    {
        var result = await _analyticsService.GetScoringRulesAsync();
        return Ok(result);
    }

    /// <summary>Update scoring rule</summary>
    [HttpPut("scoring-rules/{ruleId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateScoringRule(Guid ruleId, [FromBody] UpdateScoringRuleDto dto)
    {
        var result = await _analyticsService.UpdateScoringRuleAsync(ruleId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get student-level readiness data for reporting</summary>
    [HttpGet("reports/student-readiness")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> GetStudentReadinessReport()
    {
        var result = await _analyticsService.GetStudentReadinessReportAsync();
        return Ok(result);
    }
}
