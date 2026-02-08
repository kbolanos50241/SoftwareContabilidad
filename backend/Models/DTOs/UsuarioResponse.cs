using SoftwareContabilidad.Api.Models;

namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para respuestas de usuario. No incluye contraseña.
/// </summary>
public class UsuarioResponse
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public EstadoUsuario Estado { get; set; }
}
