using Microsoft.AspNetCore.Mvc;

namespace SoftwareContabilidad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok", mensaje = "API Software Contabilidad funcionando" });
    }
}
