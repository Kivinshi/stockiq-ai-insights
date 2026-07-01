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
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<CustomerResponse>());

        var customers = await _context.Customers
            .Where(c => c.BusinessId == user.BusinessId.Value)
            .OrderBy(c => c.Name)
            .Select(c => ToResponse(c))
            .ToListAsync();

        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer(CreateCustomerRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Customer name is required.");

        var customer = new Customer
        {
            BusinessId = user.BusinessId.Value,
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLower(),
            Phone = request.Phone.Trim(),
            Address = request.Address.Trim()
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(customer));
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }

    private static CustomerResponse ToResponse(Customer customer)
    {
        return new CustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address
        };
    }
}