using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;
using TWM.API.Services;

namespace TWM.API.Controllers;

/// <summary>Cálculo y registro de compras.</summary>
[ApiController, Authorize, Route("api/ventas"), Produces("application/json")]
public sealed class VentasController(CommerceService commerce, StateService state) : ControllerBase
{
    /// <summary>Calcula los totales en el servidor sin registrar la compra.</summary>
    [HttpPost("preview")]
    [ProducesResponseType<CheckoutPreviewResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    public Task<CheckoutPreviewResponse> Preview(CheckoutRequest request, CancellationToken ct) =>
        commerce.Preview(request, User, ct);

    /// <summary>Registra la compra. Repetir el mismo requestId devuelve el pedido ya creado.</summary>
    [HttpPost("checkout")]
    [ProducesResponseType<CheckoutResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    public Task<CheckoutResponse> Checkout(CheckoutRequest request, CancellationToken ct) =>
        commerce.Checkout(request, User, ct);

    [HttpGet]
    [ProducesResponseType<StateSnapshotResponse>(StatusCodes.Status200OK)]
    public Task<StateSnapshotResponse> Get(CancellationToken ct) => state.Read(User, ct);
}
