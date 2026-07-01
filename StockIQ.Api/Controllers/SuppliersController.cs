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
[Route("api/suppliers")]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuppliersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<SupplierResponse>());

        var suppliers = await _context.Suppliers
            .Where(s => s.BusinessId == user.BusinessId.Value)
            .OrderBy(s => s.Name)
            .Select(s => ToResponse(s))
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupplier(CreateSupplierRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role == "viewer")
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Supplier name is required.");

        var supplier = new Supplier
        {
            BusinessId = user.BusinessId.Value,
            Name = request.Name.Trim(),
            ContactPerson = request.ContactPerson.Trim(),
            Email = request.Email.Trim().ToLower(),
            Phone = request.Phone.Trim(),
            Address = request.Address.Trim(),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status,
            Score = Math.Clamp(request.Score, 0, 100),
            AverageDelayDays = request.AverageDelayDays
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(supplier));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSupplier(Guid id, UpdateSupplierRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Supplier not found.");

        if (user.Role == "viewer")
            return Forbid();

        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id && s.BusinessId == user.BusinessId.Value);

        if (supplier == null) return NotFound("Supplier not found.");

        supplier.Name = request.Name.Trim();
        supplier.ContactPerson = request.ContactPerson.Trim();
        supplier.Email = request.Email.Trim().ToLower();
        supplier.Phone = request.Phone.Trim();
        supplier.Address = request.Address.Trim();
        supplier.Status = request.Status;
        supplier.Score = Math.Clamp(request.Score, 0, 100);
        supplier.AverageDelayDays = request.AverageDelayDays;

        await _context.SaveChangesAsync();

        return Ok(ToResponse(supplier));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return NotFound("Supplier not found.");

        if (user.Role == "viewer")
            return Forbid();

        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id && s.BusinessId == user.BusinessId.Value);

        if (supplier == null) return NotFound("Supplier not found.");

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Supplier deleted successfully." });
    }

    [HttpGet("performance")]
    public async Task<IActionResult> GetPerformance()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<object>());

        var performance = await _context.Suppliers
            .Where(s => s.BusinessId == user.BusinessId.Value)
            .OrderByDescending(s => s.Score)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Score,
                s.AverageDelayDays,
                s.Status
            })
            .ToListAsync();

        return Ok(performance);
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static SupplierResponse ToResponse(Supplier supplier)
    {
        return new SupplierResponse
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactPerson = supplier.ContactPerson,
            Email = supplier.Email,
            Phone = supplier.Phone,
            Address = supplier.Address,
            Status = supplier.Status,
            Score = supplier.Score,
            AverageDelayDays = supplier.AverageDelayDays,
            Products = 0
        };
    }
}