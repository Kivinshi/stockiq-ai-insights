namespace StockIQ.Api.DTOs;

public class InventorySummaryResponse
{
    public int TotalUnits { get; set; }
    public decimal InventoryValue { get; set; }
    public int LowOrOutCount { get; set; }
    public int Movements7d { get; set; }
}

public class LowStockResponse
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int MinStock { get; set; }
    public decimal Price { get; set; }
    public string Status { get; set; } = "low";
}

public class InventoryMovementResponse
{
    public DateTime Date { get; set; }
    public string Day { get; set; } = string.Empty;
    public int In { get; set; }
    public int Out { get; set; }
}

public class InventoryTransactionResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Note { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class StockMovementRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public string Note { get; set; } = string.Empty;
}