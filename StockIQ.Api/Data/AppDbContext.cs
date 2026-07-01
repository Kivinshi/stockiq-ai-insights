


using Microsoft.EntityFrameworkCore;
using StockIQ.Api.Models;

namespace StockIQ.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public DbSet<Business> Businesses { get; set; }
    public DbSet<Branch> Branches { get; set; }

    public DbSet<Product> Products { get; set; }

    public DbSet<Supplier> Suppliers { get; set; }

    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<SalesOrder> SalesOrders { get; set; }
    public DbSet<SalesOrderItem> SalesOrderItems { get; set; }

    public DbSet<StaffTask> Tasks { get; set; }
    public DbSet<Notification> Notifications { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<PasswordResetToken>()
    .HasIndex(t => t.TokenHash)
    .IsUnique();

        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Business>()
    .Property(b => b.Name)
    .IsRequired();

        modelBuilder.Entity<Branch>()
            .HasOne(b => b.Business)
            .WithMany()
            .HasForeignKey(b => b.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Business)
            .WithMany()
            .HasForeignKey(u => u.BusinessId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Branch)
            .WithMany()
            .HasForeignKey(u => u.BranchId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Product>()
      .HasOne(p => p.Business)
      .WithMany()
      .HasForeignKey(p => p.BusinessId)
      .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasIndex(p => new { p.BusinessId, p.Sku })
            .IsUnique();

        modelBuilder.Entity<Product>()
            .Property(p => p.Sku)
            .IsRequired();

        modelBuilder.Entity<Product>()
            .Property(p => p.Name)
            .IsRequired();

        modelBuilder.Entity<Supplier>()
    .HasOne(s => s.Business)
    .WithMany()
    .HasForeignKey(s => s.BusinessId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Supplier>()
            .Property(s => s.Name)
            .IsRequired();


        modelBuilder.Entity<InventoryTransaction>()
    .HasOne(t => t.Business)
    .WithMany()
    .HasForeignKey(t => t.BusinessId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(t => t.Product)
            .WithMany()
            .HasForeignKey(t => t.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(t => t.Branch)
            .WithMany()
            .HasForeignKey(t => t.BranchId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Customer>()
    .HasOne(c => c.Business)
    .WithMany()
    .HasForeignKey(c => c.BusinessId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .Property(c => c.Name)
            .IsRequired();

        modelBuilder.Entity<SalesOrder>()
            .HasOne(o => o.Business)
            .WithMany()
            .HasForeignKey(o => o.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalesOrder>()
            .HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesOrder>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesOrder>()
            .HasIndex(o => new { o.BusinessId, o.OrderNumber })
            .IsUnique();

        modelBuilder.Entity<SalesOrderItem>()
            .HasOne(i => i.SalesOrder)
            .WithMany(o => o.Items)
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalesOrderItem>()
            .HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StaffTask>()
    .ToTable("Tasks");

        modelBuilder.Entity<StaffTask>()
            .HasOne(t => t.Business)
            .WithMany()
            .HasForeignKey(t => t.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StaffTask>()
            .HasOne(t => t.AssignedToUser)
            .WithMany()
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<StaffTask>()
            .Property(t => t.Title)
            .IsRequired();

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Business)
            .WithMany()
            .HasForeignKey(n => n.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Notification>()
            .Property(n => n.Title)
            .IsRequired();
    }
}