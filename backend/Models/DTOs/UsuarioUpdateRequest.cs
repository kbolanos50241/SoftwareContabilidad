using System.ComponentModel.DataAnnotations;
using SoftwareContabilidad.Api.Models;

namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para actualizar un usuario. Password opcional.
/// </summary>
public class UsuarioUpdateRequest
{
    [Required, MaxLength(200)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string NombreUsuario { get; set; } = string.Empty;

    /// <summary>
    /// Nueva contraseña. Si está vacía, se mantiene la actual.
    /// </summary>
    [MinLength(4)]
    public string? Password { get; set; }

    public RolUsuario Rol { get; set; }
    public EstadoUsuario Estado { get; set; }
}
