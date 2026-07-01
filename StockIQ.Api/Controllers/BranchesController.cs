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
[Route("api/branches")]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BranchesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBranches()
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return Ok(Array.Empty<Branch>());

        var branches = await _context.Branches
            .Where(b => b.BusinessId == user.BusinessId && b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return Ok(branches);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBranch(CreateBranchRequest request)
    {
        var user = await GetCurrentUser();
        if (user?.BusinessId == null) return BadRequest("Business not found.");

        if (user.Role != "admin" && user.Role != "manager")
            return Forbid();

        var branch = new Branch
        {
            BusinessId = user.BusinessId.Value,
            Name = request.Name.Trim(),
            City = request.City,
            Address = request.Address
        };

        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return Ok(branch);
    }

    private async Task<User?> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id)
            ? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;
    }
}