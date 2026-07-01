namespace StockIQ.Api.DTOs;

public class DashboardKpis
{
    public int TotalProducts { get; set; }
    public int ActiveUsers { get; set; }
    public int Branches { get; set; }
    public decimal TodaySales { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal InventoryValue { get; set; }
    public int LowStock { get; set; }
    public int PendingOrders { get; set; }
    public int OrdersToday { get; set; }
    public int StockInToday { get; set; }
    public int StockOutToday { get; set; }
}

public class ChartPoint
{
    public string Label { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Forecast { get; set; }
    public decimal Expense { get; set; }
    public decimal Profit { get; set; }
}

public class CategorySharePoint
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class LowStockDashboardItem
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int MinStock { get; set; }
    public string Status { get; set; } = "low";
    public int SuggestedReorder { get; set; }
}

public class SupplierScoreItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
}

public class DashboardOrderItem
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class DashboardInsight
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Level { get; set; } = "info";
}

public class DashboardResponse
{
    public DashboardKpis Kpis { get; set; } = new();
    public List<ChartPoint> SalesTrend { get; set; } = new();
    public List<CategorySharePoint> CategoryShare { get; set; } = new();
    public List<LowStockDashboardItem> LowStockItems { get; set; } = new();
    public List<SupplierScoreItem> SupplierScores { get; set; } = new();
    public List<DashboardOrderItem> RecentOrders { get; set; } = new();
    public List<DashboardInsight> Insights { get; set; } = new();
}