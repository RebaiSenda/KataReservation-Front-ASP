using System.IdentityModel.Tokens.Jwt;
using Duende.Bff;
using Duende.Bff.Yarp;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();
Log.Information("Starting up");
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, lc) => lc
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
        .Enrich.FromLogContext()
        .ReadFrom.Configuration(ctx.Configuration));
builder.Services
          .AddAuthorization()
          .AddSpaStaticFiles(configuration =>
          {
              configuration.RootPath = "ClientApp/dist/browser";
          });
builder.Services
    .AddBff()
    .AddRemoteApis();
builder.Services.AddControllers();
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = "oidc";
        options.DefaultSignOutScheme = "oidc";
    })
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options => options.Cookie.SameSite = SameSiteMode.Strict)
    .AddOpenIdConnect("oidc", options =>
    {
        options.Authority = "https://localhost:5001";
        options.ClientId = "web";
        options.ClientSecret = "secret";
        options.ResponseType = "code";
        options.ResponseMode = "query";
        options.Scope.Add("KataReservation.Api");
        //options.Scope.Add("KataSimpleAPI");
        options.SaveTokens = true;
        options.GetClaimsFromUserInfoEndpoint = true;
    });
var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseBff();
app.UseAuthorization();
app.MapBffManagementEndpoints();
app.MapRemoteBffApiEndpoint("/remote/rooms", $"{"https://localhost:5002"}/api/rooms")
   .RequireAccessToken(TokenType.User);
app.MapRemoteBffApiEndpoint("/remote/persons", $"{"https://localhost:5002"}/api/persons")
    .RequireAccessToken(TokenType.User);
app.MapRemoteBffApiEndpoint("/remote/bookings", $"{"https://localhost:5002"}/api/bookings")
    .RequireAccessToken(TokenType.User);

// Ajouter l'endpoint de log
app.MapPost("/log", ([FromBody] PostLogMessageRequest request, ILogger<Program> logger) =>
{
    switch (request.LogLevel)
    {
        case LogLevel.Debug:
            logger.LogDebug(request.Message);
            break;
        case LogLevel.Information:
            logger.LogInformation(request.Message);
            break;
        case LogLevel.Warning:
            logger.LogWarning(request.Message);
            break;
        case LogLevel.Error:
            logger.LogError(request.Message);
            break;
        case LogLevel.Critical:
            logger.LogCritical(request.Message);
            break;
        default:
            logger.LogInformation(request.Message);
            break;
    }
    return Results.NoContent();
});

// Une seule fois à la fin
app.MapFallbackToFile("index.html");
app.MapControllers();
app.Run();

// Ajoutez cette classe pour modéliser la requête de log
public class PostLogMessageRequest
{
    public Microsoft.Extensions.Logging.LogLevel LogLevel { get; set; }
    public string Message { get; set; } = string.Empty;
}