using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using static TWM.API.Services.StateService;

namespace TWM.API.Dtos;

/// <summary>Dirección inicial obligatoria al crear una cuenta.</summary>
public sealed record RegisterAddressRequest(
    [
        Required(ErrorMessage = "Indica la calle de la dirección."),
        StringLength(
            120,
            MinimumLength = 3,
            ErrorMessage = "La calle debe tener entre 3 y 120 caracteres."
        )
    ]
        string Street,
    [property: JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    [Range(1, 999999, ErrorMessage = "Indica un número de dirección válido.")]
        int Number,
    [property: JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    [Range(1, int.MaxValue, ErrorMessage = "Selecciona una comuna.")]
        int CommuneId
);

/// <summary>Datos para crear una cuenta de cliente o de cliente y vendedor (POST /api/auth/register).</summary>
public sealed record RegisterRequest(
    [Required(ErrorMessage = "Indica el RUT.")] string Rut,
    [
        Required(ErrorMessage = "Indica el nombre."),
        StringLength(
            120,
            MinimumLength = 3,
            ErrorMessage = "El nombre debe tener entre 3 y 120 caracteres."
        )
    ]
        string Nombre,
    [
        Required(ErrorMessage = "Indica el correo."),
        EmailAddress(ErrorMessage = "El correo no es válido.")
    ]
        string Email,
    [
        Required(ErrorMessage = "Indica la contraseña."),
        StringLength(
            72,
            MinimumLength = 8,
            ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres."
        )
    ]
        string Password,
    [Required(ErrorMessage = "Indica el teléfono.")] string Telefono,
    [Required(ErrorMessage = "Indica la dirección.")] string Direccion,
    DateOnly FechaNacimiento,
    [RegularExpression(
        "^(cliente|vendedor)$",
        ErrorMessage = "El rol debe ser cliente o vendedor."
    )]
        string Rol = "cliente",
    RegisterAddressRequest? Address = null
);

/// <summary>Credenciales de inicio de sesión (POST /api/auth/login).</summary>
public sealed record LoginRequest(
    [Required(ErrorMessage = "Indica el RUT.")] string Rut,
    [Required(ErrorMessage = "Indica la contraseña.")] string Password,
    bool Remember = false
);

/// <summary>Cambio de contraseña de la cuenta en sesión (PUT /api/auth/password).</summary>
public sealed record ChangePasswordRequest(
    [Required(ErrorMessage = "Indica la contraseña actual.")] string Current,
    [
        Required(ErrorMessage = "Indica la nueva contraseña."),
        StringLength(
            72,
            MinimumLength = 8,
            ErrorMessage = "La nueva contraseña debe tener entre 8 y 72 caracteres."
        )
    ]
        string Next
);

/// <summary>Evidencia segura de la protección bcrypt: algoritmo, costo y formato, nunca el hash completo.</summary>
public sealed record CredentialProtectionDto(
    string Algorithm,
    int Cost,
    string Format,
    bool ValueExposed
);

/// <summary>
/// Perfil público de la cuenta. Es lo único que la API devuelve sobre un usuario autenticado:
/// no incluye la contraseña, el hash ni la versión interna de la sesión.
/// </summary>
public sealed record UserProfileResponse(
    string Rut,
    string Run,
    string Nombre,
    string? FechaNacimiento,
    string Role,
    bool CanBuy,
    bool CanSell,
    bool CanAdmin,
    bool Active,
    string Email,
    string Telefono,
    string Direccion,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        CredentialProtectionDto? CredentialProtection = null
)
{
    /// <summary>Convierte el perfil leído desde PostgreSQL en el DTO público.</summary>
    public static UserProfileResponse From(JsonObject profile)
    {
        static bool Flag(JsonObject source, string key, bool fallback) =>
            source[key] is JsonValue value && value.TryGetValue<bool>(out var result)
                ? result
                : fallback;
        var protection = profile["credentialProtection"] as JsonObject;
        return new(
            Rut: Text(profile, "rut"),
            Run: Text(profile, "run", Text(profile, "rut")),
            Nombre: Text(profile, "nombre"),
            FechaNacimiento: profile["fechaNacimiento"]?.ToString(),
            Role: Text(profile, "role", "Comprador"),
            CanBuy: Flag(profile, "canBuy", true),
            CanSell: Flag(profile, "canSell", false),
            CanAdmin: Flag(profile, "canAdmin", false),
            Active: Flag(profile, "active", true),
            Email: Text(profile, "email"),
            Telefono: Text(profile, "telefono"),
            Direccion: Text(profile, "direccion"),
            CredentialProtection: protection == null
                ? null
                : new(
                    Text(protection, "algorithm", "bcrypt"),
                    (int)Number(protection, "cost", 12),
                    Text(protection, "format"),
                    Flag(protection, "valueExposed", false)
                )
        );
    }
}
