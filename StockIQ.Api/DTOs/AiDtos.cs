namespace StockIQ.Api.DTOs;

public class AiInsightResponse
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Level { get; set; } = "primary"; // primary / success / warning / danger
    public string Category { get; set; } = "general";
}

public class ReorderSuggestionResponse
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinStock { get; set; }
    public int SuggestedQuantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Priority { get; set; } = "medium"; // low / medium / high
}

public class DemandForecastResponse
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Last7DaysSold { get; set; }
    public int ForecastNext7Days { get; set; }
    public string Trend { get; set; } = "stable"; // rising / stable / falling
}