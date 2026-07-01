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
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("admin")]
    public async Task<IActionResult> Admin()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();
        if (user.Role != "admin") return Forbid();

        return Ok(await BuildDashboard(user.BusinessId.Value));
    }

    [HttpGet("manager")]
    public async Task<IActionResult> Manager()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();
        if (user.Role != "admin" && user.Role != "manager") return Forbid();

        return Ok(await BuildDashboard(user.BusinessId.Value));
    }

    [HttpGet("staff")]
    public async Task<IActionResult> Staff()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        return Ok(await BuildDashboard(user.BusinessId.Value));
    }

    [HttpGet("viewer")]
    public async Task<IActionResult> Viewer()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        return Ok(await BuildDashboard(user.BusinessId.Value));
    }

    private async Task<DashboardResponse> BuildDashboard(Guid businessId)
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var tomorrow = today.AddDays(1);

        var products = await _context.Products
            .Where(p => p.BusinessId == businessId)
            .ToListAsync();

        var users = await _context.Users
            .Where(u => u.BusinessId == businessId)
            .ToListAsync();

        var branches = await _context.Branches
            .Where(b => b.BusinessId == businessId && b.IsActive)
            .ToListAsync();

        var orders = await _context.SalesOrders
            .Include(o => o.Customer)
            .Where(o => o.BusinessId == businessId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var transactions = await _context.InventoryTransactions
            .Where(t => t.BusinessId == businessId)
            .ToListAsync();

        var suppliers = await _context.Suppliers
            .Where(s => s.BusinessId == businessId)
            .OrderByDescending(s => s.Score)
            .ToListAsync();

        var lowStockItems = products
            .Where(p => p.Stock <= p.MinStock)
            .OrderBy(p => p.Stock)
            .Take(8)
            .Select(p => new LowStockDashboardItem
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = p.Name,
                Stock = p.Stock,
                MinStock = p.MinStock,
                Status = p.Stock <= 0 ? "out" : "low",
                SuggestedReorder = Math.Max(50, p.MinStock * 2)
            })
            .ToList();

        var response = new DashboardResponse
        {
            Kpis = new DashboardKpis
            {
                TotalProducts = products.Count,
                ActiveUsers = users.Count(u => u.Status == "active"),
                Branches = branches.Count,
                TodaySales = orders
                    .Where(o => o.Status == "paid" && o.CreatedAt >= today && o.CreatedAt < tomorrow)
                    .Sum(o => o.Total),
                MonthlyRevenue = orders
                    .Where(o => o.Status == "paid" && o.CreatedAt >= monthStart)
                    .Sum(o => o.Total),
                InventoryValue = products.Sum(p => p.Stock * p.Price),
                LowStock = lowStockItems.Count,
                PendingOrders = orders.Count(o => o.Status == "pending"),
                OrdersToday = orders.Count(o => o.CreatedAt >= today && o.CreatedAt < tomorrow),
                StockInToday = transactions
                    .Where(t => t.Type == "in" && t.CreatedAt >= today && t.CreatedAt < tomorrow)
                    .Sum(t => t.Quantity),
                StockOutToday = transactions
                    .Where(t => t.Type == "out" && t.CreatedAt >= today && t.CreatedAt < tomorrow)
                    .Sum(t => t.Quantity)
            },
            SalesTrend = BuildSalesTrend(orders),
            CategoryShare = BuildCategoryShare(products),
            LowStockItems = lowStockItems,
            SupplierScores = suppliers
                .Take(8)
                .Select(s => new SupplierScoreItem
                {
                    Id = s.Id,
                    Name = s.Name,
                    Score = s.Score
                })
                .ToList(),
            RecentOrders = orders
                .Take(8)
                .Select(o => new DashboardOrderItem
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    Customer = o.Customer?.Name ?? "",
                    Total = o.Total,
                    Status = o.Status,
                    Date = o.CreatedAt
                })
                .ToList()
        };

        response.Insights = BuildInsights(response);

        return response;
    }

    private static List<ChartPoint> BuildSalesTrend(List<SalesOrder> orders)
    {
        var start = DateTime.UtcNow.Date.AddDays(-6);

        return Enumerable.Range(0, 7)
            .Select(offset => start.AddDays(offset))
            .Select(day =>
            {
                var sales = orders
                    .Where(o => o.Status == "paid" && o.CreatedAt.Date == day)
                    .Sum(o => o.Total);

                var expense = Math.Round(sales * 0.62m, 2);

                return new ChartPoint
                {
                    Label = day.ToString("ddd"),
                    Sales = sales,
                    Forecast = Math.Round(sales * 1.08m, 2),
                    Expense = expense,
                    Profit = sales - expense
                };
            })
            .ToList();
    }

    private static List<CategorySharePoint> BuildCategoryShare(List<Product> products)
    {
        if (products.Count == 0) return new List<CategorySharePoint>();

        var total = products.Count;

        return products
            .GroupBy(p => string.IsNullOrWhiteSpace(p.Category) ? "Uncategorized" : p.Category)
            .Select(g => new CategorySharePoint
            {
                Name = g.Key,
                Value = (int)Math.Round((decimal)g.Count() / total * 100)
            })
            .OrderByDescending(c => c.Value)
            .Take(6)
            .ToList();
    }

    private static List<DashboardInsight> BuildInsights(DashboardResponse dashboard)
    {
        var insights = new List<DashboardInsight>();

        if (dashboard.Kpis.LowStock > 0)
        {
            insights.Add(new DashboardInsight
            {
                Title = "Low stock needs attention",
                Body = $"{dashboard.Kpis.LowStock} products are at or below minimum stock.",
                Level = "warning"
            });
        }

        if (dashboard.Kpis.PendingOrders > 0)
        {
            insights.Add(new DashboardInsight
            {
                Title = "Pending orders",
                Body = $"{dashboard.Kpis.PendingOrders} orders are awaiting payment or fulfillment.",
                Level = "info"
            });
        }

        if (dashboard.Kpis.MonthlyRevenue > 0)
        {
            insights.Add(new DashboardInsight
            {
                Title = "Revenue active",
                Body = $"This month revenue is ₹{dashboard.Kpis.MonthlyRevenue:N0}.",
                Level = "success"
            });
        }

        if (insights.Count == 0)
        {
            insights.Add(new DashboardInsight
            {
                Title = "System ready",
                Body = "Add products, stock movements and sales orders to unlock dashboard insights.",
                Level = "primary"
            });
        }

        return insights;
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }
}