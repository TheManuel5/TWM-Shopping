using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace TWM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ReportesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("ejecutar/{queryId}")]
        public async Task<IActionResult> EjecutarConsultaAnalitica(string queryId)
        {
            var connectionString = _configuration.GetConnectionString("PostgreConnection");
            var resultados = new List<Dictionary<string, string>>();

            using (var connection = new NpgsqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string sql = "";

                // Mapeamos los IDs del Frontend a las consultas reales de tus tablas
                if (queryId == "Q-VIST-01")
                {
                    // Vista Factura Fiscal: Calculamos el monto real del IVA y limpiamos el texto roto
                    sql = @"SELECT 
                                '#' || ID AS col1, 
                                'Cliente Rut: ' || (SELECT Cliente_id FROM Comprar WHERE Venta_id = Venta.ID LIMIT 1) AS col2, 
                                'Neto: $' || ValorBruto AS col3, 
                                'IVA: $' || (Total - ValorBruto) AS col4, 
                                COALESCE(REPLACE(Estado, 'En PreparaciÃ³n', 'En Preparación'), 'Recibido') AS col5 
                            FROM Venta 
                            ORDER BY ID DESC LIMIT 10;";
                }
                else if (queryId == "Q-TEMP-05")
                {
                    // Clientes Frecuentes: Agrupamos compras reales
                    sql = @"SELECT 
                                Cliente_id AS col1, 
                                'Cliente Registrado' AS col2, 
                                COUNT(Producto_id) || ' productos' AS col3, 
                                'En BD' AS col4, 
                                'Activo' AS col5 
                            FROM Comprar 
                            GROUP BY Cliente_id;";
                }
                else
                {
                    // Fallback para las consultas que aún no tienen datos en la BD
                    sql = "SELECT 'Sin datos' AS col1, 'Pendiente' AS col2, '-' AS col3, '-' AS col4, 'N/A' AS col5;";
                }

                using (var cmd = new NpgsqlCommand(sql, connection))
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var fila = new Dictionary<string, string>();
                        // Leemos dinámicamente hasta 5 columnas (col1, col2, col3, col4, col5)
                        for (int i = 0; i < reader.FieldCount && i < 5; i++)
                        {
                            fila[$"col{i + 1}"] = reader[i]?.ToString() ?? "";
                        }
                        resultados.Add(fila);
                    }
                }
            }

            return Ok(resultados);
        }
    }
}