using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockIQ.Api.Data;
using StockIQ.Api.DTOs;

namespace StockIQ.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/business")]
public class BusinessController : ControllerBase
{
	private readonly AppDbContext _context;

	public BusinessController(AppDbContext context)
	{
		_context = context;
	}

	[HttpGet("me")]
	public async Task<IActionResult> GetMyBusiness()
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return NotFound("Business not found.");

		var business = await _context.Businesses.FindAsync(user.BusinessId.Value);
		if (business == null) return NotFound("Business not found.");

		return Ok(business);
	}

	[HttpPut("me")]
	public async Task<IActionResult> UpdateMyBusiness(UpdateBusinessRequest request)
	{
		var user = await GetCurrentUser();
		if (user?.BusinessId == null) return NotFound("Business not found.");

		if (user.Role != "admin" && user.Role != "manager")
			return Forbid();

		var business = await _context.Businesses.FindAsync(user.BusinessId.Value);
		if (business == null) return NotFound("Business not found.");

		business.Name = request.Name.Trim();
		business.Type = request.Type;
		business.Gstin = request.Gstin;
		business.Currency = request.Currency;
		business.Timezone = request.Timezone;

		await _context.SaveChangesAsync();

		return Ok(new { message = "Business updated successfully.", business });
	}

	private async Task<Models.User?> GetCurrentUser()
	{
		var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		return Guid.TryParse(userId, out var id)
			? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
			: null;
	}
}