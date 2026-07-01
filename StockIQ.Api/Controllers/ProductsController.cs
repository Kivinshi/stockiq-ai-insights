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
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] string? category)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<ProductResponse>());

        var query = _context.Products
            .Where(p => p.BusinessId == user.BusinessId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                p.Sku.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(p => p.Category == category);
        }

        var products = await query
            .OrderBy(p => p.Name)
            .Select(p => ToResponse(p))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Product not found.");

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == user.BusinessId.Value);

        if (product == null) return NotFound("Product not found.");
        return Ok(ToResponse(product));
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role == "viewer")
            return Forbid();

        var sku = request.Sku.Trim();
        if (string.IsNullOrWhiteSpace(sku) || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("SKU and product name are required.");

        var exists = await _context.Products.AnyAsync(p =>
            p.BusinessId == user.BusinessId.Value &&
            p.Sku.ToLower() == sku.ToLower());

        if (exists) return BadRequest("SKU already exists.");

        var product = new Product
        {
            BusinessId = user.BusinessId.Value,
            Sku = sku,
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            Stock = request.Stock,
            MinStock = request.MinStock,
            Price = request.Price
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(product));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Product not found.");

        if (user.Role == "viewer")
            return Forbid();

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == user.BusinessId.Value);

        if (product == null) return NotFound("Product not found.");

        var sku = request.Sku.Trim();
        var duplicateSku = await _context.Products.AnyAsync(p =>
            p.Id != id &&
            p.BusinessId == user.BusinessId.Value &&
            p.Sku.ToLower() == sku.ToLower());

        if (duplicateSku) return BadRequest("SKU already exists.");

        product.Sku = sku;
        product.Name = request.Name.Trim();
        product.Category = request.Category.Trim();
        product.Stock = request.Stock;
        product.MinStock = request.MinStock;
        product.Price = request.Price;

        await _context.SaveChangesAsync();
        return Ok(ToResponse(product));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Product not found.");

        if (user.Role == "viewer")
            return Forbid();

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == user.BusinessId.Value);

        if (product == null) return NotFound("Product not found.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully." });
    }

    [HttpGet("/api/categories")]
    public async Task<IActionResult> GetCategories()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<string>());

        var categories = await _context.Products
            .Where(p => p.BusinessId == user.BusinessId.Value && p.Category != "")
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static ProductResponse ToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Sku = product.Sku,
            Name = product.Name,
            Category = product.Category,
            Stock = product.Stock,
            MinStock = product.MinStock,
            Price = product.Price,
            Status = product.Stock <= 0 ? "out" : product.Stock <= product.MinStock ? "low" : "in"
        };
    }
}