using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Data;

namespace TWM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CatalogoController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public CatalogoController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: api/catalogo
        // Llama a la función fn_catalogo_unificado() de tu base de datos PostgreSQL
        [HttpGet]
        public async Task<IActionResult> GetCatalogo([FromQuery] string? q)
        {
            var connectionString = _configuration.GetConnectionString("PostgreConnection");
            var catalogo = new List<object>();

            try
            {
                using (var connection = new NpgsqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    
                    // Consumimos directamente la función que creaste en funciones.txt
                    var query = "SELECT tipo_item, item_id, item_nombre, categoria_nombre, disponibilidad_stock, precio FROM fn_catalogo_unificado()";
                    
                    // Si el React envía una búsqueda (ej: api/catalogo?q=zapatillas)
                    if (!string.IsNullOrEmpty(q))
                    {
                        query += " WHERE item_nombre ILIKE @q";
                    }

                    using (var command = new NpgsqlCommand(query, connection))
                    {
                        if (!string.IsNullOrEmpty(q))
                        {
                            command.Parameters.AddWithValue("@q", $"%{q}%");
                        }

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                catalogo.Add(new {
                                    Tipo = reader["tipo_item"]?.ToString(),
                                    Id = reader["item_id"],
                                    Nombre = reader["item_nombre"]?.ToString(),
                                    Categoria = reader["categoria_nombre"]?.ToString(),
                                    Stock = reader["disponibilidad_stock"] != DBNull.Value ? Convert.ToInt32(reader["disponibilidad_stock"]) : 0,
                                    Precio = reader["precio"] != DBNull.Value ? Convert.ToInt32(reader["precio"]) : 0
                                });
                            }
                        }
                    }
                }
                
                return Ok(catalogo);
            }
            catch (Exception ex)
            {
                // En caso de error (ej: BD apagada o credenciales incorrectas), devolvemos el error
                return StatusCode(500, new { message = "Error al conectar con PostgreSQL", detail = ex.Message });
            }
        }
    }
}