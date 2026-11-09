using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;
using TWM.API.Services;
using static TWM.API.Services.StateService;
namespace TWM.API.Controllers;
[ApiController,Authorize(Roles="Admin,Vendedor"),Route("api/reportes")]
public sealed class ReportesController(StateService state):ControllerBase {
 [HttpGet("{type}")]
 public async Task<IActionResult> Get(string type,string? from,string? to,string? q,string? carrier,CancellationToken ct){if(type is not ("ventas" or "clientes" or "logistica"))return NotFound();var data=JsonSerializer.SerializeToNode(await state.Read(User,ct))!;var orders=Rows(data["collections"]!["orders"]).Where(o=>(string.IsNullOrEmpty(from)||string.CompareOrdinal(Text(o,"createdAt")[..10],from)>=0)&&(string.IsNullOrEmpty(to)||string.CompareOrdinal(Text(o,"createdAt")[..10],to)<=0)&&(string.IsNullOrEmpty(q)||o!.ToJsonString().Contains(q,StringComparison.OrdinalIgnoreCase))&&(string.IsNullOrEmpty(carrier)||carrier=="Todas"||Text(o?["dispatch"],"carrier")==carrier)).ToList();object rows=type switch{"clientes"=>orders.GroupBy(o=>Text(o,"customerRut")).Select(g=>new{id=g.Key,titular=Text(g.First(),"customer"),detalle=$"{g.Count()} compras",valor=g.Sum(o=>Number(o,"total")),estado="Registrado"}).ToArray(),"logistica"=>orders.Where(o=>o?["dispatch"]!=null).Select(o=>new{id=Id(o),titular=Text(o?["dispatch"],"carrier"),detalle=Text(o?["dispatch"],"tracking"),valor=Text(o,"address"),estado=Text(o,"status")}).ToArray(),_=>orders.Select(o=>new{id=Id(o),titular=Text(o,"customer"),detalle=Text(o,"store"),valor=Number(o,"total"),estado=Text(o,"status")}).ToArray()};return Ok(rows);}
}
