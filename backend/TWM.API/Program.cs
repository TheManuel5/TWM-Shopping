using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using TWM.API.Utils;
using TWM.API.Routes;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.Cookies;
using TWM.API.Config;
using TWM.API.Services;
using TWM.API.Middlewares;
var root = Directory.GetCurrentDirectory();
if (!File.Exists(Path.Combine(root, "TWM.API.csproj")) && Directory.Exists(Path.Combine(root, "backend", "TWM.API"))) root = Path.Combine(root, "backend", "TWM.API");
EnvironmentConfig.Load(root);
var builder = WebApplication.CreateBuilder(new WebApplicationOptions { Args = args.Length>0 && new[]{"--admin-rut","--set-password","--upgrade-imported-hashes"}.Contains(args[0]) ? [] : args, ContentRootPath = root });
builder.Logging.ClearProviders(); builder.Logging.AddConsole();
builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(root, ".keys")));
builder.Services.AddRateLimiter(options => { options.RejectionStatusCode = 429; options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 15, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 })); });
builder.Services.AddControllers(); builder.Services.AddOpenApi(); builder.Services.AddSingleton<DatabaseService>(); builder.Services.AddScoped<AccountService>(); builder.Services.AddScoped<RelationalStore>(); builder.Services.AddScoped<ImportedCredentialMigration>(); builder.Services.AddScoped<StateService>(); builder.Services.AddScoped<CommerceService>(); builder.Services.AddHostedService<QuoteLifecycleWorker>();
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options => { options.Cookie.Name = "shopping.session"; options.Cookie.HttpOnly = true; options.Cookie.SameSite = SameSiteMode.Strict; options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; options.ExpireTimeSpan = TimeSpan.FromHours(8); options.Events.OnValidatePrincipal = async context => { var accounts = context.HttpContext.RequestServices.GetRequiredService<AccountService>(); var profile = await accounts.Profile(context.Principal!.FindFirstValue(ClaimTypes.NameIdentifier)!, context.HttpContext.RequestAborted); if (profile == null || profile["active"]?.GetValue<bool>() == false || (profile["authVersion"]?.ToString() ?? "") != context.Principal!.FindFirstValue("authVersion")) { context.RejectPrincipal(); await context.HttpContext.SignOutAsync(); return; } context.ReplacePrincipal(SessionClaims.Create(profile)); }; options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; }; options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; }; }); builder.Services.AddAuthorization();
var app = builder.Build(); app.UseMiddleware<ApiErrors>(); app.UseCors();
app.Use(async (context, next) => { if (!HttpMethods.IsGet(context.Request.Method) && context.Request.Headers.TryGetValue("Origin", out var origin) && !origins.Contains(origin.ToString())) { context.Response.StatusCode = 403; return; } await next(); });
app.UseRateLimiter(); app.UseAuthentication(); app.UseAuthorization(); if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.MapHealthRoutes();
app.MapControllers();
if (builder.Configuration.GetValue<bool>("Database:Initialize")) await app.Services.GetRequiredService<DatabaseService>().Initialize();
if(args.Length==2&&args[0]=="--admin-rut"){using var scope=app.Services.CreateScope();await scope.ServiceProvider.GetRequiredService<AccountService>().SetAdministrator(args[1],CancellationToken.None);Console.WriteLine("Administrador asignado al RUT existente.");return;}
if(args.Length==2&&args[0]=="--set-password"){using var scope=app.Services.CreateScope();var password=Environment.GetEnvironmentVariable("SHOPPING_SETUP_PASSWORD")??throw new ArgumentException("Usa Set-Password.ps1 para introducir la contraseña sin publicarla.");await scope.ServiceProvider.GetRequiredService<AccountService>().ResetPassword(args[1],password,CancellationToken.None);Console.WriteLine("Contraseña bcrypt configurada para el RUT existente.");return;}
if(args.Length==1&&args[0]=="--upgrade-imported-hashes"){using var scope=app.Services.CreateScope();await scope.ServiceProvider.GetRequiredService<ImportedCredentialMigration>().Run(CancellationToken.None);return;}
app.Run();
