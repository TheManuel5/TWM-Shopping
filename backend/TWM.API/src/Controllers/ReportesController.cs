using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;
using TWM.API.Models;
using TWM.API.Services;
using static TWM.API.Services.StateService;

namespace TWM.API.Controllers;

/// <summary>Reportes de ventas, clientes y logística, filtrados por los datos visibles para la sesión.</summary>
[
    ApiController,
    Authorize(Roles = Roles.AdminOrSeller),
    Route("api/reportes"),
    Produces("application/json")
]
public sealed class ReportesController(StateService state) : ControllerBase
{
    [HttpGet("{type}")]
    [ProducesResponseType<IReadOnlyList<ReportRowResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ReportRowResponse>>> Get(
        string type,
        [FromQuery] ReportQuery query,
        CancellationToken ct
    )
    {
        if (type is not ("ventas" or "clientes" or "logistica"))
            return NotFound();
        var snapshot = await state.Read(User, ct);
        var orders = Rows(snapshot.Collections.GetValueOrDefault("orders"))
            .Where(order => Matches(order, query))
            .ToList();
        IReadOnlyList<ReportRowResponse> rows = type switch
        {
            "clientes" => orders
                .GroupBy(order => Text(order, "customerRut"))
                .Select(group => new ReportRowResponse(
                    group.Key,
                    Text(group.First(), "customer"),
                    $"{group.Count()} compras",
                    JsonValue.Create(group.Sum(order => Number(order, "total"))),
                    "Registrado"
                ))
                .ToList(),
            "logistica" => orders
                .Where(order => order?["dispatch"] != null)
                .Select(order => new ReportRowResponse(
                    Id(order),
                    Text(order?["dispatch"], "carrier"),
                    Text(order?["dispatch"], "tracking"),
                    JsonValue.Create(Text(order, "address")),
                    Text(order, "status")
                ))
                .ToList(),
            _ => orders
                .Select(order => new ReportRowResponse(
                    Id(order),
                    Text(order, "customer"),
                    Text(order, "store"),
                    JsonValue.Create(Number(order, "total")),
                    Text(order, "status")
                ))
                .ToList(),
        };
        return Ok(rows);
    }

    static bool Matches(JsonNode? order, ReportQuery query)
    {
        var created = Text(order, "createdAt");
        var day = created.Length >= 10 ? created[..10] : created;
        return (string.IsNullOrEmpty(query.From) || string.CompareOrdinal(day, query.From) >= 0)
            && (string.IsNullOrEmpty(query.To) || string.CompareOrdinal(day, query.To) <= 0)
            && (
                string.IsNullOrEmpty(query.Q)
                || order!.ToJsonString().Contains(query.Q, StringComparison.OrdinalIgnoreCase)
            )
            && (
                string.IsNullOrEmpty(query.Carrier)
                || query.Carrier == "Todas"
                || Text(order?["dispatch"], "carrier") == query.Carrier
            );
    }
}
