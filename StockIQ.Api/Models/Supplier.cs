namespace StockIQ.Api.Models;

public class Supplier
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BusinessId { get; set; }
    public Business? Business { get; set; }

    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public string Status { get; set; } = "active";
    public int Score { get; set; } = 80;
    public decimal AverageDelayDays { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}