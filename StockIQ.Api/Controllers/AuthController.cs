using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StockIQ.Api.Data;
using StockIQ.Api.DTOs;
using StockIQ.Api.Models;
using StockIQ.Api.Services;

namespace StockIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthController(
        AppDbContext context,
        IConfiguration config,
        IEmailService emailService
    )
    {
        _context = context;
        _config = config;
        _emailService = emailService;
    }

    // ================= REGISTER =================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var exists = await _context.Users.AnyAsync(u => u.Email == email);
        if (exists)
            return BadRequest("This email is already registered.");

        // ======================
        // STEP 5: CREATE BUSINESS
        // ======================
        var business = new Business
        {
            Name = request.BusinessName,
            Type = request.BusinessType
        };

        _context.Businesses.Add(business);

        // ======================
        // CREATE DEFAULT BRANCH
        // ======================
        var branch = new Branch
        {
            BusinessId = business.Id,
            Name = "HQ",
            City = "",
            Address = ""
        };

        _context.Branches.Add(branch);

        // ======================
        // CREATE USER
        // ======================
        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,

            // legacy fields (keep)
            BusinessName = request.BusinessName,
            BusinessType = request.BusinessType,

            // NEW RELATIONS
            BusinessId = business.Id,
            BranchId = branch.Id,
            Status = "active",

            Role = request.Role
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Registration successful. Business & branch created."
        });
    }

    // ================= LOGIN =================
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return Unauthorized("Invalid email or password.");

        var validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!validPassword)
            return Unauthorized("Invalid email or password.");

        return Ok(CreateAuthResponse(user));
    }

    // ================= ME =================
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Name = User.FindFirst(ClaimTypes.Name)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            Role = User.FindFirst(ClaimTypes.Role)?.Value
        });
    }

    // ================= CHANGE PASSWORD =================
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest("Current password and new password are required.");

        if (request.NewPassword.Length < 8)
            return BadRequest("New password must be at least 8 characters.");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid token.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return NotFound("User not found.");

        var validPassword = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        if (!validPassword)
            return BadRequest("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    // ================= FORGOT PASSWORD =================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var safeResponse = new
        {
            message = "If this email exists, reset instructions have been sent."
        };

        if (string.IsNullOrWhiteSpace(request.Email))
            return Ok(safeResponse);

        var email = request.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return Ok(safeResponse);

        var token = GenerateResetToken();
        var tokenHash = HashToken(token);

        var existingTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var existingToken in existingTokens)
            existingToken.UsedAt = DateTime.UtcNow;

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        });

        await _context.SaveChangesAsync();

        var frontendUrl = _config["App:FrontendUrl"] ?? "http://localhost:8080";
        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);

        if (HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>()
            .IsDevelopment())
        {
            return Ok(new
            {
                safeResponse.message,
                resetToken = token
            });
        }

        return Ok(safeResponse);
    }

    // ================= RESET PASSWORD =================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest("Token and new password are required.");

        if (request.NewPassword.Length < 8)
            return BadRequest("New password must be at least 8 characters.");

        var tokenHash = HashToken(request.Token);

        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (resetToken == null ||
            resetToken.UsedAt != null ||
            resetToken.ExpiresAt <= DateTime.UtcNow)
            return BadRequest("Invalid or expired reset token.");

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetToken.UsedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully." });
    }

    // ================= TOKEN HELPERS =================
    private AuthResponse CreateAuthResponse(User user)
    {
        return new AuthResponse
        {
            Token = CreateToken(user),
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(_config["Jwt:ExpiresInMinutes"])
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateResetToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}