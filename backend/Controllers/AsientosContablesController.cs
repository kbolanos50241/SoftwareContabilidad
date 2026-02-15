using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;
using SoftwareContabilidad.Api.Models;
using SoftwareContabilidad.Api.Models.DTOs;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsientosContablesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AsientosContablesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene todos los asientos contables con sus movimientos.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AsientoResponse>>> GetAll()
    {
        var asientos = await _context.AsientosContables
            .Include(a => a.Movimientos)
            .ThenInclude(m => m.CuentaContable)
            .OrderByDescending(a => a.Fecha)
            .ThenByDescending(a => a.Id)
            .ToListAsync();

        return asientos.Select(MapToResponse).ToList();
    }

    /// <summary>
    /// Obtiene un asiento por ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AsientoResponse>> GetById(int id)
    {
        var asiento = await _context.AsientosContables
            .Include(a => a.Movimientos)
            .ThenInclude(m => m.CuentaContable)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asiento == null)
            return NotFound();

        return MapToResponse(asiento);
    }

    /// <summary>
    /// Registra un nuevo asiento contable.
    /// Validaciones: mínimo 2 movimientos, debe = haber, cuentas existentes y activas.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AsientoResponse>> Create(AsientoCreateRequest request)
    {
        if (request.Movimientos == null || request.Movimientos.Count < 2)
            return BadRequest(new { mensaje = "El asiento debe tener al menos 2 movimientos." });

        var totalDebe = request.Movimientos.Sum(m => m.Debe);
        var totalHaber = request.Movimientos.Sum(m => m.Haber);

        if (totalDebe != totalHaber)
            return BadRequest(new { mensaje = "El asiento no está balanceado. La suma del debe debe ser igual a la suma del haber." });

        var cuentaIds = request.Movimientos.Select(m => m.CuentaContableId).Distinct().ToList();
        var cuentas = await _context.CuentasContables
            .Where(c => cuentaIds.Contains(c.Id))
            .ToListAsync();

        if (cuentas.Count != cuentaIds.Count)
            return BadRequest(new { mensaje = "Una o más cuentas no existen." });

        var cuentaInactiva = cuentas.FirstOrDefault(c => !c.Activa);
        if (cuentaInactiva != null)
            return BadRequest(new { mensaje = $"La cuenta '{cuentaInactiva.Codigo} - {cuentaInactiva.Nombre}' no está activa." });

        var asiento = new AsientoContable
        {
            Fecha = DateTime.SpecifyKind(request.Fecha.Date, DateTimeKind.Utc),
            Descripcion = request.Descripcion.Trim()
        };

        foreach (var m in request.Movimientos)
        {
            asiento.Movimientos.Add(new MovimientoContable
            {
                CuentaContableId = m.CuentaContableId,
                Debe = m.Debe,
                Haber = m.Haber
            });
        }

        _context.AsientosContables.Add(asiento);
        await _context.SaveChangesAsync();

        await _context.Entry(asiento)
            .Collection(a => a.Movimientos)
            .Query()
            .Include(m => m.CuentaContable)
            .LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = asiento.Id }, MapToResponse(asiento));
    }

    /// <summary>
    /// Elimina un asiento contable (y sus movimientos).
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var asiento = await _context.AsientosContables.FindAsync(id);
        if (asiento == null)
            return NotFound();

        _context.AsientosContables.Remove(asiento);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static AsientoResponse MapToResponse(AsientoContable asiento)
    {
        var movimientos = asiento.Movimientos.Select(m => new MovimientoResponse
        {
            Id = m.Id,
            CuentaContableId = m.CuentaContableId,
            CuentaCodigo = m.CuentaContable?.Codigo ?? "",
            CuentaNombre = m.CuentaContable?.Nombre ?? "",
            Debe = m.Debe,
            Haber = m.Haber
        }).ToList();

        return new AsientoResponse
        {
            Id = asiento.Id,
            Fecha = asiento.Fecha,
            Descripcion = asiento.Descripcion,
            Movimientos = movimientos,
            TotalDebe = movimientos.Sum(m => m.Debe),
            TotalHaber = movimientos.Sum(m => m.Haber)
        };
    }
}
