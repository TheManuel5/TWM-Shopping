using TWM.API.Services;
namespace TWM.API.Routes;
public static class HealthRoutes {
 public static void MapHealthRoutes(this WebApplication app){
  app.MapGet("/api/health",()=>Results.Ok(new{status="ok",service="Shopping API",apiVersion=4}));
  app.MapGet("/api/health/database",async(DatabaseService database,CancellationToken ct)=>{await using var connection=await database.Open(ct);return Results.Ok(new{status="ok",database="PostgreSQL"});});
 }
}
