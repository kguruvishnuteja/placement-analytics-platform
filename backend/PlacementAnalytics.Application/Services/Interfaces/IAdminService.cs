using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Admin;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface IAdminService
{
    Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync(PagedRequest request, string? role, bool? isActive);
    Task<ApiResponse<AdminUserDto>> CreateUserAsync(CreateAdminUserDto dto);
    Task<ApiResponse<AdminUserDto>> UpdateUserAsync(Guid currentUserId, Guid userId, UpdateAdminUserDto dto);
    Task<ApiResponse<bool>> DeleteUserAsync(Guid currentUserId, Guid userId);
}
