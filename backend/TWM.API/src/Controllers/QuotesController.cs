using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;
using TWM.API.Models;
using TWM.API.Services;

namespace TWM.API.Controllers;

/// <summary>Mantenimiento manual de cotizaciones (vigencia de 15 días, ajuste semanal y purga a los 45).</summary>
[
    ApiController,
    Authorize(Roles = Roles.Admin),
    Route("api/cotizaciones"),
    Produces("application/json")
]
public sealed class QuotesController(StateService state) : ControllerBase
{
    [HttpPost("mantenimiento")]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<StateSnapshotResponse>> Maintain(CancellationToken ct) =>
        (await state.Maintain(User, ct))!;
}
