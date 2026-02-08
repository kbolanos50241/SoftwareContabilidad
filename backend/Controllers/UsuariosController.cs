using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;
using SoftwareContabilidad.Api.Models;
using SoftwareContabilidad.Api.Models.DTOs;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsuariosController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene todos los usuarios. No incluye contraseña.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponse>>> GetAll()
    {
        var usuarios = await _context.Usuarios
            .OrderBy(u => u.NombreUsuario)
            .Select(u => new UsuarioResponse
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                NombreUsuario = u.NombreUsuario,
                Rol = u.Rol,
                Estado = u.Estado
            })
            .ToListAsync();

        return usuarios;
    }

    /// <summary>
    /// Obtiene un usuario por ID. No incluye contraseña.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioResponse>> GetById(int id)
    {
        var usuario = await _context.Usuarios
            .Where(u => u.Id == id)
            .Select(u => new UsuarioResponse
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                NombreUsuario = u.NombreUsuario,
                Rol = u.Rol,
                Estado = u.Estado
            })
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound();

        return usuario;
    }

    /// <summary>
    /// Crea un nuevo usuario.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UsuarioResponse>> Create(UsuarioCreateRequest request)
    {
        if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == request.NombreUsuario))
            return BadRequest(new { mensaje = $"Ya existe un usuario con el nombre '{request.NombreUsuario}'." });

        var usuario = new Usuario
        {
            NombreCompleto = request.NombreCompleto,
            NombreUsuario = request.NombreUsuario,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Rol = request.Rol,
            Estado = EstadoUsuario.Activo
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            NombreCompleto = usuario.NombreCompleto,
            NombreUsuario = usuario.NombreUsuario,
            Rol = usuario.Rol,
            Estado = usuario.Estado
        };

        return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, response);
    }

    /// <summary>
    /// Actualiza un usuario existente.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UsuarioUpdateRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();

        if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == request.NombreUsuario && u.Id != id))
            return BadRequest(new { mensaje = $"Ya existe otro usuario con el nombre '{request.NombreUsuario}'." });

        usuario.NombreCompleto = request.NombreCompleto;
        usuario.NombreUsuario = request.NombreUsuario;
        usuario.Rol = request.Rol;
        usuario.Estado = request.Estado;

        if (!string.IsNullOrWhiteSpace(request.Password))
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Elimina un usuario.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Activa un usuario.
    /// </summary>
    [HttpPatch("{id:int}/activar")]
    public async Task<IActionResult> Activar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();

        usuario.Estado = EstadoUsuario.Activo;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Desactiva un usuario.
    /// </summary>
    [HttpPatch("{id:int}/desactivar")]
    public async Task<IActionResult> Desactivar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();

        usuario.Estado = EstadoUsuario.Inactivo;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
