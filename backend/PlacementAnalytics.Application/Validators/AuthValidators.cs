using PlacementAnalytics.Application.DTOs.Auth;

namespace PlacementAnalytics.Application.Validators;

/// <summary>
/// Lightweight validators using DataAnnotations (applied via RegisterDto attributes).
/// For production, replace with FluentValidation package and AbstractValidator&lt;T&gt;.
/// </summary>
public static class AuthValidators
{
    public static (bool isValid, string error) ValidateRegister(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return (false, "Email is required.");
        if (!dto.Email.Contains('@'))
            return (false, "Invalid email format.");
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            return (false, "Password must be at least 8 characters.");
        if (string.IsNullOrWhiteSpace(dto.FirstName))
            return (false, "First name is required.");
        if (string.IsNullOrWhiteSpace(dto.LastName))
            return (false, "Last name is required.");
        return (true, string.Empty);
    }

    public static (bool isValid, string error) ValidateLogin(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return (false, "Email is required.");
        if (string.IsNullOrWhiteSpace(dto.Password))
            return (false, "Password is required.");
        return (true, string.Empty);
    }

    public static (bool isValid, string error) ValidateResetPassword(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return (false, "Reset token is required.");
        if (string.IsNullOrWhiteSpace(dto.Email))
            return (false, "Email is required.");
        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
            return (false, "Password must be at least 8 characters.");
        return (true, string.Empty);
    }
}
