using System.IdentityModel.Tokens.Jwt;
using Duende.Bff;
using Duende.Bff.Yarp;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);



builder.Services
          .AddAuthorization()
          .AddSpaStaticFiles(configuration =>
          {
              configuration.RootPath = "ClientApp/dist/browser";
          });

builder.Services
    .AddBff()
    .AddRemoteApis();
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
    app.MapFallbackToFile("index.html");
    app.Run();
