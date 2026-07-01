using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockIQ.Api.Data;
using StockIQ.Api.DTOs;
using StockIQ.Api.Models;

namespace StockIQ.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("sales-summary")]
    public async Task<IActionResult> SalesSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var rows = await BuildSalesSummary(user.BusinessId.Value, from, to);
        return Ok(rows);
    }

    [HttpGet("inventory-valuation")]
    public async Task<IActionResult> InventoryValuation()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var rows = await BuildInventoryValuation(user.BusinessId.Value);
        return Ok(rows);
    }

    [HttpGet("gst")]
    public async Task<IActionResult> Gst([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var revenue = await GetRevenue(user.BusinessId.Value, from, to);
        var gstRate = 18m;
        var totalGst = Math.Round(revenue * gstRate / 100m, 2);

        return Ok(new GstReportResponse
        {
            TaxableSales = revenue,
            GstRate = gstRate,
            Cgst = Math.Round(totalGst / 2m, 2),
            Sgst = Math.Round(totalGst / 2m, 2),
            Igst = 0,
            TotalGst = totalGst
        });
    }

    [HttpGet("profit-loss")]
    public async Task<IActionResult> ProfitLoss([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var revenue = await GetRevenue(user.BusinessId.Value, from, to);
        var expense = Math.Round(revenue * 0.62m, 2);
        var profit = revenue - expense;
        var trend = await BuildSalesSummary(user.BusinessId.Value, from, to);

        return Ok(new ProfitLossResponse
        {
            Revenue = revenue,
            EstimatedExpense = expense,
            GrossProfit = profit,
            NetProfit = profit,
            Trend = trend
        });
    }

    [HttpGet("kpis")]
    public async Task<IActionResult> Kpis([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var revenue = await GetRevenue(user.BusinessId.Value, from, to);
        var expense = Math.Round(revenue * 0.62m, 2);
        var inventoryValue = await _context.Products
            .Where(p => p.BusinessId == user.BusinessId.Value)
            .SumAsync(p => p.Stock * p.Price);

        return Ok(new ReportKpisResponse
        {
            TotalRevenue = revenue,
            TotalExpense = expense,
            NetProfit = revenue - expense,
            GstCollected = Math.Round(revenue * 0.18m, 2),
            InventoryValue = inventoryValue
        });
    }

    [HttpGet("{type}/export")]
    public async Task<IActionResult> Export(string type, [FromQuery] string format = "xlsx")
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Unauthorized();

        var csv = type.ToLower() switch
        {
            "sales-summary" => ToSalesCsv(await BuildSalesSummary(user.BusinessId.Value, null, null)),
            "inventory-valuation" => ToInventoryCsv(await BuildInventoryValuation(user.BusinessId.Value)),
            "gst" => ToGstCsv(await BuildGst(user.BusinessId.Value)),
            "profit-loss" => ToProfitLossCsv(await BuildProfitLoss(user.BusinessId.Value)),
            _ => null
        };

        if (csv == null) return NotFound("Report type not found.");

        var bytes = Encoding.UTF8.GetBytes(csv);
        var fileName = $"{type}-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    private async Task<List<SalesSummaryRow>> BuildSalesSummary(Guid businessId, DateTime? from, DateTime? to)
    {
        var end = to?.Date.AddDays(1) ?? DateTime.UtcNow.Date.AddDays(1);
        var start = from?.Date ?? end.AddDays(-7);

        var orders = await _context.SalesOrders
            .Where(o =>
                o.BusinessId == businessId &&
                o.Status == "paid" &&
                o.CreatedAt >= start &&
                o.CreatedAt < end)
            .ToListAsync();

        return Enumerable.Range(0, Math.Max(1, (end.Date - start.Date).Days))
            .Select(offset => start.Date.AddDays(offset))
            .Select(day => new SalesSummaryRow
            {
                Date = day,
                Label = day.ToString("ddd"),
                Orders = orders.Count(o => o.CreatedAt.Date == day),
                Sales = orders.Where(o => o.CreatedAt.Date == day).Sum(o => o.Total)
            })
            .ToList();
    }

    private async Task<List<InventoryValuationRow>> BuildInventoryValuation(Guid businessId)
    {
        return await _context.Products
            .Where(p => p.BusinessId == businessId)
            .OrderBy(p => p.Name)
            .Select(p => new InventoryValuationRow
            {
                ProductId = p.Id,
                Sku = p.Sku,
                ProductName = p.Name,
                Category = p.Category,
                Stock = p.Stock,
                Price = p.Price,
                Value = p.Stock * p.Price
            })
            .ToListAsync();
    }

    private async Task<decimal> GetRevenue(Guid businessId, DateTime? from, DateTime? to)
    {
        var end = to?.Date.AddDays(1) ?? DateTime.UtcNow.Date.AddDays(1);
        var start = from?.Date ?? end.AddDays(-30);

        return await _context.SalesOrders
            .Where(o =>
                o.BusinessId == businessId &&
                o.Status == "paid" &&
                o.CreatedAt >= start &&
                o.CreatedAt < end)
            .SumAsync(o => o.Total);
    }

    private async Task<GstReportResponse> BuildGst(Guid businessId)
    {
        var revenue = await GetRevenue(businessId, null, null);
        var totalGst = Math.Round(revenue * 0.18m, 2);
        return new GstReportResponse
        {
            TaxableSales = revenue,
            GstRate = 18,
            Cgst = Math.Round(totalGst / 2m, 2),
            Sgst = Math.Round(totalGst / 2m, 2),
            Igst = 0,
            TotalGst = totalGst
        };
    }

    private async Task<ProfitLossResponse> BuildProfitLoss(Guid businessId)
    {
        var revenue = await GetRevenue(businessId, null, null);
        var expense = Math.Round(revenue * 0.62m, 2);
        return new ProfitLossResponse
        {
            Revenue = revenue,
            EstimatedExpense = expense,
            GrossProfit = revenue - expense,
            NetProfit = revenue - expense,
            Trend = await BuildSalesSummary(businessId, null, null)
        };
    }

    private static string ToSalesCsv(List<SalesSummaryRow> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Date,Orders,Sales");
        foreach (var row in rows)
            sb.AppendLine($"{row.Date:yyyy-MM-dd},{row.Orders},{row.Sales}");
        return sb.ToString();
    }

    private static string ToInventoryCsv(List<InventoryValuationRow> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("SKU,Product,Category,Stock,Price,Value");
        foreach (var row in rows)
            sb.AppendLine($"{Escape(row.Sku)},{Escape(row.ProductName)},{Escape(row.Category)},{row.Stock},{row.Price},{row.Value}");
        return sb.ToString();
    }

    private static string ToGstCsv(GstReportResponse gst)
    {
        return "TaxableSales,GstRate,Cgst,Sgst,Igst,TotalGst\r\n" +
               $"{gst.TaxableSales},{gst.GstRate},{gst.Cgst},{gst.Sgst},{gst.Igst},{gst.TotalGst}\r\n";
    }

    private static string ToProfitLossCsv(ProfitLossResponse report)
    {
        return "Revenue,EstimatedExpense,GrossProfit,NetProfit\r\n" +
               $"{report.Revenue},{report.EstimatedExpense},{report.GrossProfit},{report.NetProfit}\r\n";
    }

    private static string Escape(string value)
    {
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }
}