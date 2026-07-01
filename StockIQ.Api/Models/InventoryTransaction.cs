namespace StockIQ.Api.Models;

public class InventoryTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BusinessId { get; set; }
    public Business? Business { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Type { get; set; } = "in"; // in / out
    public int Quantity { get; set; }
    public string Note { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}