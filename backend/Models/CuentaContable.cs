namespace SoftwareContabilidad.Api.Models;

/// <summary>
/// Entidad que representa una cuenta dentro del plan de cuentas.
/// </summary>
public class CuentaContable
{
    public int Id { get; set; }

    /// <summary>
    /// Código único de la cuenta (ej: 1101, 2101, 5101).
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Nombre descriptivo de la cuenta.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de cuenta: Activo, Pasivo, Patrimonio, Ingreso o Gasto.
    /// </summary>
    public TipoCuenta Tipo { get; set; }

    /// <summary>
    /// Descripción adicional (opcional).
    /// </summary>
    public string? Descripcion { get; set; }

    /// <summary>
    /// Indica si la cuenta está activa y disponible para registrar movimientos.
    /// </summary>
    public bool Activa { get; set; } = true;
}
