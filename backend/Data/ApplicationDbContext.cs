using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Models;

namespace SoftwareContabilidad.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<CuentaContable> CuentasContables => Set<CuentaContable>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CuentaContable>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Codigo).IsUnique();
            entity.Property(e => e.Codigo).HasMaxLength(20);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
        });
    }
}
