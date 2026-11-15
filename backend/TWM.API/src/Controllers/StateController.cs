using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Models;
using TWM.API.Services;

namespace TWM.API.Controllers;

[ApiController, Route("api/state")]
public sealed class StateController(StateService state) : ControllerBase
{
    static readonly System.Text.Json.JsonSerializerOptions Json = new(
        System.Text.Json.JsonSerializerDefaults.Web
    );

    // Se serializa en memoria para enviar Content-Length: el navegador puede mostrar
    // el porcentaje real de descarga del estado inicial.
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var snapshot = await state.Read(User, ct);
        var bytes = System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(
            snapshot,
            snapshot.GetType(),
            Json
        );
        return File(bytes, "application/json; charset=utf-8");
    }

    [Authorize, HttpPut("transaction"), RequestSizeLimit(15000000)]
    public Task<object> Put(StateRequest request, CancellationToken ct) =>
        state.Commit(request.Changes, request.Revision, User, ct, request.Delta, request.Deleted);
}
