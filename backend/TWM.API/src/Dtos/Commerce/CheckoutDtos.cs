using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using static TWM.API.Services.StateService;

namespace TWM.API.Dtos;

/// <summary>Una línea del carrito que se quiere comprar.</summary>
public sealed record CheckoutItemRequest(
    [Required(ErrorMessage = "Cada artículo debe indicar su publicación.")]
    [property: JsonConverter(typeof(FlexibleStringConverter))]
        string Id,
    [property: JsonConverter(typeof(FlexibleStringConverter))] string? Sku,
    [property: JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    [Range(1, 100000, ErrorMessage = "La cantidad debe estar entre 1 y 100.000.")]
        decimal Qty,
    [property: JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    [Range(0, double.MaxValue, ErrorMessage = "El precio no puede ser negativo.")]
        decimal Price,
    [property: JsonConverter(typeof(FlexibleStringConverter))] string? QuoteId = null
);

/// <summary>Dirección elegida para el despacho. Solo se usa su identificador: el resto se lee de la base.</summary>
public sealed record CheckoutAddressRequest(
    [property: JsonConverter(typeof(FlexibleStringConverter))] string? Id
);

/// <summary>Datos de una compra (POST /api/ventas/preview y /api/ventas/checkout).</summary>
public sealed record CheckoutRequest(
    [
        Required(ErrorMessage = "Selecciona al menos un artículo."),
        MinLength(1, ErrorMessage = "Selecciona al menos un artículo."),
        MaxLength(100, ErrorMessage = "Una compra admite como máximo 100 líneas.")
    ]
        List<CheckoutItemRequest> Items,
    [Required(ErrorMessage = "Indica el vendedor.")] string Vendor,
    CheckoutAddressRequest? Address,
    string? Payment,
    string? CardLast4,
    string? TransferCode,
    [RegularExpression(
        "^(Despacho|Retiro)$",
        ErrorMessage = "La entrega debe ser Despacho o Retiro."
    )]
        string? DeliveryMode,
    [Required(ErrorMessage = "Falta el identificador de la operación.")] string RequestId
);

/// <summary>Totales calculados por el servidor antes de confirmar la compra.</summary>
public sealed record CheckoutPreviewResponse(
    decimal Subtotal,
    decimal Discount,
    decimal Net,
    decimal Iva,
    decimal Shipping,
    decimal Total
)
{
    public static CheckoutPreviewResponse From(JsonObject totals) =>
        new(
            Number(totals, "subtotal"),
            Number(totals, "discount"),
            Number(totals, "net"),
            Number(totals, "iva"),
            Number(totals, "shipping"),
            Number(totals, "total")
        );
}

/// <summary>
/// Resultado de una compra confirmada: el pedido registrado y el estado actualizado de la tienda.
/// El pedido conserva la forma que usa el resto de la aplicación en la colección «orders».
/// </summary>
public sealed record CheckoutResponse(JsonNode? Order, StateSnapshotResponse State);
