using TWM.API.Dtos;
using TWM.API.Services;

namespace TWM.API.Routes;

public static class HealthRoutes
{
    public static void MapHealthRoutes(this WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Ok(new HealthResponse("ok", "Shopping API", 4)))
            .Produces<HealthResponse>();
        app.MapGet("/api/health/database", async (DatabaseService database, CancellationToken ct) =>
            {
                await using var connection = await database.Open(ct);
                return Results.Ok(new DatabaseHealthResponse("ok", "PostgreSQL"));
            })
            .Produces<DatabaseHealthResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status503ServiceUnavailable);
    }
}
