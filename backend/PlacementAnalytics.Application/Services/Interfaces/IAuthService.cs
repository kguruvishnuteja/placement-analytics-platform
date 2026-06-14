using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Auth;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto);
    Task<ApiResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<ApiResponse<bool>> ResetPasswordAsync(ResetPasswordDto dto);
    Task<ApiResponse<bool>> VerifyEmailAsync(VerifyEmailDto dto);
    Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<ApiResponse<bool>> LogoutAsync(Guid userId);
}
