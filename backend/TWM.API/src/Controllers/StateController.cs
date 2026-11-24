using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;
using TWM.API.Services;

namespace TWM.API.Controllers;

/// <summary>Estado completo de la tienda para la sesión y guardado de cambios.</summary>
[ApiController, Route("api/state"), Produces("application/json")]
public sealed class StateController(StateService state) : ControllerBase
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    // Se serializa en memoria para enviar Content-Length: el navegador puede mostrar
    // el porcentaje real de descarga del estado inicial.
    [HttpGet]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var snapshot = await state.Read(User, ct);
        var bytes = JsonSerializer.SerializeToUtf8Bytes(snapshot, Json);
        return File(bytes, "application/json; charset=utf-8");
    }

    [Authorize, HttpPut("transaction"), RequestSizeLimit(15000000)]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    public Task<StateSnapshotResponse> Put(StateTransactionRequest request, CancellationToken ct) =>
        state.Commit(request.Changes, request.Revision, User, ct, request.Delta, request.Deleted);
}
