using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Services;
namespace TWM.API.Controllers;
[ApiController,Authorize(Roles="Admin"),Route("api/cotizaciones")]
public sealed class QuotesController(StateService state):ControllerBase {
 [HttpPost("mantenimiento")]public Task<object> Maintain(CancellationToken ct)=>state.Maintain(User,ct);
}
