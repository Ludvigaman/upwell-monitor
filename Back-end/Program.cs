using Back_end.Controllers;
using Back_end.Services;
using ESI.NET;
using ESI.NET.Models.Corporation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOriginPolicy", policy =>
    {
        policy.WithOrigins("https://upwell-monitor.ludvigaman.se") // Specify the allowed origin
              .AllowAnyMethod()                                   // Allow all HTTP methods
              .AllowAnyHeader()                                   // Allow all headers
              .AllowCredentials();                                // Optional: If using cookies or credentials
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

// Enforce HTTPS
app.UseHttpsRedirection();

// Use the configured CORS policy
app.UseCors("AllowedOriginPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
