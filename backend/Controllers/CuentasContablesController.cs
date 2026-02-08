using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;
using SoftwareContabilidad.Api.Models;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CuentasContablesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CuentasContablesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene todas las cuentas contables.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CuentaContable>>> GetAll()
    {
        return await _context.CuentasContables.OrderBy(c => c.Codigo).ToListAsync();
    }

    /// <summary>
    /// Obtiene una cuenta contable por su ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CuentaContable>> GetById(int id)
    {
        var cuenta = await _context.CuentasContables.FindAsync(id);
        if (cuenta == null)
            return NotFound();

        return cuenta;
    }

    /// <summary>
    /// Crea una nueva cuenta contable.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CuentaContable>> Create(CuentaContable cuenta)
    {
        if (await _context.CuentasContables.AnyAsync(c => c.Codigo == cuenta.Codigo))
            return BadRequest(new { mensaje = $"Ya existe una cuenta con el código '{cuenta.Codigo}'." });

        _context.CuentasContables.Add(cuenta);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cuenta.Id }, cuenta);
    }

    /// <summary>
    /// Actualiza una cuenta contable existente.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CuentaContable cuenta)
    {
        if (id != cuenta.Id)
            return BadRequest();

        var existente = await _context.CuentasContables.FindAsync(id);
        if (existente == null)
            return NotFound();

        var codigoDuplicado = await _context.CuentasContables
            .AnyAsync(c => c.Codigo == cuenta.Codigo && c.Id != id);
        if (codigoDuplicado)
            return BadRequest(new { mensaje = $"Ya existe otra cuenta con el código '{cuenta.Codigo}'." });

        existente.Codigo = cuenta.Codigo;
        existente.Nombre = cuenta.Nombre;
        existente.Tipo = cuenta.Tipo;
        existente.Descripcion = cuenta.Descripcion;
        existente.Activa = cuenta.Activa;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Elimina una cuenta contable.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cuenta = await _context.CuentasContables.FindAsync(id);
        if (cuenta == null)
            return NotFound();

        _context.CuentasContables.Remove(cuenta);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
