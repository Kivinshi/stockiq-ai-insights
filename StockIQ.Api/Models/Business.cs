namespace StockIQ.Api.Models;

public class Business
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Retail";
    public string Gstin { get; set; } = string.Empty;
    public string Currency { get; set; } = "INR";
    public string Timezone { get; set; } = "Asia/Kolkata";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}