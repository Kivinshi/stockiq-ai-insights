namespace StockIQ.Api.DTOs;

public class InviteUserRequest
{
	public string Name { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public string Phone { get; set; } = string.Empty;
	public string Role { get; set; } = "staff";
	public Guid? BranchId { get; set; }
}

public class UpdateUserRoleRequest
{
	public string Role { get; set; } = "staff";
}

public class UpdateUserStatusRequest
{
	public string Status { get; set; } = "active";
}