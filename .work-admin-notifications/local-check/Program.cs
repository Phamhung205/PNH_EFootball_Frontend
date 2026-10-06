using Appwebbongda.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var configuration = new ConfigurationBuilder()
    .SetBasePath(@"E:\WEB PNH EFOOTBALL\PHH EFOOTBALL BACKEND\PHH EFOOTBALL BACKEND")
    .AddJsonFile("appsettings.json").AddJsonFile("appsettings.Development.json", optional: true)
    .AddEnvironmentVariables().Build();
try
{
    var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(configuration.GetConnectionString("DefaultConnection")).Options;
    await using var context = new AppDbContext(options);
    var events = await context.AdminActivityEvents.CountAsync();
    var reads = await context.AdminActivityReads.CountAsync();
    Console.WriteLine($"PASS: Local notification tables are readable ({events} events, {reads} admin read markers). No database data changed.");
}
catch (Exception exception)
{
    Console.WriteLine($"Local database verification failed: {exception.GetType().Name}. Connection details omitted.");
    Environment.ExitCode = 1;
}
