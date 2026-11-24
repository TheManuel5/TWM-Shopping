using System.Text.Json;
using System.Text.Json.Serialization;

namespace TWM.API.Dtos;

/// <summary>Error devuelto por la API. Nunca incluye detalles internos, conexiones ni contraseñas.</summary>
/// <param name="Message">Texto para mostrar al usuario.</param>
/// <param name="TraceId">Identificador para encontrar la petición en el registro del servidor.</param>
/// <param name="Errors">Errores de validación por campo, cuando el cuerpo de la petición no es válido.</param>
public sealed record ErrorResponse(
    string Message,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? TraceId = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        IReadOnlyDictionary<string, string[]>? Errors = null
);

/// <summary>Respuesta simple de una operación terminada.</summary>
public sealed record StatusResponse(string Status);

/// <summary>Estado del proceso de la API (GET /api/health).</summary>
public sealed record HealthResponse(string Status, string Service, int ApiVersion);

/// <summary>Estado de la conexión con PostgreSQL (GET /api/health/database).</summary>
public sealed record DatabaseHealthResponse(string Status, string Database);

/// <summary>
/// Lee un identificador que el cliente puede enviar como texto ("12") o como número (12).
/// Los datos llegan de formularios y de la base con ambos formatos; el DTO los normaliza a texto.
/// </summary>
public sealed class FlexibleStringConverter : JsonConverter<string?>
{
    public override string? Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    ) =>
        reader.TokenType switch
        {
            JsonTokenType.String => reader.GetString(),
            JsonTokenType.Number => reader.TryGetInt64(out var whole)
                ? whole.ToString(System.Globalization.CultureInfo.InvariantCulture)
                : reader.GetDecimal().ToString(System.Globalization.CultureInfo.InvariantCulture),
            JsonTokenType.Null => null,
            _ => throw new JsonException("Se esperaba un texto o un número."),
        };

    public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
    {
        if (value == null)
            writer.WriteNullValue();
        else
            writer.WriteStringValue(value);
    }
}
