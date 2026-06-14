using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.DTOs.Auth;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;
using PlacementAnalytics.Domain.Enums;
using BCrypt.Net;

namespace PlacementAnalytics.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<Student> _studentRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public AuthService(
        IRepository<User> userRepo,
        IRepository<Student> studentRepo,
        IUnitOfWork unitOfWork,
        IConfiguration config)
    {
        _userRepo = userRepo;
        _studentRepo = studentRepo;
        _unitOfWork = unitOfWork;
        _config = config;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        var exists = await _userRepo.ExistsAsync(u => u.Email == dto.Email.ToLower());
        if (exists)
            return ApiResponse<AuthResponseDto>.FailureResponse("Email already registered.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            role = UserRole.Student;

        var user = new User
        {
            Email = dto.Email.ToLower(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            EmailVerificationToken = GenerateToken(),
            EmailVerificationExpiry = DateTime.UtcNow.AddHours(24)
        };

        await _userRepo.AddAsync(user);

        if (role == UserRole.Student)
        {
            var student = new Student { UserId = user.Id };
            await _studentRepo.AddAsync(student);
        }

        await _unitOfWork.SaveChangesAsync();

        var (accessToken, refreshToken, expiry) = GenerateTokens(user);
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<AuthResponseDto>.SuccessResponse(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiry,
            User = MapUserDto(user)
        }, "Registration successful.");
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower() && !u.IsDeleted);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return ApiResponse<AuthResponseDto>.FailureResponse("Invalid email or password.");

        if (!user.IsActive)
            return ApiResponse<AuthResponseDto>.FailureResponse("Account is deactivated.");

        var (accessToken, refreshToken, expiry) = GenerateTokens(user);
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<AuthResponseDto>.SuccessResponse(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiry,
            User = MapUserDto(user)
        }, "Login successful.");
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u =>
            u.RefreshToken == dto.RefreshToken &&
            u.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null)
            return ApiResponse<AuthResponseDto>.FailureResponse("Invalid or expired refresh token.");

        var (accessToken, refreshToken, expiry) = GenerateTokens(user);
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<AuthResponseDto>.SuccessResponse(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiry,
            User = MapUserDto(user)
        });
    }

    public async Task<ApiResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user == null)
            return ApiResponse<bool>.SuccessResponse(true, "If email exists, reset link sent.");

        user.PasswordResetToken = GenerateToken();
        user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        // Email sending would be handled by a background job/email service
        return ApiResponse<bool>.SuccessResponse(true, "Password reset email sent.");
    }

    public async Task<ApiResponse<bool>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u =>
            u.Email == dto.Email.ToLower() &&
            u.PasswordResetToken == dto.Token &&
            u.PasswordResetExpiry > DateTime.UtcNow);

        if (user == null)
            return ApiResponse<bool>.FailureResponse("Invalid or expired reset token.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Password reset successfully.");
    }

    public async Task<ApiResponse<bool>> VerifyEmailAsync(VerifyEmailDto dto)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u =>
            u.Email == dto.Email.ToLower() &&
            u.EmailVerificationToken == dto.Token &&
            u.EmailVerificationExpiry > DateTime.UtcNow);

        if (user == null)
            return ApiResponse<bool>.FailureResponse("Invalid or expired verification token.");

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationExpiry = null;
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Email verified successfully.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<bool>.FailureResponse("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return ApiResponse<bool>.FailureResponse("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Password changed successfully.");
    }

    public async Task<ApiResponse<bool>> LogoutAsync(Guid userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            _userRepo.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }
        return ApiResponse<bool>.SuccessResponse(true, "Logged out successfully.");
    }

    private (string accessToken, string refreshToken, DateTime expiry) GenerateTokens(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(1);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return (accessToken, refreshToken, expiry);
    }

    private static string GenerateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    private static UserDto MapUserDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = user.Role.ToString(),
        IsEmailVerified = user.IsEmailVerified,
        ProfileImageUrl = user.ProfileImageUrl
    };
}
