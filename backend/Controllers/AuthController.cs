using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;
using SoftwareContabilidad.Api.Models;
using SoftwareContabilidad.Api.Models.DTOs;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Valida usuario y contraseña. Solo permite acceso a usuarios activos.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<UsuarioResponse>> Login(LoginRequest request)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NombreUsuario == request.NombreUsuario);

        if (usuario == null)
            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });

        if (usuario.Estado == EstadoUsuario.Inactivo)
            return Unauthorized(new { mensaje = "Usuario desactivado. Contacte al administrador." });

        if (!BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });

        return new UsuarioResponse
        {
            Id = usuario.Id,
            NombreCompleto = usuario.NombreCompleto,
            NombreUsuario = usuario.NombreUsuario,
            Rol = usuario.Rol,
            Estado = usuario.Estado
        };
    }
}

public class LoginRequest
{
    public string NombreUsuario { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
