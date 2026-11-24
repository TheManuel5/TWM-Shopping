using System.Security.Claims;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authentication.Cookies;
using TWM.API.Models;

namespace TWM.API.Utils;

public static class SessionClaims
{
    public static ClaimsPrincipal Create(JsonObject profile)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, profile["rut"]!.ToString()),
            new(ClaimTypes.Name, profile["nombre"]!.ToString()),
            new(ClaimTypes.Role, Roles.User),
            new("authVersion", profile["authVersion"]?.ToString() ?? ""),
        };
        if (profile["canBuy"]?.GetValue<bool>() == true)
            claims.Add(new(ClaimTypes.Role, Roles.Buyer));
        if (profile["role"]?.ToString() == Roles.Seller)
            claims.Add(new(ClaimTypes.Role, Roles.Seller));
        if (profile["canAdmin"]?.GetValue<bool>() == true)
            claims.Add(new(ClaimTypes.Role, Roles.Admin));
        return new ClaimsPrincipal(
            new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)
        );
    }
}
