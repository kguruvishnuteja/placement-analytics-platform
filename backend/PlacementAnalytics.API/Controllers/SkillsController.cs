using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillsController(ISkillService skillService) => _skillService = skillService;

    /// <summary>Get all skills, optionally filtered by category</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var result = await _skillService.GetAllSkillsAsync(category);
        return Ok(result);
    }

    /// <summary>Create a new skill (Admin only)</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSkillRequest request)
    {
        var result = await _skillService.CreateSkillAsync(request.Name, request.Category, request.Description);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete a skill (Admin only)</summary>
    [HttpDelete("{skillId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid skillId)
    {
        var result = await _skillService.DeleteSkillAsync(skillId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public record CreateSkillRequest(string Name, string Category, string? Description);
