using System.ComponentModel.DataAnnotations;

namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para registrar un movimiento dentro de un asiento.
/// </summary>
public class MovimientoRequest
{
    public int CuentaContableId { get; set; }

    /// <summary>
    /// Monto al debe. Debe ser 0 o positivo.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal Debe { get; set; }

    /// <summary>
    /// Monto al haber. Debe ser 0 o positivo.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal Haber { get; set; }
}
