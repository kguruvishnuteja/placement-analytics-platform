using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Company;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService) => _companyService = companyService;

    /// <summary>Get all active companies</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var result = await _companyService.GetAllCompaniesAsync(request);
        return Ok(result);
    }

    /// <summary>Get company by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _companyService.GetCompanyByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>Create a new company (Officer/Admin)</summary>
    [HttpPost]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCompanyDto dto)
    {
        var result = await _companyService.CreateCompanyAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Update company (Officer/Admin)</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCompanyDto dto)
    {
        var result = await _companyService.UpdateCompanyAsync(id, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete company (Officer/Admin)</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _companyService.DeleteCompanyAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Check eligibility for a specific company</summary>
    [HttpGet("{id:guid}/eligibility")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> CheckEligibility(Guid id)
    {
        var result = await _companyService.CheckEligibilityAsync(User.GetUserId(), id);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get skill gap analysis for a company</summary>
    [HttpGet("{id:guid}/skill-gap")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetSkillGap(Guid id)
    {
        var result = await _companyService.GetSkillGapAsync(User.GetUserId(), id);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get all eligible companies for current student</summary>
    [HttpGet("eligible")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetEligibleCompanies()
    {
        var result = await _companyService.GetEligibleCompaniesForStudentAsync(User.GetUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Create a recruitment drive</summary>
    [HttpPost("drives")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> CreateDrive([FromBody] CreateRecruitmentDriveDto dto)
    {
        var result = await _companyService.CreateDriveAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get all recruitment drives</summary>
    [HttpGet("drives")]
    public async Task<IActionResult> GetDrives()
    {
        var result = await _companyService.GetDrivesAsync();
        return Ok(result);
    }

    /// <summary>Update a recruitment drive</summary>
    [HttpPut("drives/{driveId:guid}")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> UpdateDrive(Guid driveId, [FromBody] UpdateRecruitmentDriveDto dto)
    {
        var result = await _companyService.UpdateDriveAsync(driveId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete a recruitment drive</summary>
    [HttpDelete("drives/{driveId:guid}")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> DeleteDrive(Guid driveId)
    {
        var result = await _companyService.DeleteDriveAsync(driveId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
