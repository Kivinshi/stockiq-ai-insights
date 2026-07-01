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
[Route("api/users")]
public class UsersController : ControllerBase
{
	private readonly AppDbContext _context;

	public UsersController(AppDbContext context)
	{
		_context = context;
	}

	[HttpGet]
	public async Task<IActionResult> GetUsers()
	{
		var currentUser = await GetCurrentUser();
		if (currentUser?.BusinessId == null) return Ok(Array.Empty<object>());

		if (currentUser.Role != "admin")
			return Forbid();

		var users = await _context.Users
			.Include(u => u.Branch)
			.Where(u => u.BusinessId == currentUser.BusinessId)
			.Select(u => new
			{
				u.Id,
				u.Name,
				u.Email,
				u.Phone,
				u.Role,
				u.Status,
				Branch = u.Branch != null ? u.Branch.Name : "",
				u.CreatedAt
			})
			.ToListAsync();

		return Ok(users);
	}

	[HttpPost("invite")]
	public async Task<IActionResult> InviteUser([FromBody] InviteUserRequest request)
	{
		var currentUser = await GetCurrentUser();
		if (currentUser?.BusinessId == null) return BadRequest("Business not found.");

		if (currentUser.Role != "admin")
			return Forbid();

		var email = request.Email.Trim().ToLower();

		var exists = await _context.Users.AnyAsync(u => u.Email == email);
		if (exists) return BadRequest("Email already registered.");

		var temporaryPassword = $"StockIQ@{Random.Shared.Next(100000, 999999)}";

		var user = new User
		{
			Name = request.Name.Trim(),
			Email = email,
			Phone = request.Phone,
			PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
			BusinessId = currentUser.BusinessId,
			BranchId = request.BranchId,
			BusinessName = currentUser.BusinessName,
			BusinessType = currentUser.BusinessType,
			Role = request.Role,
			Status = "pending"
		};

		_context.Users.Add(user);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "User invited successfully.",
			userId = user.Id,
			temporaryPassword
		});
	}

	[HttpPut("{id}/role")]
	public async Task<IActionResult> UpdateRole(Guid id, UpdateUserRoleRequest request)
	{
		var currentUser = await GetCurrentUser();
		if (currentUser?.Role != "admin") return Forbid();

		var user = await _context.Users.FirstOrDefaultAsync(u =>
			u.Id == id && u.BusinessId == currentUser.BusinessId);

		if (user == null) return NotFound("User not found.");

		user.Role = request.Role;
		await _context.SaveChangesAsync();

		return Ok(new { message = "User role updated successfully." });
	}

	[HttpPut("{id}/status")]
	public async Task<IActionResult> UpdateStatus(Guid id, UpdateUserStatusRequest request)
	{
		var currentUser = await GetCurrentUser();
		if (currentUser?.Role != "admin") return Forbid();

		var user = await _context.Users.FirstOrDefaultAsync(u =>
			u.Id == id && u.BusinessId == currentUser.BusinessId);

		if (user == null) return NotFound("User not found.");

		user.Status = request.Status;
		await _context.SaveChangesAsync();

		return Ok(new { message = "User status updated successfully." });
	}

	private async Task<User?> GetCurrentUser()
	{
		var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		return Guid.TryParse(userId, out var id)
			? await _context.Users.FirstOrDefaultAsync(u => u.Id == id)
			: null;
	}
}