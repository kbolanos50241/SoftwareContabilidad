namespace SoftwareContabilidad.Api.Models;

/// <summary>
/// Entidad que representa un asiento contable (libro diario).
/// Refleja una operación financiera con múltiples movimientos.
/// </summary>
public class AsientoContable
{
    public int Id { get; set; }

    /// <summary>
    /// Fecha del asiento.
    /// </summary>
    public DateTime Fecha { get; set; }

    /// <summary>
    /// Descripción de la operación financiera.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Movimientos del asiento (debe y haber).
    /// </summary>
    public ICollection<MovimientoContable> Movimientos { get; set; } = new List<MovimientoContable>();
}
