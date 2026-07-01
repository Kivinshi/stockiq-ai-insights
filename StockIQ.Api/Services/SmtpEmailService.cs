using System.Net;
using System.Net.Mail;

namespace StockIQ.Api.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var host = _config["Email:SmtpHost"]!;
        var port = int.Parse(_config["Email:SmtpPort"]!);
        var username = _config["Email:Username"]!;
        var password = _config["Email:Password"]!;
        var from = _config["Email:From"]!;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        using var message = new MailMessage
        {
            From = new MailAddress(from, "StockIQ"),
            Subject = "Reset your StockIQ password",
            Body = $"""
            Hello,

            Click the link below to reset your password:

            {resetLink}

            This link will expire in 30 minutes.

            If you did not request this, you can ignore this email.
            """,
            IsBodyHtml = false
        };

        message.To.Add(toEmail);

        await client.SendMailAsync(message);
    }
}