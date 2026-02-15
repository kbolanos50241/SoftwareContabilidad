using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;
using SoftwareContabilidad.Api.Models;
using SoftwareContabilidad.Api.Models.DTOs;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Balance General (Estado de Situación Financiera).
    /// Solo cuentas de Activo, Pasivo y Patrimonio. Fecha opcional (default: hoy).
    /// </summary>
    [HttpGet("balancegeneral")]
    public async Task<ActionResult<BalanceGeneralResponse>> GetBalanceGeneral(
        [FromQuery] DateTime? fechaCorte)
    {
        var corte = fechaCorte.HasValue
            ? DateTime.SpecifyKind(fechaCorte.Value.Date, DateTimeKind.Utc)
            : DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        var corteFin = corte.AddDays(1);

        var movimientos = await _context.MovimientosContables
            .Include(m => m.AsientoContable)
            .Include(m => m.CuentaContable)
            .Where(m => m.AsientoContable.Fecha < corteFin)
            .ToListAsync();

        var saldosPorCuenta = movimientos
            .GroupBy(m => new { m.CuentaContableId, m.CuentaContable!.Codigo, m.CuentaContable.Nombre, m.CuentaContable.Tipo })
            .Select(g => new
            {
                g.Key.CuentaContableId,
                g.Key.Codigo,
                g.Key.Nombre,
                g.Key.Tipo,
                Debe = g.Sum(m => m.Debe),
                Haber = g.Sum(m => m.Haber)
            })
            .Where(x => x.Tipo == TipoCuenta.Activo || x.Tipo == TipoCuenta.Pasivo || x.Tipo == TipoCuenta.Patrimonio)
            .ToList();

        var activos = saldosPorCuenta
            .Where(x => x.Tipo == TipoCuenta.Activo)
            .Select(x => new BalanceGeneralLinea
            {
                CuentaId = x.CuentaContableId,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Saldo = x.Debe - x.Haber
            })
            .Where(x => x.Saldo != 0)
            .OrderBy(x => x.Codigo)
            .ToList();

        var pasivos = saldosPorCuenta
            .Where(x => x.Tipo == TipoCuenta.Pasivo)
            .Select(x => new BalanceGeneralLinea
            {
                CuentaId = x.CuentaContableId,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Saldo = x.Haber - x.Debe
            })
            .Where(x => x.Saldo != 0)
            .OrderBy(x => x.Codigo)
            .ToList();

        var patrimonio = saldosPorCuenta
            .Where(x => x.Tipo == TipoCuenta.Patrimonio)
            .Select(x => new BalanceGeneralLinea
            {
                CuentaId = x.CuentaContableId,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Saldo = x.Haber - x.Debe
            })
            .Where(x => x.Saldo != 0)
            .OrderBy(x => x.Codigo)
            .ToList();

        var totalActivos = activos.Sum(x => x.Saldo);
        var totalPasivos = pasivos.Sum(x => x.Saldo);
        var totalPatrimonio = patrimonio.Sum(x => x.Saldo);
        var equilibrado = Math.Abs(totalActivos - (totalPasivos + totalPatrimonio)) < 0.01m;

        return new BalanceGeneralResponse
        {
            FechaCorte = corte,
            Activos = activos,
            TotalActivos = totalActivos,
            Pasivos = pasivos,
            TotalPasivos = totalPasivos,
            Patrimonio = patrimonio,
            TotalPatrimonio = totalPatrimonio,
            Equilibrado = equilibrado
        };
    }
}
