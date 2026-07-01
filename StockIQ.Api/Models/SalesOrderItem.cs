namespace StockIQ.Api.Models;

public class SalesOrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}