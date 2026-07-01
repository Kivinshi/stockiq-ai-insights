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
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
	private readonly AppDbContext _context;

	public InventoryController(AppDbContext context)
	{
		_context = context;
	}

	[HttpGet("summary")]
	public async Task<IActionResult> GetSummary()
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return Ok(new InventorySummaryResponse());

		var products = await _context.Products
			.Where(p => p.BusinessId == user.BusinessId.Value)
			.ToListAsync();

		var since = DateTime.UtcNow.AddDays(-7);
		var movements7d = await _context.InventoryTransactions
			.Where(t => t.BusinessId == user.BusinessId.Value && t.CreatedAt >= since)
			.SumAsync(t => t.Quantity);

		return Ok(new InventorySummaryResponse
		{
			TotalUnits = products.Sum(p => p.Stock),
			InventoryValue = products.Sum(p => p.Stock * p.Price),
			LowOrOutCount = products.Count(p => p.Stock <= p.MinStock),
			Movements7d = movements7d
		});
	}

	[HttpGet("low-stock")]
	public async Task<IActionResult> GetLowStock()
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return Ok(Array.Empty<LowStockResponse>());

		var products = await _context.Products
			.Where(p => p.BusinessId == user.BusinessId.Value && p.Stock <= p.MinStock)
			.OrderBy(p => p.Stock)
			.Select(p => new LowStockResponse
			{
				Id = p.Id,
				Sku = p.Sku,
				Name = p.Name,
				Stock = p.Stock,
				MinStock = p.MinStock,
				Price = p.Price,
				Status = p.Stock <= 0 ? "out" : "low"
			})
			.ToListAsync();

		return Ok(products);
	}

	[HttpGet("movements")]
	public async Task<IActionResult> GetMovements([FromQuery] DateTime? from, [FromQuery] DateTime? to)
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return Ok(Array.Empty<InventoryMovementResponse>());

		var end = to?.Date.AddDays(1) ?? DateTime.UtcNow.Date.AddDays(1);
		var start = from?.Date ?? end.AddDays(-7);

		var transactions = await _context.InventoryTransactions
			.Where(t =>
				t.BusinessId == user.BusinessId.Value &&
				t.CreatedAt >= start &&
				t.CreatedAt < end)
			.ToListAsync();

		var days = Enumerable.Range(0, Math.Max(1, (end.Date - start.Date).Days))
			.Select(offset => start.Date.AddDays(offset))
			.Select(day => new InventoryMovementResponse
			{
				Date = day,
				Day = day.ToString("ddd"),
				In = transactions
					.Where(t => t.CreatedAt.Date == day && t.Type == "in")
					.Sum(t => t.Quantity),
				Out = transactions
					.Where(t => t.CreatedAt.Date == day && t.Type == "out")
					.Sum(t => t.Quantity)
			})
			.ToList();

		return Ok(days);
	}

	[HttpPost("stock-in")]
	public async Task<IActionResult> StockIn(StockMovementRequest request)
	{
		return await MoveStock(request, "in");
	}

	[HttpPost("stock-out")]
	public async Task<IActionResult> StockOut(StockMovementRequest request)
	{
		return await MoveStock(request, "out");
	}

	[HttpGet("product/{productId:guid}")]
	public async Task<IActionResult> GetProductTransactions(Guid productId)
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return Ok(Array.Empty<InventoryTransactionResponse>());

		var transactions = await _context.InventoryTransactions
			.Include(t => t.Product)
			.Where(t => t.BusinessId == user.BusinessId.Value && t.ProductId == productId)
			.OrderByDescending(t => t.CreatedAt)
			.Select(t => new InventoryTransactionResponse
			{
				Id = t.Id,
				ProductId = t.ProductId,
				ProductName = t.Product != null ? t.Product.Name : "",
				Type = t.Type,
				Quantity = t.Quantity,
				Note = t.Note,
				CreatedAt = t.CreatedAt
			})
			.ToListAsync();

		return Ok(transactions);
	}

	private async Task<IActionResult> MoveStock(StockMovementRequest request, string type)
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return BadRequest("Business not found.");

		if (user.Role == "viewer")
			return Forbid();

		if (request.Quantity <= 0)
			return BadRequest("Quantity must be greater than zero.");

		var product = await _context.Products
			.FirstOrDefaultAsync(p => p.Id == request.ProductId && p.BusinessId == user.BusinessId.Value);

		if (product == null) return NotFound("Product not found.");

		if (type == "out" && product.Stock < request.Quantity)
			return BadRequest("Not enough stock available.");

		product.Stock = type == "in"
			? product.Stock + request.Quantity
			: product.Stock - request.Quantity;

		var transaction = new InventoryTransaction
		{
			BusinessId = user.BusinessId.Value,
			ProductId = product.Id,
			BranchId = user.BranchId,
			UserId = user.Id,
			Type = type,
			Quantity = request.Quantity,
			Note = request.Note.Trim()
		};

		_context.InventoryTransactions.Add(transaction);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = type == "in" ? "Stock added successfully." : "Stock removed successfully.",
			productId = product.Id,
			stock = product.Stock
		});
	}

	private async Task<User?> GetCurrentUser()
	{
		var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		return Guid.TryParse(userId, out var id)
			? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
			: null;
	}
}