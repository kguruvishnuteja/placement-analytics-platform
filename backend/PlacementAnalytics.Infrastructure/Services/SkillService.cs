using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Student;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;

namespace PlacementAnalytics.Infrastructure.Services;

public class SkillService : ISkillService
{
    private readonly IRepository<Skill> _skillRepo;
    private readonly IUnitOfWork _unitOfWork;

    public SkillService(IRepository<Skill> skillRepo, IUnitOfWork unitOfWork)
    {
        _skillRepo = skillRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<SkillDto>>> GetAllSkillsAsync(string? category = null)
    {
        var skills = string.IsNullOrEmpty(category)
            ? await _skillRepo.GetAllAsync()
            : await _skillRepo.FindAsync(s => s.Category == category);

        return ApiResponse<List<SkillDto>>.SuccessResponse(skills.Select(s => new SkillDto
        {
            Id = s.Id,
            Name = s.Name,
            Category = s.Category
        }).OrderBy(s => s.Category).ThenBy(s => s.Name).ToList());
    }

    public async Task<ApiResponse<SkillDto>> CreateSkillAsync(string name, string category, string? description = null)
    {
        var exists = await _skillRepo.ExistsAsync(s => s.Name.ToLower() == name.ToLower());
        if (exists) return ApiResponse<SkillDto>.FailureResponse("Skill already exists.");

        var skill = new Skill { Name = name, Category = category, Description = description };
        await _skillRepo.AddAsync(skill);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<SkillDto>.SuccessResponse(new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Category = skill.Category
        });
    }

    public async Task<ApiResponse<bool>> DeleteSkillAsync(Guid skillId)
    {
        var skill = await _skillRepo.GetByIdAsync(skillId);
        if (skill == null) return ApiResponse<bool>.FailureResponse("Skill not found.");

        _skillRepo.Remove(skill);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true);
    }
}
