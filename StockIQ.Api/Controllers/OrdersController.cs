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
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<SalesOrderResponse>());

        var orders = await _context.SalesOrders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .Where(o => o.BusinessId == user.BusinessId.Value)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => ToResponse(o))
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Order not found.");

        var order = await _context.SalesOrders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.BusinessId == user.BusinessId.Value);

        if (order == null) return NotFound("Order not found.");

        return Ok(ToResponse(order));
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateSalesOrderRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role == "viewer")
            return Forbid();

        if (request.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");

        await using var transaction = await _context.Database.BeginTransactionAsync();

        Customer? customer = null;

        if (request.CustomerId.HasValue)
        {
            customer = await _context.Customers.FirstOrDefaultAsync(c =>
                c.Id == request.CustomerId.Value &&
                c.BusinessId == user.BusinessId.Value);
        }
        else if (request.Customer != null)
        {
            if (string.IsNullOrWhiteSpace(request.Customer.Name))
                return BadRequest("Customer name is required.");

            customer = new Customer
            {
                BusinessId = user.BusinessId.Value,
                Name = request.Customer.Name.Trim(),
                Email = request.Customer.Email.Trim().ToLower(),
                Phone = request.Customer.Phone.Trim(),
                Address = request.Customer.Address.Trim()
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        if (customer == null)
            return BadRequest("Customer is required.");

        var order = new SalesOrder
        {
            BusinessId = user.BusinessId.Value,
            CustomerId = customer.Id,
            UserId = user.Id,
            OrderNumber = await GenerateOrderNumber(user.BusinessId.Value),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "paid" : request.Status
        };

        foreach (var itemRequest in request.Items)
        {
            if (itemRequest.Quantity <= 0)
                return BadRequest("Item quantity must be greater than zero.");

            var product = await _context.Products.FirstOrDefaultAsync(p =>
                p.Id == itemRequest.ProductId &&
                p.BusinessId == user.BusinessId.Value);

            if (product == null)
                return BadRequest("Product not found.");

            if (product.Stock < itemRequest.Quantity)
                return BadRequest($"Not enough stock for {product.Name}.");

            product.Stock -= itemRequest.Quantity;

            var lineTotal = product.Price * itemRequest.Quantity;

            order.Items.Add(new SalesOrderItem
            {
                ProductId = product.Id,
                Quantity = itemRequest.Quantity,
                UnitPrice = product.Price,
                LineTotal = lineTotal
            });

            _context.InventoryTransactions.Add(new InventoryTransaction
            {
                BusinessId = user.BusinessId.Value,
                ProductId = product.Id,
                BranchId = user.BranchId,
                UserId = user.Id,
                Type = "out",
                Quantity = itemRequest.Quantity,
                Note = $"Sales order {order.OrderNumber}"
            });

            order.Total += lineTotal;
        }

        _context.SalesOrders.Add(order);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var savedOrder = await _context.SalesOrders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstAsync(o => o.Id == order.Id);

        return Ok(ToResponse(savedOrder));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Order not found.");

        if (user.Role == "viewer")
            return Forbid();

        var order = await _context.SalesOrders
            .FirstOrDefaultAsync(o => o.Id == id && o.BusinessId == user.BusinessId.Value);

        if (order == null) return NotFound("Order not found.");

        order.Status = request.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Order status updated successfully." });
    }

    private async Task<string> GenerateOrderNumber(Guid businessId)
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var count = await _context.SalesOrders
            .CountAsync(o => o.BusinessId == businessId && o.CreatedAt.Date == DateTime.UtcNow.Date);

        return $"SO-{today}-{count + 1:000}";
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static SalesOrderResponse ToResponse(SalesOrder order)
    {
        return new SalesOrderResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            Customer = order.Customer?.Name ?? "",
            Total = order.Total,
            Status = order.Status,
            Date = order.CreatedAt,
            Items = order.Items.Select(i => new SalesOrderItemResponse
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}