using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Domain.Enums;

namespace PlacementAnalytics.Application.Services.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, string? actionUrl = null);
    Task SendBulkNotificationAsync(IEnumerable<Guid> userIds, string title, string message, NotificationType type);
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId);
    Task<ApiResponse<bool>> MarkAsReadAsync(Guid userId, Guid notificationId);
    Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId);
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
