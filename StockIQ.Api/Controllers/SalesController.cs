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
[Route("api/sales")]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("trend")]
    public async Task<IActionResult> GetTrend([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<SalesTrendResponse>());

        var end = to?.Date.AddDays(1) ?? DateTime.UtcNow.Date.AddDays(1);
        var start = from?.Date ?? end.AddDays(-7);

        var orders = await _context.SalesOrders
            .Where(o =>
                o.BusinessId == user.BusinessId.Value &&
                o.Status == "paid" &&
                o.CreatedAt >= start &&
                o.CreatedAt < end)
            .ToListAsync();

        var days = Enumerable.Range(0, Math.Max(1, (end.Date - start.Date).Days))
            .Select(offset => start.Date.AddDays(offset))
            .Select(day => new SalesTrendResponse
            {
                Date = day,
                Label = day.ToString("ddd"),
                Sales = orders
                    .Where(o => o.CreatedAt.Date == day)
                    .Sum(o => o.Total)
            })
            .ToList();

        return Ok(days);
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }
}