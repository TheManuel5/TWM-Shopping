using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TWM.API.Models;
using TWM.API.Services;
namespace TWM.API.Controllers;
[ApiController,Route("api/state")]
public sealed class StateController(StateService state):ControllerBase {
 [HttpGet] public Task<object> Get(CancellationToken ct)=>state.Read(User,ct);
 [Authorize,HttpPut("transaction"),RequestSizeLimit(15000000)] public Task<object> Put(StateRequest request,CancellationToken ct)=>state.Commit(request.Changes,request.Revision,User,ct,request.Delta,request.Deleted);
}
