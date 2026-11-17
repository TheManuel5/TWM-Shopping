using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;

namespace TWM.API.Dtos;

/// <summary>Nueva contraseña asignada por el administrador (PUT /api/admin/database/accounts/{rut}/password).</summary>
public sealed record AdminPasswordRequest(
    [
        Required(ErrorMessage = "Indica la nueva contraseña."),
        StringLength(
            72,
            MinimumLength = 8,
            ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres."
        )
    ]
        string Next
);

/// <summary>
/// Alta, cambio o baja de una fila en la administración de tablas (/api/admin/database/tables/{tabla}).
/// Los campos dependen de cada tabla, por eso viajan como JSON; PostgreSQL los valida con fn_crud_*.
/// </summary>
/// <param name="Fields">Columnas a crear o modificar.</param>
/// <param name="Key">Clave primaria completa de la fila, para modificar o eliminar.</param>
public sealed record TableMutationRequest(
    [Required(ErrorMessage = "Indica los campos.")] JsonObject Fields,
    JsonObject? Key
);

/// <summary>Una tabla del esquema público disponible para administrar.</summary>
public sealed record TableInfoResponse(string Name);

/// <summary>Un parámetro de una función analítica de PostgreSQL.</summary>
public sealed record QueryParameterResponse(string Name, string Type, bool Optional);

/// <summary>Una función analítica que el administrador puede ejecutar.</summary>
public sealed record QueryInfoResponse(
    string Id,
    string Name,
    string Arguments,
    string Returns,
    IReadOnlyList<QueryParameterResponse> Parameters
);
