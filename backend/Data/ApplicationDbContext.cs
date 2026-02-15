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
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<AsientoContable> AsientosContables => Set<AsientoContable>();
    public DbSet<MovimientoContable> MovimientosContables => Set<MovimientoContable>();

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

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.NombreUsuario).IsUnique();
            entity.Property(e => e.NombreCompleto).HasMaxLength(200);
            entity.Property(e => e.NombreUsuario).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).HasMaxLength(256);
        });

        modelBuilder.Entity<AsientoContable>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
        });

        modelBuilder.Entity<MovimientoContable>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.AsientoContable)
                .WithMany(a => a.Movimientos)
                .HasForeignKey(e => e.AsientoContableId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.CuentaContable)
                .WithMany()
                .HasForeignKey(e => e.CuentaContableId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.Debe).HasPrecision(18, 2);
            entity.Property(e => e.Haber).HasPrecision(18, 2);
        });
    }
}
