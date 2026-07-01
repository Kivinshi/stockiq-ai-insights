namespace StockIQ.Api.DTOs;

public class UpdateBusinessRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Retail";
    public string Gstin { get; set; } = string.Empty;
    public string Currency { get; set; } = "INR";
    public string Timezone { get; set; } = "Asia/Kolkata";
}