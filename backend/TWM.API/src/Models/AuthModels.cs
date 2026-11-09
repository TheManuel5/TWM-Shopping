using System.Text.Json.Nodes;
using System.ComponentModel.DataAnnotations;
namespace TWM.API.Models;
public record RegisterRequest([Required] string Rut,[Required,MinLength(3)] string Nombre,[Required,EmailAddress] string Email,[Required,MinLength(8),MaxLength(72)] string Password,[Required] string Telefono,[Required] string Direccion,DateOnly FechaNacimiento,string Rol="cliente",JsonObject? Address=null);
public record LoginRequest([Required] string Rut,[Required] string Password,bool Remember=false);
public record PasswordRequest([Required] string Current,[Required,MinLength(8),MaxLength(72)] string Next);
