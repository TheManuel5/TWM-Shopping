using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;

namespace TWM.API.Dtos;

/// <summary>Filtros de los reportes (GET /api/reportes/{tipo}?from=&amp;to=&amp;q=&amp;carrier=).</summary>
public sealed record ReportQuery
{
    /// <summary>Fecha inicial, formato AAAA-MM-DD.</summary>
    [RegularExpression(
        @"^\d{4}-\d{2}-\d{2}$",
        ErrorMessage = "La fecha inicial debe tener el formato AAAA-MM-DD."
    )]
    public string? From { get; init; }

    /// <summary>Fecha final, formato AAAA-MM-DD.</summary>
    [RegularExpression(
        @"^\d{4}-\d{2}-\d{2}$",
        ErrorMessage = "La fecha final debe tener el formato AAAA-MM-DD."
    )]
    public string? To { get; init; }

    /// <summary>Texto a buscar en cualquier dato del pedido.</summary>
    [StringLength(100, ErrorMessage = "La búsqueda admite hasta 100 caracteres.")]
    public string? Q { get; init; }

    /// <summary>Empresa de transporte, o «Todas».</summary>
    [StringLength(80, ErrorMessage = "El transportista admite hasta 80 caracteres.")]
    public string? Carrier { get; init; }
}

/// <summary>Una fila de reporte, con la misma forma para los tres tipos.</summary>
/// <param name="Id">Pedido o cliente.</param>
/// <param name="Titular">Cliente o transportista.</param>
/// <param name="Detalle">Tienda, cantidad de compras o número de seguimiento.</param>
/// <param name="Valor">Importe en ventas y clientes; dirección en logística.</param>
/// <param name="Estado">Estado del pedido o «Registrado».</param>
public sealed record ReportRowResponse(
    string Id,
    string Titular,
    string Detalle,
    JsonNode? Valor,
    string Estado
);
