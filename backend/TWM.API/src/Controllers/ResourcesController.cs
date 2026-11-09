using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;
using TWM.API.Services;
namespace TWM.API.Controllers;
[ApiController,Route("api/resources"),Route("api")]
public sealed class ResourcesController(StateService state):ControllerBase {
 static readonly Dictionary<string,string> Names=new(){["catalogo"]="catalog",["productos"]="catalog",["servicios"]="catalog",["usuarios"]="users",["empresas"]="companies",["pedidos"]="orders",["cotizaciones"]="quotes",["devoluciones"]="returns",["tarifas"]="zones",["categorias"]="categories",["mensajes"]="messages",["conversaciones"]="conversations"};
 static string Resource(string name)=>Names.GetValueOrDefault(name)??throw new ArgumentException("Recurso inexistente.");
 static bool Matches(string name,JsonNode? row)=>name switch{"productos"=>StateService.Text(row,"tipo")!="Servicio","servicios"=>StateService.Text(row,"tipo")=="Servicio",_=>true};
 async Task<JsonNode> Snapshot(CancellationToken ct)=>JsonSerializer.SerializeToNode(await state.Read(User,ct))!;
 [HttpGet("{resource}")] public async Task<IActionResult> Get(string resource,CancellationToken ct) {var key=Resource(resource);if(!new[]{"catalog","categories","zones"}.Contains(key)&&User.Identity?.IsAuthenticated!=true)return Unauthorized();var snapshot=await Snapshot(ct);var value=snapshot["collections"]![key];return Ok(new{revision=snapshot["revision"]!.GetValue<long>(),items=value is JsonArray rows?new JsonArray(rows.Where(row=>Matches(resource,row)).Select(row=>row?.DeepClone()).ToArray()):value?.DeepClone()});}
 [HttpGet("{resource}/{id}")] public async Task<IActionResult> Find(string resource,string id,CancellationToken ct){var key=Resource(resource);if(!new[]{"catalog","categories","zones"}.Contains(key)&&User.Identity?.IsAuthenticated!=true)return Unauthorized();var snapshot=await Snapshot(ct);var row=StateService.Rows(snapshot["collections"]![key]).FirstOrDefault(row=>StateService.Id(row)==id&&Matches(resource,row));return row==null?NotFound():Ok(new{revision=snapshot["revision"]!.GetValue<long>(),item=row.DeepClone()});}
 [Authorize,HttpPost("{resource}")] public Task<object> Create(string resource,[FromBody]JsonObject payload,CancellationToken ct)=>Mutate(resource,null,payload,false,ct);
 [Authorize,HttpPut("{resource}/{id}")] public Task<object> Update(string resource,string id,[FromBody]JsonObject payload,CancellationToken ct)=>Mutate(resource,id,payload,false,ct);
 [Authorize,HttpDelete("{resource}/{id}")] public Task<object> Delete(string resource,string id,CancellationToken ct)=>Mutate(resource,id,null,true,ct);
 async Task<object> Mutate(string resource,string? id,JsonObject? payload,bool delete,CancellationToken ct) {var key=Resource(resource);if(key=="categories")throw new ArgumentException("Usa /api/state/transaction para el árbol jerárquico.");if(!long.TryParse(Request.Headers.IfMatch.ToString().Trim('"'),out var revision))throw new ArgumentException("Envía If-Match con la revisión recibida al consultar.");var snapshot=await Snapshot(ct);var rows=StateService.Rows(snapshot["collections"]![key]).DeepClone().AsArray();var old=rows.FirstOrDefault(row=>StateService.Id(row)==id&&Matches(resource,row));if(id!=null&&old==null)throw new ArgumentException("Registro inexistente.");if(old!=null)rows.Remove(old);if(!delete){payload!["id"]=id==null?payload["id"]?.DeepClone()??JsonValue.Create(Guid.NewGuid().ToString("N")):JsonValue.Create(id);if(resource=="productos"||resource=="servicios")payload["tipo"]=resource=="servicios"?"Servicio":"Producto";rows.Add(payload);}return await state.Commit(new(){[key]=rows},revision,User,ct);}
}
