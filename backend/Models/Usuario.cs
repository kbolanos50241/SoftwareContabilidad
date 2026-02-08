namespace SoftwareContabilidad.Api.Models;

/// <summary>
/// Entidad que representa un usuario del sistema para autenticación y control de acceso.
/// </summary>
public class Usuario
{
    public int Id { get; set; }

    /// <summary>
    /// Nombre completo del usuario.
    /// </summary>
    public string NombreCompleto { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de usuario para iniciar sesión (único).
    /// </summary>
    public string NombreUsuario { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña hasheada. No almacenar en texto plano.
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Rol asignado: Admin o Usuario.
    /// </summary>
    public RolUsuario Rol { get; set; }

    /// <summary>
    /// Estado del usuario. Solo usuarios Activos pueden iniciar sesión.
    /// </summary>
    public EstadoUsuario Estado { get; set; } = EstadoUsuario.Activo;
}
