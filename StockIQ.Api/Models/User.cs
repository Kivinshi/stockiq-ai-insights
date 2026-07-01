


//namespace StockIQ.Api.Models;

//public class User
//{
//    public Guid Id { get; set; } = Guid.NewGuid();

//    public string Name { get; set; } = string.Empty;

//    public string Email { get; set; } = string.Empty;

//    public string PasswordHash { get; set; } = string.Empty;

//    public string Phone { get; set; } = string.Empty;

//    public string BusinessName { get; set; } = string.Empty;

//    public string BusinessType { get; set; } = string.Empty;

//    public string Role { get; set; } = "manager";

//    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//}











using System.ComponentModel.DataAnnotations.Schema;

namespace StockIQ.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // ========================
    // BASIC INFO
    // ========================
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    // ========================
    // BUSINESS INFO (legacy – keep it)
    // ========================
    public string BusinessName { get; set; } = string.Empty;

    public string BusinessType { get; set; } = string.Empty;

    // ========================
    // ROLE & STATUS
    // ========================
    public string Role { get; set; } = "manager";   // admin / manager / staff / viewer

    public string Status { get; set; } = "active";  // active / inactive / invited

    // ========================
    // RELATIONS (NEW)
    // ========================
    public Guid? BusinessId { get; set; }

    public Guid? BranchId { get; set; }

    public Business? Business { get; set; }

    public Branch? Branch { get; set; }

    // ========================
    // AUDIT
    // ========================
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}