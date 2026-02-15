namespace SoftwareContabilidad.Api.Models;

/// <summary>
/// Entidad que representa un movimiento (línea) dentro de un asiento contable.
/// Cada movimiento afecta una cuenta con un monto al debe o al haber.
/// </summary>
public class MovimientoContable
{
    public int Id { get; set; }

    /// <summary>
    /// ID del asiento al que pertenece.
    /// </summary>
    public int AsientoContableId { get; set; }

    /// <summary>
    /// Referencia al asiento contable.
    /// </summary>
    public AsientoContable AsientoContable { get; set; } = null!;

    /// <summary>
    /// ID de la cuenta contable afectada.
    /// </summary>
    public int CuentaContableId { get; set; }

    /// <summary>
    /// Referencia a la cuenta contable.
    /// </summary>
    public CuentaContable CuentaContable { get; set; } = null!;

    /// <summary>
    /// Monto al debe (débito).
    /// </summary>
    public decimal Debe { get; set; }

    /// <summary>
    /// Monto al haber (crédito).
    /// </summary>
    public decimal Haber { get; set; }
}
