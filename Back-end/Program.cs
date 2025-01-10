using Back_end.Controllers;
using Back_end.Services;
using ESI.NET;
using ESI.NET.Models.Corporation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var hostName = builder.Configuration.GetValue<string>("FrontEndURL");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOriginPolicy", policy =>
    {
        policy.WithOrigins(hostName) // Use the allowedHost variable
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var esiSettings = builder.Configuration.GetSection("ESIConfig");

builder.Services.AddEsi(esiSettings);
builder.Services.AddHttpClient();
builder.Services.AddScoped<ESIController>();
builder.Services.AddTransient<ESIService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowedOriginPolicy");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();