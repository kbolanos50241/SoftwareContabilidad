namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para respuestas de asientos contables con movimientos.
/// </summary>
public class AsientoResponse
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public List<MovimientoResponse> Movimientos { get; set; } = new();
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
}

public class MovimientoResponse
{
    public int Id { get; set; }
    public int CuentaContableId { get; set; }
    public string CuentaCodigo { get; set; } = string.Empty;
    public string CuentaNombre { get; set; } = string.Empty;
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}
