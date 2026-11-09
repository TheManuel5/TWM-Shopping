using Npgsql;
using TWM.API.Services;
namespace TWM.API.Middlewares;
public sealed class ApiErrors(RequestDelegate next, ILogger<ApiErrors> logger) {
 public async Task Invoke(HttpContext context) {
  try { await next(context); }
  catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested) { }
  catch (Exception error) {
   var status = error switch {
    StateConflictException => 409,
    ForbiddenException => 403,
    ArgumentException or System.Text.Json.JsonException => 400,
    UnauthorizedAccessException => 401,
    PostgresException p when p.SqlState == "23505" => 409,
    PostgresException p when p.SqlState is "P0001" or "23503" or "23514" or "22P02" or "22007" => 400,
    NpgsqlException => 503,
    _ => 500
   };
   if(error is PostgresException databaseError)logger.LogWarning("PostgreSQL {State}, constraint {Constraint}",databaseError.SqlState,databaseError.ConstraintName);
   logger.LogWarning("API request failed: {Type}; trace {Trace}", error.GetType().Name, context.TraceIdentifier);
   context.Response.StatusCode = status;
   await context.Response.WriteAsJsonAsync(new {
    message = status switch {
     400 => error is ArgumentException ? error.Message : error is PostgresException pg && pg.SqlState=="P0001" ? pg.MessageText : "Los datos incumplen una restricción de la base de datos.",
     401 => "Credenciales inválidas.",
     403 => "No tienes permiso para esta acción.",
     409 => error is StateConflictException ? "Los datos cambiaron en otra sesión. Actualiza y vuelve a intentarlo." : "El RUT, correo o teléfono ya está registrado.",
     503 => "PostgreSQL no está disponible. Revisa la configuración local.",
     _ => "No se pudo procesar la solicitud."
    },
    traceId = context.TraceIdentifier
   });
  }
 }
}
