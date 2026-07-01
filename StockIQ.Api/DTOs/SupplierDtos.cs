namespace StockIQ.Api.DTOs;

public class SupplierResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public int Score { get; set; }
    public decimal AverageDelayDays { get; set; }
    public int Products { get; set; }
}

public class CreateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public int Score { get; set; } = 80;
    public decimal AverageDelayDays { get; set; }
}

public class UpdateSupplierRequest : CreateSupplierRequest
{
}