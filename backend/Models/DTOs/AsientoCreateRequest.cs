using System.ComponentModel.DataAnnotations;

namespace SoftwareContabilidad.Api.Models.DTOs;

/// <summary>
/// DTO para crear un asiento contable.
/// </summary>
public class AsientoCreateRequest
{
    [Required]
    public DateTime Fecha { get; set; }

    [Required, MaxLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    [Required, MinLength(2, ErrorMessage = "El asiento debe tener al menos 2 movimientos.")]
    public List<MovimientoRequest> Movimientos { get; set; } = new();
}
