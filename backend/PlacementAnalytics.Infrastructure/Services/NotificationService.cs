using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Common.Models;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Domain.Entities;
using PlacementAnalytics.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace PlacementAnalytics.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notificationRepo;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IRepository<Notification> notificationRepo, IUnitOfWork unitOfWork)
    {
        _notificationRepo = notificationRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, string? actionUrl = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ActionUrl = actionUrl
        };
        await _notificationRepo.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task SendBulkNotificationAsync(IEnumerable<Guid> userIds, string title, string message, NotificationType type)
    {
        var notifications = userIds.Select(uid => new Notification
        {
            UserId = uid,
            Title = title,
            Message = message,
            Type = type
        }).ToList();

        await _notificationRepo.AddRangeAsync(notifications);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId)
    {
        var notifications = await _notificationRepo.Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return ApiResponse<List<NotificationDto>>.SuccessResponse(notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString(),
            IsRead = n.IsRead,
            ActionUrl = n.ActionUrl,
            CreatedAt = n.CreatedAt
        }).ToList());
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var notification = await _notificationRepo.FirstOrDefaultAsync(n =>
            n.Id == notificationId && n.UserId == userId);

        if (notification == null) return ApiResponse<bool>.FailureResponse("Notification not found.");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true);
    }

    public async Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _notificationRepo.FindAsync(n => n.UserId == userId && !n.IsRead);
        foreach (var n in notifications)
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true);
    }
}
