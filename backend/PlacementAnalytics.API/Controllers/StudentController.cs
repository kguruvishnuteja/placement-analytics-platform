using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Student;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentController(IStudentService studentService) => _studentService = studentService;

    /// <summary>Get current student profile</summary>
    [HttpGet("profile")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _studentService.GetProfileAsync(User.GetUserId());
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>Update student profile</summary>
    [HttpPut("profile")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateStudentProfileDto dto)
    {
        var result = await _studentService.UpdateProfileAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get all students (Officer/Admin)</summary>
    [HttpGet]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> GetAllStudents([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetAllStudentsAsync(request);
        return Ok(result);
    }

    /// <summary>Get student by ID (Officer/Admin)</summary>
    [HttpGet("{studentId:guid}")]
    [Authorize(Roles = "PlacementOfficer,Admin")]
    public async Task<IActionResult> GetStudentById(Guid studentId)
    {
        var result = await _studentService.GetStudentByIdAsync(studentId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>Add skill to profile</summary>
    [HttpPost("skills")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> AddSkill([FromBody] AddStudentSkillDto dto)
    {
        var result = await _studentService.AddSkillAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Remove skill from profile</summary>
    [HttpDelete("skills/{skillId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> RemoveSkill(Guid skillId)
    {
        var result = await _studentService.RemoveSkillAsync(User.GetUserId(), skillId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Add project</summary>
    [HttpPost("projects")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> AddProject([FromBody] CreateProjectDto dto)
    {
        var result = await _studentService.AddProjectAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Update project</summary>
    [HttpPut("projects/{projectId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UpdateProject(Guid projectId, [FromBody] CreateProjectDto dto)
    {
        var result = await _studentService.UpdateProjectAsync(User.GetUserId(), projectId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete project</summary>
    [HttpDelete("projects/{projectId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> DeleteProject(Guid projectId)
    {
        var result = await _studentService.DeleteProjectAsync(User.GetUserId(), projectId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Add certification</summary>
    [HttpPost("certifications")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> AddCertification([FromBody] CreateCertificationDto dto)
    {
        var result = await _studentService.AddCertificationAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Update certification</summary>
    [HttpPut("certifications/{certId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UpdateCertification(Guid certId, [FromBody] CreateCertificationDto dto)
    {
        var result = await _studentService.UpdateCertificationAsync(User.GetUserId(), certId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete certification</summary>
    [HttpDelete("certifications/{certId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> DeleteCertification(Guid certId)
    {
        var result = await _studentService.DeleteCertificationAsync(User.GetUserId(), certId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Add internship experience</summary>
    [HttpPost("internships")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> AddInternship([FromBody] CreateInternshipDto dto)
    {
        var result = await _studentService.AddInternshipAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Update internship</summary>
    [HttpPut("internships/{internshipId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UpdateInternship(Guid internshipId, [FromBody] CreateInternshipDto dto)
    {
        var result = await _studentService.UpdateInternshipAsync(User.GetUserId(), internshipId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Delete internship</summary>
    [HttpDelete("internships/{internshipId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> DeleteInternship(Guid internshipId)
    {
        var result = await _studentService.DeleteInternshipAsync(User.GetUserId(), internshipId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Get profile completion percentage</summary>
    [HttpGet("profile-completion")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetProfileCompletion()
    {
        var result = await _studentService.CalculateProfileCompletionAsync(User.GetUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
