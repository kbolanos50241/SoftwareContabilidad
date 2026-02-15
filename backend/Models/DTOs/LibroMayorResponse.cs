namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// Respuesta del Libro Mayor de una cuenta.
/// </summary>
public class LibroMayorResponse
{
    public LibroMayorCuentaInfo Cuenta { get; set; } = null!;
    public List<LibroMayorLinea> Movimientos { get; set; } = new();
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoFinal { get; set; }
}

public class LibroMayorCuentaInfo
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int Tipo { get; set; }
}

public class LibroMayorLinea
{
    public DateTime Fecha { get; set; }
    public int AsientoId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
    public decimal SaldoAcumulado { get; set; }
}
