using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PlacementAnalytics.Application.Common.Interfaces;
using PlacementAnalytics.Application.Services.Implementations;
using PlacementAnalytics.Application.Services.Interfaces;
using PlacementAnalytics.Infrastructure.Data;
using PlacementAnalytics.Infrastructure.Repositories;
using PlacementAnalytics.Infrastructure.Services;
using Serilog;

// Railway injects PORT env var — bind to it
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ─── Serilog ─────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

// ─── Database (Azure SQL or LocalDB) ─────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString,
        sql =>
        {
            sql.MigrationsAssembly("PlacementAnalytics.Infrastructure");
            sql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
        }));

// ─── Health Checks ────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

// ─── Repository + Unit of Work ───────────────────────────────────────────────
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ─── Application Services ────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// ─── JWT Authentication ───────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ─── CORS ─────────────────────────────────────────────────────────────────────
var frontendUrl = builder.Configuration["Frontend:Url"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                frontendUrl,
                "https://placement-analytics.vercel.app",
                "https://*.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ─── Swagger (available in all environments for Azure) ────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Placement Analytics API",
        Version = "v1",
        Description = "REST API for Placement Analytics & Career Readiness Platform",
        Contact = new OpenApiContact { Name = "Placement Team", Email = "admin@placement.edu" }
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Bearer token. Format: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// ─── Auto-migrate + Seed on startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DbSeeder.SeedAsync(db);
        Log.Information("Database seeded successfully.");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Database seeding failed. App will continue.");
    }
}

// ─── Swagger — always on (protected by Azure auth if needed) ─────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Placement Analytics API v1");
    c.RoutePrefix = string.Empty;   // Swagger at root "/"
    c.DocumentTitle = "Placement Analytics API";
});

// ─── Health check endpoint ───────────────────────────────────────────────────
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResultStatusCodes =
    {
        [HealthStatus.Healthy]   = StatusCodes.Status200OK,
        [HealthStatus.Degraded]  = StatusCodes.Status200OK,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
    }
});

app.UseHttpsRedirection();
app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ─── Global exception handler ────────────────────────────────────────────────
app.UseMiddleware<PlacementAnalytics.API.Middleware.GlobalExceptionMiddleware>();

app.MapControllers();
app.Run();
