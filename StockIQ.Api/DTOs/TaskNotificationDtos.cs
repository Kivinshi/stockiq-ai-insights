namespace StockIQ.Api.DTOs;

public class StaffTaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public string Due { get; set; } = string.Empty;
    public bool Done { get; set; }
}

public class CreateStaffTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? AssignedToUserId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class NotificationResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Tone { get; set; } = "primary";
    public string Type { get; set; } = "system";
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Time { get; set; } = string.Empty;
}

public class CreateNotificationRequest
{
    public Guid? UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Tone { get; set; } = "primary";
    public string Type { get; set; } = "system";
}