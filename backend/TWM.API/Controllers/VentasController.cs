using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Models;
using TWM.API.Services;
namespace TWM.API.Controllers;
[ApiController,Authorize,Route("api/ventas")]
public sealed class VentasController(CommerceService commerce,StateService state):ControllerBase {
 [HttpPost("preview")] public Task<object> Preview(CheckoutRequest request,CancellationToken ct)=>commerce.Preview(request,User,ct);
 [HttpPost("checkout")] public Task<object> Checkout(CheckoutRequest request,CancellationToken ct)=>commerce.Checkout(request,User,ct);
 [HttpGet] public Task<object> Get(CancellationToken ct)=>state.Read(User,ct);
}
