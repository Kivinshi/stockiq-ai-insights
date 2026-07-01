namespace StockIQ.Api.Models;

public class SalesOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BusinessId { get; set; }
    public Business? Business { get; set; }

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending / paid / cancelled
    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<SalesOrderItem> Items { get; set; } = new();
}