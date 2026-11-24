namespace TWM.API.Services;

/// <summary>
/// Formato único de las contraseñas. El navegador envía bcrypt(contraseña, sal fija) y el servidor
/// guarda bcrypt de ese valor. Una contraseña en texto plano (herramientas de prueba o la API directa)
/// se transforma igual antes de guardarla o compararla, así que ambas formas llegan al mismo resultado.
/// </summary>
public static class PasswordTransport
{
    /// <summary>Sal fija que usa el navegador; debe coincidir con frontend/src/utils/authHash.js.</summary>
    public const string Salt = "$2a$10$abcdefghijklmnopqrstuu";

    /// <summary>Indica si el valor ya tiene la forma que produce el navegador (60 caracteres con la sal fija).</summary>
    public static bool IsTransportDigest(string value) =>
        value.Length == 60 && value.StartsWith(Salt, StringComparison.Ordinal);

    /// <summary>Valor que se compara o guarda: el mismo digest si ya lo es; si no, su bcrypt con la sal fija.</summary>
    public static string Canonical(string password) =>
        IsTransportDigest(password) ? password : BCrypt.Net.BCrypt.HashPassword(password, Salt);
}
