using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace TWM.API.Dtos;

/// <summary>Cambios que el cliente quiere guardar (PUT /api/state/transaction).</summary>
/// <param name="Revision">Revisión que el cliente leyó; si otra sesión guardó antes, la API responde 409.</param>
/// <param name="Changes">Colecciones modificadas, por nombre (por ejemplo «cart» o «catalog»).</param>
/// <param name="Delta">Si es verdadero, cada colección trae solo las filas cambiadas.</param>
/// <param name="Deleted">Identificadores eliminados por colección, cuando Delta es verdadero.</param>
public sealed record StateTransactionRequest(
    [Range(0, long.MaxValue, ErrorMessage = "La revisión no es válida.")] long Revision,
    [Required(ErrorMessage = "Indica los cambios que quieres guardar.")]
        Dictionary<string, JsonNode?> Changes,
    bool Delta = false,
    Dictionary<string, string[]>? Deleted = null
);

/// <summary>
/// Estado de la tienda visible para la sesión (GET /api/state y respuesta de cada guardado).
/// Cada colección ya viene filtrada por identidad y rol en el servidor.
/// </summary>
/// <param name="Collections">Colecciones por nombre: catálogo, pedidos, cotizaciones, carrito, etc.</param>
/// <param name="Revision">Versión del estado; se envía de vuelta al guardar.</param>
/// <param name="IsAuthenticated">Si la petición tenía una sesión válida.</param>
/// <param name="Source">Origen de los datos: siempre «public» (el esquema importado de PostgreSQL).</param>
/// <param name="DataMode">Modo de datos: siempre «relational».</param>
/// <param name="Partial">Verdadero en un guardado rápido: solo vienen las colecciones que cambiaron.</param>
public sealed record StateSnapshotResponse(
    Dictionary<string, JsonNode?> Collections,
    long Revision,
    bool IsAuthenticated,
    string Source = "public",
    string DataMode = "relational",
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] bool Partial = false
);
