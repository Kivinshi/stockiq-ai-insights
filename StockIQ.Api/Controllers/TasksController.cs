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
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetTodayTasks()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<StaffTaskResponse>());

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var tasks = await _context.Tasks
            .Where(t =>
                t.BusinessId == user.BusinessId.Value &&
                t.DueDate >= today &&
                t.DueDate < tomorrow &&
                (t.AssignedToUserId == null || t.AssignedToUserId == user.Id))
            .OrderBy(t => t.IsDone)
            .ThenBy(t => t.CreatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(CreateStaffTaskRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role != "admin" && user.Role != "manager")
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Task title is required.");

        var task = new StaffTask
        {
            BusinessId = user.BusinessId.Value,
            AssignedToUserId = request.AssignedToUserId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            DueDate = request.DueDate?.Date ?? DateTime.UtcNow.Date
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(task));
    }

    [HttpPut("{id:guid}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Task not found.");

        var task = await _context.Tasks.FirstOrDefaultAsync(t =>
            t.Id == id &&
            t.BusinessId == user.BusinessId.Value &&
            (t.AssignedToUserId == null || t.AssignedToUserId == user.Id || user.Role == "admin" || user.Role == "manager"));

        if (task == null) return NotFound("Task not found.");

        task.IsDone = !task.IsDone;
        await _context.SaveChangesAsync();

        return Ok(ToResponse(task));
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static StaffTaskResponse ToResponse(StaffTask task)
    {
        return new StaffTaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Due = task.DueDate.Date == DateTime.UtcNow.Date ? "Today" : task.DueDate.ToString("dd MMM"),
            Done = task.IsDone
        };
    }
}