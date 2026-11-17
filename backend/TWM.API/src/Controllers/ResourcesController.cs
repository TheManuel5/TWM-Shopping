using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;
using TWM.API.Services;

namespace TWM.API.Controllers;

/// <summary>Recursos REST (productos, servicios, pedidos, usuarios, etc.) sobre el mismo estado validado.</summary>
[ApiController, Route("api/resources"), Route("api"), Produces("application/json")]
public sealed class ResourcesController(StateService state) : ControllerBase
{
    static readonly Dictionary<string, string> Names = new()
    {
        ["catalogo"] = "catalog",
        ["productos"] = "catalog",
        ["servicios"] = "catalog",
        ["usuarios"] = "users",
        ["empresas"] = "companies",
        ["pedidos"] = "orders",
        ["cotizaciones"] = "quotes",
        ["devoluciones"] = "returns",
        ["tarifas"] = "zones",
        ["categorias"] = "categories",
        ["mensajes"] = "messages",
        ["conversaciones"] = "conversations",
    };

    static string Resource(string name) =>
        Names.GetValueOrDefault(name) ?? throw new ArgumentException("Recurso inexistente.");

    static bool Matches(string name, JsonNode? row) =>
        name switch
        {
            "productos" => StateService.Text(row, "tipo") != "Servicio",
            "servicios" => StateService.Text(row, "tipo") == "Servicio",
            _ => true,
        };

    [HttpGet("{resource}")]
    [ProducesResponseType<ResourceListResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ResourceListResponse>> Get(string resource, CancellationToken ct)
    {
        var key = Resource(resource);
        if (
            !new[] { "catalog", "categories", "zones" }.Contains(key)
            && User.Identity?.IsAuthenticated != true
        )
            return Unauthorized();
        var snapshot = await state.Read(User, ct);
        var value = snapshot.Collections.GetValueOrDefault(key);
        return new ResourceListResponse(
            snapshot.Revision,
            value is JsonArray rows
                ? new JsonArray(
                    rows.Where(row => Matches(resource, row))
                        .Select(row => row?.DeepClone())
                        .ToArray()
                )
                : value?.DeepClone()
        );
    }

    [HttpGet("{resource}/{id}")]
    [ProducesResponseType<ResourceItemResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ResourceItemResponse>> Find(
        string resource,
        string id,
        CancellationToken ct
    )
    {
        var key = Resource(resource);
        if (
            !new[] { "catalog", "categories", "zones" }.Contains(key)
            && User.Identity?.IsAuthenticated != true
        )
            return Unauthorized();
        var snapshot = await state.Read(User, ct);
        var row = StateService
            .Rows(snapshot.Collections.GetValueOrDefault(key))
            .FirstOrDefault(row => StateService.Id(row) == id && Matches(resource, row));
        return row == null
            ? NotFound()
            : new ResourceItemResponse(snapshot.Revision, row.DeepClone());
    }

    [Authorize, HttpPost("{resource}")]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    public Task<StateSnapshotResponse> Create(
        string resource,
        [FromBody] JsonObject payload,
        CancellationToken ct
    ) => Mutate(resource, null, payload, false, ct);

    [Authorize, HttpPut("{resource}/{id}")]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    public Task<StateSnapshotResponse> Update(
        string resource,
        string id,
        [FromBody] JsonObject payload,
        CancellationToken ct
    ) => Mutate(resource, id, payload, false, ct);

    [Authorize, HttpDelete("{resource}/{id}")]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    public Task<StateSnapshotResponse> Delete(string resource, string id, CancellationToken ct) =>
        Mutate(resource, id, null, true, ct);

    async Task<StateSnapshotResponse> Mutate(
        string resource,
        string? id,
        JsonObject? payload,
        bool delete,
        CancellationToken ct
    )
    {
        var key = Resource(resource);
        if (key == "categories")
            throw new ArgumentException("Usa /api/state/transaction para el árbol jerárquico.");
        if (!long.TryParse(Request.Headers.IfMatch.ToString().Trim('"'), out var revision))
            throw new ArgumentException("Envía If-Match con la revisión recibida al consultar.");
        var snapshot = await state.Read(User, ct);
        var rows = StateService
            .Rows(snapshot.Collections.GetValueOrDefault(key))
            .DeepClone()
            .AsArray();
        var old = rows.FirstOrDefault(row => StateService.Id(row) == id && Matches(resource, row));
        if (id != null && old == null)
            throw new ArgumentException("Registro inexistente.");
        if (old != null)
            rows.Remove(old);
        if (!delete)
        {
            payload!["id"] =
                id == null
                    ? payload["id"]?.DeepClone() ?? JsonValue.Create(Guid.NewGuid().ToString("N"))
                    : JsonValue.Create(id);
            if (resource == "productos" || resource == "servicios")
                payload["tipo"] = resource == "servicios" ? "Servicio" : "Producto";
            rows.Add(payload);
        }
        return await state.Commit(new() { [key] = rows }, revision, User, ct);
    }
}
