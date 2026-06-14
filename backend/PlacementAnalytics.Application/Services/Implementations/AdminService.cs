using Microsoft.EntityFrameworkCore;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Admin;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Application.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<Student> _studentRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AdminService(
        IRepository<User> userRepo,
        IRepository<Student> studentRepo,
        IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _studentRepo = studentRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync(
        PagedRequest request, string? role, bool? isActive)
    {
        var query = _userRepo.Query()
            .Include(u => u.Student)
            .Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(term) ||
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                (u.Student != null && u.Student.RollNumber.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var parsedRole))
            query = query.Where(u => u.Role == parsedRole);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return ApiResponse<List<AdminUserDto>>.SuccessResponse(users.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<AdminUserDto>> CreateUserAsync(CreateAdminUserDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        if (await _userRepo.ExistsAsync(u => u.Email == email && !u.IsDeleted))
            return ApiResponse<AdminUserDto>.FailureResponse("Email already registered.");

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            return ApiResponse<AdminUserDto>.FailureResponse("Invalid user role.");

        var user = new User
        {
            Email = email,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            IsActive = true,
            IsEmailVerified = true
        };

        await _userRepo.AddAsync(user);
        if (role == UserRole.Student)
            await _studentRepo.AddAsync(new Student { UserId = user.Id });

        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<AdminUserDto>.SuccessResponse(MapToDto(user), "User created.");
    }

    public async Task<ApiResponse<AdminUserDto>> UpdateUserAsync(
        Guid currentUserId, Guid userId, UpdateAdminUserDto dto)
    {
        var user = await _userRepo.Query()
            .Include(u => u.Student)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
        if (user == null)
            return ApiResponse<AdminUserDto>.FailureResponse("User not found.");

        if (currentUserId == userId && !dto.IsActive)
            return ApiResponse<AdminUserDto>.FailureResponse("You cannot deactivate your own account.");

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            return ApiResponse<AdminUserDto>.FailureResponse("Invalid user role.");

        var email = dto.Email.Trim().ToLower();
        if (await _userRepo.ExistsAsync(u => u.Id != userId && u.Email == email && !u.IsDeleted))
            return ApiResponse<AdminUserDto>.FailureResponse("Email already registered.");

        user.Email = email;
        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.Role = role;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        if (role == UserRole.Student && user.Student == null)
        {
            var student = new Student { UserId = user.Id };
            await _studentRepo.AddAsync(student);
            user.Student = student;
        }

        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<AdminUserDto>.SuccessResponse(MapToDto(user), "User updated.");
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(Guid currentUserId, Guid userId)
    {
        if (currentUserId == userId)
            return ApiResponse<bool>.FailureResponse("You cannot delete your own account.");

        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
            return ApiResponse<bool>.FailureResponse("User not found.");

        user.IsDeleted = true;
        user.IsActive = false;
        user.RefreshToken = null;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "User deleted.");
    }

    private static AdminUserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = user.Role.ToString(),
        IsActive = user.IsActive,
        IsEmailVerified = user.IsEmailVerified,
        CreatedAt = user.CreatedAt,
        Branch = user.Student?.Branch,
        RollNumber = user.Student?.RollNumber,
        CurrentCgpa = user.Student?.CurrentCgpa,
        ProfileCompletionPercent = user.Student?.ProfileCompletionPercent
    };
}
