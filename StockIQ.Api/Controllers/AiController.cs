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
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly AppDbContext _context;

    public AiController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var businessId = user.BusinessId.Value;

        var products = await _context.Products
            .Where(p => p.BusinessId == businessId)
            .ToListAsync();

        var orders = await _context.SalesOrders
            .Where(o => o.BusinessId == businessId)
            .ToListAsync();

        var suppliers = await _context.Suppliers
            .Where(s => s.BusinessId == businessId)
            .ToListAsync();

        var insights = new List<AiInsightResponse>();

        var lowStockCount = products.Count(p => p.Stock <= p.MinStock);
        if (lowStockCount > 0)
        {
            insights.Add(new AiInsightResponse
            {
                Title = "Low stock risk detected",
                Body = $"{lowStockCount} products are at or below minimum stock. Review reorder suggestions.",
                Level = "warning",
                Category = "inventory"
            });
        }

        var outOfStockCount = products.Count(p => p.Stock <= 0);
        if (outOfStockCount > 0)
        {
            insights.Add(new AiInsightResponse
            {
                Title = "Out-of-stock products",
                Body = $"{outOfStockCount} products are unavailable and may block sales.",
                Level = "danger",
                Category = "inventory"
            });
        }

        var last7 = DateTime.UtcNow.AddDays(-7);
        var recentRevenue = orders
            .Where(o => o.Status == "paid" && o.CreatedAt >= last7)
            .Sum(o => o.Total);

        if (recentRevenue > 0)
        {
            insights.Add(new AiInsightResponse
            {
                Title = "Revenue momentum",
                Body = $"Paid sales in the last 7 days are ₹{recentRevenue:N0}.",
                Level = "success",
                Category = "sales"
            });
        }

        var weakSuppliers = suppliers.Where(s => s.Score < 70).ToList();
        if (weakSuppliers.Count > 0)
        {
            insights.Add(new AiInsightResponse
            {
                Title = "Supplier performance warning",
                Body = $"{weakSuppliers.Count} suppliers have performance score below 70.",
                Level = "warning",
                Category = "suppliers"
            });
        }

        if (insights.Count == 0)
        {
            insights.Add(new AiInsightResponse
            {
                Title = "No major risks detected",
                Body = "Inventory, sales, and suppliers look stable based on current data.",
                Level = "primary",
                Category = "general"
            });
        }

        return Ok(insights);
    }

    [HttpGet("reorder-suggestions")]
    public async Task<IActionResult> GetReorderSuggestions()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var suggestions = await _context.Products
            .Where(p => p.BusinessId == user.BusinessId.Value && p.Stock <= p.MinStock)
            .OrderBy(p => p.Stock)
            .Select(p => new ReorderSuggestionResponse
            {
                ProductId = p.Id,
                Sku = p.Sku,
                ProductName = p.Name,
                CurrentStock = p.Stock,
                MinStock = p.MinStock,
                SuggestedQuantity = Math.Max(50, p.MinStock * 2 - p.Stock),
                Priority = p.Stock <= 0 ? "high" : "medium",
                Reason = p.Stock <= 0
                    ? "Product is out of stock."
                    : "Product is below minimum stock."
            })
            .ToListAsync();

        return Ok(suggestions);
    }

    [HttpGet("demand-forecast")]
    public async Task<IActionResult> GetDemandForecast()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var businessId = user.BusinessId.Value;
        var last7 = DateTime.UtcNow.AddDays(-7);
        var previous7 = DateTime.UtcNow.AddDays(-14);

        var products = await _context.Products
            .Where(p => p.BusinessId == businessId)
            .ToListAsync();

        var orderItems = await _context.SalesOrderItems
            .Include(i => i.SalesOrder)
            .Where(i =>
                i.SalesOrder != null &&
                i.SalesOrder.BusinessId == businessId &&
                i.SalesOrder.Status != "cancelled" &&
                i.SalesOrder.CreatedAt >= previous7)
            .ToListAsync();

        var forecast = products.Select(product =>
        {
            var last7Sold = orderItems
                .Where(i => i.ProductId == product.Id && i.SalesOrder!.CreatedAt >= last7)
                .Sum(i => i.Quantity);

            var prev7Sold = orderItems
                .Where(i => i.ProductId == product.Id && i.SalesOrder!.CreatedAt < last7)
                .Sum(i => i.Quantity);

            var trend = last7Sold > prev7Sold ? "rising" : last7Sold < prev7Sold ? "falling" : "stable";
            var forecastQty = trend == "rising"
                ? (int)Math.Ceiling(last7Sold * 1.2)
                : trend == "falling"
                    ? (int)Math.Ceiling(last7Sold * 0.85)
                    : last7Sold;

            return new DemandForecastResponse
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Last7DaysSold = last7Sold,
                ForecastNext7Days = forecastQty,
                Trend = trend
            };
        })
        .Where(f => f.Last7DaysSold > 0 || f.ForecastNext7Days > 0)
        .OrderByDescending(f => f.ForecastNext7Days)
        .Take(20)
        .ToList();

        return Ok(forecast);
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }
}