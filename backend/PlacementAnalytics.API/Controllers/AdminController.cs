using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Admin;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService) => _adminService = adminService;

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] PagedRequest request,
        [FromQuery] string? role,
        [FromQuery] bool? isActive)
    {
        var result = await _adminService.GetUsersAsync(request, role, isActive);
        return Ok(result);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto dto)
    {
        var result = await _adminService.CreateUserAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("users/{userId:guid}")]
    public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateAdminUserDto dto)
    {
        var result = await _adminService.UpdateUserAsync(User.GetUserId(), userId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        var result = await _adminService.DeleteUserAsync(User.GetUserId(), userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
