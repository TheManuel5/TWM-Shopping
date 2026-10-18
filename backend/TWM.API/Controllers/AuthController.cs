using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace TWM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var connectionString = _configuration.GetConnectionString("PostgreConnection");

            using (var connection = new NpgsqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // 1. Buscar credenciales en la tabla Cliente
                var queryCliente = "SELECT RUN, Nombre, Apellido FROM Cliente WHERE RUN = @run AND Passwd = @password";
                using (var cmdCliente = new NpgsqlCommand(queryCliente, connection))
                {
                    cmdCliente.Parameters.AddWithValue("@run", request.Run);
                    cmdCliente.Parameters.AddWithValue("@password", request.Password);
                    
                    using (var reader = await cmdCliente.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return Ok(new { 
                                token = "sesion-valida-token", 
                                user = new {
                                    run = reader["RUN"].ToString(),
                                    nombre = reader["Nombre"].ToString(),
                                    apellido = reader["Apellido"].ToString(),
                                    rol = "cliente"
                                }
                            });
                        }
                    }
                }

                // 2. Si no es Cliente, buscar credenciales en la tabla Emprendedor
                var queryEmprendedor = "SELECT RUN, Nombre, Apellido FROM Emprendedor WHERE RUN = @run AND Passwd = @password";
                using (var cmdEmprendedor = new NpgsqlCommand(queryEmprendedor, connection))
                {
                    cmdEmprendedor.Parameters.AddWithValue("@run", request.Run);
                    cmdEmprendedor.Parameters.AddWithValue("@password", request.Password);
                    
                    using (var reader = await cmdEmprendedor.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return Ok(new { 
                                token = "sesion-valida-token",
                                user = new {
                                    run = reader["RUN"].ToString(),
                                    nombre = reader["Nombre"].ToString(),
                                    apellido = reader["Apellido"].ToString(),
                                    rol = "emprendedor"
                                }
                            });
                        }
                    }
                }

                // 3. Si no existe en ninguna de las dos tablas, denegar acceso
                return Unauthorized(new { message = "RUT o contraseña incorrectos. Verifica tus datos." });
            }
        }
    }

    // Objeto que .NET espera recibir desde el formulario de React
    public class LoginDto
    {
        public string Run { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}