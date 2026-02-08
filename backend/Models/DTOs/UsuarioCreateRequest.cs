using System.ComponentModel.DataAnnotations;
using SoftwareContabilidad.Api.Models;

namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para crear un nuevo usuario.
/// </summary>
public class UsuarioCreateRequest
{
    [Required, MaxLength(200)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required, MinLength(4)]
    public string Password { get; set; } = string.Empty;

    public RolUsuario Rol { get; set; }
}
