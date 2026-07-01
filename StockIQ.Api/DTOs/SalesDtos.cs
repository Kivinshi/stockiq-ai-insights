namespace StockIQ.Api.DTOs;

public class CustomerResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class SalesOrderItemResponse
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class SalesOrderResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime Date { get; set; }
    public List<SalesOrderItemResponse> Items { get; set; } = new();
}

public class CreateSalesOrderItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateSalesOrderRequest
{
    public Guid? CustomerId { get; set; }
    public CreateCustomerRequest? Customer { get; set; }
    public string Status { get; set; } = "paid";
    public List<CreateSalesOrderItemRequest> Items { get; set; } = new();
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = "paid";
}

public class SalesTrendResponse
{
    public DateTime Date { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Sales { get; set; }
}