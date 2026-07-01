namespace StockIQ.Api.DTOs;

public class ReportKpisResponse
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetProfit { get; set; }
    public decimal GstCollected { get; set; }
    public decimal InventoryValue { get; set; }
}

public class SalesSummaryRow
{
    public DateTime Date { get; set; }
    public string Label { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Sales { get; set; }
}

public class InventoryValuationRow
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public decimal Value { get; set; }
}

public class GstReportResponse
{
    public decimal TaxableSales { get; set; }
    public decimal GstRate { get; set; }
    public decimal Cgst { get; set; }
    public decimal Sgst { get; set; }
    public decimal Igst { get; set; }
    public decimal TotalGst { get; set; }
}

public class ProfitLossResponse
{
    public decimal Revenue { get; set; }
    public decimal EstimatedExpense { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal NetProfit { get; set; }
    public List<SalesSummaryRow> Trend { get; set; } = new();
}