namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// Respuesta del Balance General (Estado de Situación Financiera).
/// Activos = Pasivos + Patrimonio
/// </summary>
public class BalanceGeneralResponse
{
    public DateTime FechaCorte { get; set; }
    public List<BalanceGeneralLinea> Activos { get; set; } = new();
    public decimal TotalActivos { get; set; }
    public List<BalanceGeneralLinea> Pasivos { get; set; } = new();
    public decimal TotalPasivos { get; set; }
    public List<BalanceGeneralLinea> Patrimonio { get; set; } = new();
    public decimal TotalPatrimonio { get; set; }
    public bool Equilibrado { get; set; }
}

public class BalanceGeneralLinea
{
    public int CuentaId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
}
