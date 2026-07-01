using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockIQ.Api.Data;
using StockIQ.Api.DTOs;
using StockIQ.Api.Models;

namespace StockIQ.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<NotificationResponse>());

        await EnsureAutoNotifications(user.BusinessId.Value);

        var notifications = await _context.Notifications
            .Where(n =>
                n.BusinessId == user.BusinessId.Value &&
                (n.UserId == null || n.UserId == user.Id))
            .OrderBy(n => n.IsRead)
            .ThenByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => ToResponse(n))
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost]
    public async Task<IActionResult> CreateNotification(CreateNotificationRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role != "admin" && user.Role != "manager")
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Notification title is required.");

        var notification = new Notification
        {
            BusinessId = user.BusinessId.Value,
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Body = request.Body.Trim(),
            Tone = request.Tone,
            Type = request.Type
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(notification));
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Notification not found.");

        var notification = await _context.Notifications.FirstOrDefaultAsync(n =>
            n.Id == id &&
            n.BusinessId == user.BusinessId.Value &&
            (n.UserId == null || n.UserId == user.Id));

        if (notification == null) return NotFound("Notification not found.");

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(ToResponse(notification));
    }

    private async Task EnsureAutoNotifications(Guid businessId)
    {
        var lowStockProducts = await _context.Products
            .Where(p => p.BusinessId == businessId && p.Stock <= p.MinStock)
            .Take(5)
            .ToListAsync();

        foreach (var product in lowStockProducts)
        {
            var title = "Low stock alert";
            var body = $"{product.Name} ({product.Sku}) is below minimum threshold.";

            var exists = await _context.Notifications.AnyAsync(n =>
                n.BusinessId == businessId &&
                n.Title == title &&
                n.Body == body &&
                n.CreatedAt > DateTime.UtcNow.AddDays(-1));

            if (!exists)
            {
                _context.Notifications.Add(new Notification
                {
                    BusinessId = businessId,
                    Title = title,
                    Body = body,
                    Tone = product.Stock <= 0 ? "destructive" : "warning",
                    Type = "stock"
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static NotificationResponse ToResponse(Notification notification)
    {
        return new NotificationResponse
        {
            Id = notification.Id,
            Title = notification.Title,
            Body = notification.Body,
            Tone = notification.Tone,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            Time = ToRelativeTime(notification.CreatedAt)
        };
    }

    private static string ToRelativeTime(DateTime date)
    {
        var diff = DateTime.UtcNow - date;

        if (diff.TotalMinutes < 1) return "Just now";
        if (diff.TotalMinutes < 60) return $"{Math.Floor(diff.TotalMinutes)}m ago";
        if (diff.TotalHours < 24) return $"{Math.Floor(diff.TotalHours)}h ago";
        if (diff.TotalDays < 2) return "Yesterday";
        return $"{Math.Floor(diff.TotalDays)} days ago";
    }
}