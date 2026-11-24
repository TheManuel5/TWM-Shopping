namespace TWM.API.Models;

/// <summary>
/// Roles que la sesión puede tener. Se usan en los atributos [Authorize] y en las comprobaciones
/// de permisos, para que el nombre de cada rol esté escrito en un solo lugar.
/// </summary>
public static class Roles
{
    /// <summary>Cualquier cuenta con sesión iniciada.</summary>
    public const string User = "Usuario";

    /// <summary>Cuenta con perfil de comprador (tabla Cliente).</summary>
    public const string Buyer = "Cliente";

    /// <summary>Cuenta que opera como vendedor (tabla Emprendedor).</summary>
    public const string Seller = "Vendedor";

    /// <summary>Administrador general: permiso asignado expresamente en shopping_ui.principals.</summary>
    public const string Admin = "Admin";

    /// <summary>Administrador o vendedor, para reportes con datos propios.</summary>
    public const string AdminOrSeller = Admin + "," + Seller;
}
