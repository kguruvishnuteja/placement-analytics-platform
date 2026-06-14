using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlacementAnalytics.API.Extensions;
using PlacementAnalytics.Application.Services.Interfaces;

namespace PlacementAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
        => _notificationService = notificationService;

    /// <summary>Get notifications for current user</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var result = await _notificationService.GetUserNotificationsAsync(User.GetUserId());
        return Ok(result);
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        var result = await _notificationService.MarkAsReadAsync(User.GetUserId(), notificationId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _notificationService.MarkAllAsReadAsync(User.GetUserId());
        return Ok(result);
    }
}
