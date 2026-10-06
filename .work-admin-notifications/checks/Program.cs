using Appwebbongda.Controllers;
using Appwebbongda.Data;
using Appwebbongda.Models;
using Appwebbongda.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;

var builder = WebApplication.CreateBuilder();
builder.Logging.ClearProviders();
builder.WebHost.UseUrls("http://127.0.0.1:0");
builder.Services.AddControllers().AddApplicationPart(typeof(AdminNotificationsController).Assembly);
builder.Services.AddAuthentication("test").AddScheme<AuthenticationSchemeOptions, TestAuthentication>("test", _ => { });
builder.Services.AddAuthorization();
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer("Server=127.0.0.1;Database=unused;User Id=unused;Password=unused;TrustServerCertificate=True"));
await using var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
await app.StartAsync();
var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
using var client = new HttpClient { BaseAddress = new Uri(address) };
foreach (var role in new[] { "", "User", "BTC", "Admin" })
{
    foreach (var path in new[] { "/api/AdminNotifications", "/api/AdminNotifications/read" })
    {
        using var request = new HttpRequestMessage(path.EndsWith("read") ? HttpMethod.Post : HttpMethod.Get, path);
        if (role.Length > 0) request.Headers.Add("X-Test-Role", role);
        if (path.EndsWith("read")) request.Content = new StringContent("{\"throughId\":1}", System.Text.Encoding.UTF8, "application/json");
        using var response = await client.SendAsync(request);
        var expected = role.Length == 0 ? HttpStatusCode.Unauthorized : HttpStatusCode.Forbidden;
        if (response.StatusCode != expected) throw new Exception($"{role}: {path} returned {response.StatusCode}; expected {expected}");
        Console.WriteLine($"PASS {path}: {(role.Length == 0 ? "anonymous" : role)} => {(int)response.StatusCode}");
    }
}
await app.StopAsync();
Console.WriteLine("All notification endpoint authorization checks passed; no database connection was used.");

var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer("Server=127.0.0.1;Database=unused;User Id=unused;Password=unused").Options;
using (var context = new StubContext(options, false))
{
    var service = new AdminNotificationService(context, NullLogger<AdminNotificationService>.Instance);
    await service.RecordLoginAsync(new User { Id = 1, FullName = "Admin", Role = "Admin" });
    if (context.Saves != 0) throw new Exception("Admin login should not create a usage notification");
    await service.RecordLoginAsync(new User { Id = 2, FullName = "Player", Role = "User" });
    var entry = context.ChangeTracker.Entries<AdminActivityEvent>().Single().Entity;
    if (context.Saves != 1 || entry.UserId != 2 || entry.UserName != "Player" || entry.CreatedAt.Kind != DateTimeKind.Utc)
        throw new Exception("User login event did not retain the authenticated identity and UTC timestamp");
    Console.WriteLine("PASS admin login is skipped; user login writes an event with authenticated identity and UTC time");
}
using (var context = new StubContext(options, true))
{
    await new AdminNotificationService(context, NullLogger<AdminNotificationService>.Instance).RecordLoginAsync(new User { Id = 2, FullName = "Player" });
    if (context.ChangeTracker.Entries<AdminActivityEvent>().Any()) throw new Exception("Failed notification must be detached");
    Console.WriteLine("PASS notification storage failure does not break login or leave a pending event");
}

class TestAuthentication(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var role = Request.Headers["X-Test-Role"].ToString();
        if (role.Length == 0) return Task.FromResult(AuthenticateResult.NoResult());
        // Admin without a valid user id must be forbidden even with an admin role claim.
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, role) }, "test"));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, "test")));
    }
}

class StubContext(DbContextOptions<AppDbContext> options, bool fail) : AppDbContext(options)
{
    public int Saves { get; private set; }
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        Saves++;
        return fail ? Task.FromException<int>(new InvalidOperationException("Simulated database failure")) : Task.FromResult(1);
    }
}
