var builder = WebApplication.CreateBuilder(args);

// 1. Configurar CORS para permitir que el frontend en React (Vite) se conecte
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2. Agregar soporte para Controladores (MVC/API)
builder.Services.AddControllers();

// 3. Mantener tu configuración nativa de OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 4. Aplicar la política de CORS (debe ir antes del Authorization y Controllers)
app.UseCors("AllowReactApp");

app.UseAuthorization();

// 5. Mapear los controladores para que .NET reconozca rutas como /api/productos
app.MapControllers();

app.Run();