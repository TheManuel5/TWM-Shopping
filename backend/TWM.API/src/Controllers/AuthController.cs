using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TWM.API.Dtos;
using TWM.API.Services;
using TWM.API.Utils;

namespace TWM.API.Controllers;

/// <summary>Registro, inicio y cierre de sesión, perfil y cambio de contraseña.</summary>
[ApiController, Route("api/auth"), Produces("application/json")]
public sealed class AuthController(AccountService accounts) : ControllerBase
{
    [EnableRateLimiting("auth"), HttpPost("register")]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserProfileResponse>> Register(
        RegisterRequest request,
        CancellationToken ct
    ) =>
        StatusCode(
            StatusCodes.Status201Created,
            UserProfileResponse.From(await accounts.Register(request, ct))
        );

    [EnableRateLimiting("auth"), HttpPost("login")]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> Login(
        LoginRequest request,
        CancellationToken ct
    )
    {
        var profile = await accounts.Login(request, ct);
        if (profile == null)
            return Unauthorized(new ErrorResponse("RUT o contraseña incorrectos."));
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            SessionClaims.Create(profile),
            new AuthenticationProperties { IsPersistent = request.Remember }
        );
        return UserProfileResponse.From(profile);
    }

    [AllowAnonymous, HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return NoContent();
    }

    [Authorize, HttpGet("me")]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> Me(CancellationToken ct)
    {
        var profile = await accounts.Profile(User.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return profile == null ? Unauthorized() : UserProfileResponse.From(profile);
    }

    [Authorize, HttpPut("password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Password(ChangePasswordRequest request, CancellationToken ct)
    {
        var rut = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var session = await HttpContext.AuthenticateAsync();
        await accounts.ChangePassword(rut, request, ct);
        var profile = await accounts.Profile(rut, ct);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            SessionClaims.Create(profile!),
            session.Properties
        );
        return NoContent();
    }
}
