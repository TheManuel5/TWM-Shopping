using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System;

namespace TWM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentasController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public VentasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> ProcesarCheckout([FromBody] CheckoutDto request)
        {
            var connectionString = _configuration.GetConnectionString("PostgreConnection");

            using (var connection = new NpgsqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        // 1. Insertar la Venta. Omitimos el 'Estado' (quedará en NULL) para saltar el bug de codificación de Windows
                        var ventaId = new Random().Next(10000, 99999); 
                        
                        var queryVenta = "INSERT INTO Venta (ID, ValorBruto, IVA, Descuento, Total, Descripcion) VALUES (@id, @valor, 19.00, 0, 0, @desc)";
                        using (var cmdVenta = new NpgsqlCommand(queryVenta, connection, transaction))
                        {
                            cmdVenta.Parameters.AddWithValue("@id", ventaId);
                            cmdVenta.Parameters.AddWithValue("@valor", request.ValorBrutoTotal);
                            cmdVenta.Parameters.AddWithValue("@desc", "Compra desde Web React");
                            
                            await cmdVenta.ExecuteNonQueryAsync();
                        }
                        var queryVender = "INSERT INTO Vender (Venta_id, MedioPago_id, Fecha) VALUES (@venta_id, 1, CURRENT_DATE)"; 
                        using (var cmdVender = new NpgsqlCommand(queryVender, connection, transaction))
                        {
                            cmdVender.Parameters.AddWithValue("@venta_id", ventaId);
                            await cmdVender.ExecuteNonQueryAsync();
                        }

                        foreach (var productoId in request.ProductoIds)
                        {
                            var queryComprar = "INSERT INTO Comprar (Producto_id, Venta_id, Cliente_id) VALUES (@prod_id, @venta_id, @cliente_id)";
                            using (var cmdComprar = new NpgsqlCommand(queryComprar, connection, transaction))
                            {
                                cmdComprar.Parameters.AddWithValue("@prod_id", productoId);
                                cmdComprar.Parameters.AddWithValue("@venta_id", ventaId);
                                
                                // Esto soluciona el Warning CS8604 indicando qué hacer si el RUT viene vacío
                                cmdComprar.Parameters.AddWithValue("@cliente_id", request.ClienteRun ?? (object)DBNull.Value);
                                await cmdComprar.ExecuteNonQueryAsync();
                            }
                        }

                        await transaction.CommitAsync();
                        return Ok(new { message = "Compra realizada con éxito. Triggers ejecutados.", ventaId = ventaId });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        
                        // ¡Esta línea es la magia! Imprimirá el error de PostgreSQL en tu terminal negra
                        Console.WriteLine("\n=== ERROR EN POSTGRESQL ===");
                        Console.WriteLine(ex.Message);
                        Console.WriteLine("===========================\n");
                        
                        return StatusCode(500, new { message = "La transacción fue rechazada.", detail = ex.Message });
                    }
                }
            }
        }
    }

    public class CheckoutDto
    {
        public string? ClienteRun { get; set; }
        public int ValorBrutoTotal { get; set; }
        public List<int> ProductoIds { get; set; } = new List<int>();
    }
}