using Microsoft.EntityFrameworkCore;
using SoftwareContabilidad.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Software Contabilidad API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Software Contabilidad API v1");
    });
    // En desarrollo no forzar HTTPS para evitar el error de redirección
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Seed usuario admin de prueba si no existe
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (!await context.Usuarios.AnyAsync(u => u.NombreUsuario == "admin"))
    {
        context.Usuarios.Add(new SoftwareContabilidad.Api.Models.Usuario
        {
            NombreCompleto = "Administrador",
            NombreUsuario = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"),
            Rol = SoftwareContabilidad.Api.Models.RolUsuario.Admin,
            Estado = SoftwareContabilidad.Api.Models.EstadoUsuario.Activo
        });
        await context.SaveChangesAsync();
    }
}

app.Run();
