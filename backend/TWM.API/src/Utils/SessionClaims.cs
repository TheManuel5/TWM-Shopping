using System.Security.Claims;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authentication.Cookies;
namespace TWM.API.Utils;
public static class SessionClaims {
 public static ClaimsPrincipal Create(JsonObject profile) {
  var claims=new List<Claim>{new(ClaimTypes.NameIdentifier,profile["rut"]!.ToString()),new(ClaimTypes.Name,profile["nombre"]!.ToString()),new(ClaimTypes.Role,"Usuario"),new("authVersion",profile["authVersion"]?.ToString()??"")};
  if(profile["canBuy"]?.GetValue<bool>()==true)claims.Add(new(ClaimTypes.Role,"Cliente"));
  if(profile["role"]?.ToString()=="Vendedor")claims.Add(new(ClaimTypes.Role,"Vendedor"));
  if(profile["canAdmin"]?.GetValue<bool>()==true)claims.Add(new(ClaimTypes.Role,"Admin"));
  return new ClaimsPrincipal(new ClaimsIdentity(claims,CookieAuthenticationDefaults.AuthenticationScheme));
 }
 public static JsonObject Public(JsonObject profile){var result=profile.DeepClone().AsObject();result.Remove("authVersion");return result;}
}
