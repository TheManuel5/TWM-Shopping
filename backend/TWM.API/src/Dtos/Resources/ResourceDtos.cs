using System.Text.Json.Nodes;

namespace TWM.API.Dtos;

/// <summary>Listado de un recurso (GET /api/{recurso}), con la revisión para enviar luego en If-Match.</summary>
/// <param name="Revision">Revisión del estado en el momento de la lectura.</param>
/// <param name="Items">Filas del recurso; para «categorias» es el árbol jerárquico.</param>
public sealed record ResourceListResponse(long Revision, JsonNode? Items);

/// <summary>Un registro de un recurso (GET /api/{recurso}/{id}).</summary>
public sealed record ResourceItemResponse(long Revision, JsonNode Item);
