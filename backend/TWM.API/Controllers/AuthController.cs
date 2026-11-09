using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TWM.API.Models;
using TWM.API.Services;
using TWM.API.Utils;
namespace TWM.API.Controllers;
[ApiController,Route("api/auth")]
public sealed class AuthController(AccountService accounts):ControllerBase {
 [EnableRateLimiting("auth"),HttpPost("register")]
 public async Task<IActionResult> Register(RegisterRequest request,CancellationToken ct)=>StatusCode(201,SessionClaims.Public(await accounts.Register(request,ct)));
 [EnableRateLimiting("auth"),HttpPost("login")]
 public async Task<IActionResult> Login(LoginRequest request,CancellationToken ct){
  var profile=await accounts.Login(request,ct);if(profile==null)return Unauthorized(new{message="RUT o contraseña incorrectos."});
  await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,SessionClaims.Create(profile),new AuthenticationProperties{IsPersistent=request.Remember});return Ok(SessionClaims.Public(profile));
 }
 [AllowAnonymous,HttpPost("logout")]
 public async Task<IActionResult> Logout(){await HttpContext.SignOutAsync();return NoContent();}
 [Authorize,HttpGet("me")]
 public async Task<IActionResult> Me(CancellationToken ct){var profile=await accounts.Profile(User.FindFirstValue(ClaimTypes.NameIdentifier)!,ct);return profile==null?Unauthorized():Ok(SessionClaims.Public(profile));}
 [Authorize,HttpPut("password")]
 public async Task<IActionResult> Password(PasswordRequest request,CancellationToken ct){
  var rut=User.FindFirstValue(ClaimTypes.NameIdentifier)!;var session=await HttpContext.AuthenticateAsync();await accounts.ChangePassword(rut,request,ct);var profile=await accounts.Profile(rut,ct);await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,SessionClaims.Create(profile!),session.Properties);return NoContent();
 }
}
