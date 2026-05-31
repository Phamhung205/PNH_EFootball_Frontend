using BTL_Backend_Nhom6.Data;
using BTL_Backend_Nhom6.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Đăng ký kết nối SQL Server ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Mở khóa kết nối cho Frontend (CORS) - Cho phép mọi nguồn truy cập
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 2. SEED DATA: Tự động nạp dữ liệu khi ứng dụng chạy ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // --- A. Nạp Khóa học (150k) ---
        if (!context.Courses.Any())
        {
            context.Courses.Add(new Course
            {
                Name = "Khóa B2 Cấp Tốc",
                Price = 150000, // Giá chuẩn 150k
                DurationHours = 20,
                RequiredKm = 800
            });
            context.SaveChanges();
        }

        // --- B. Nạp 3 Thầy Giáo (Hùng, Mạnh, Đức) ---
        if (!context.Instructors.Any())
        {
            context.Instructors.AddRange(
                new Instructor { Name = "Phạm Ngọc Hùng" },
                new Instructor { Name = "Bùi Đình Mạnh" },
                new Instructor { Name = "Phạm Thế Đức" }
            );
            context.SaveChanges();
        }

        // --- C. Nạp 10 Chiếc Xe (Biển 27, 29, 30) ---
        if (!context.Vehicles.Any())
        {
            context.Vehicles.AddRange(
                // 3 xe biển 27 (Điện Biên)
                new Vehicle { LicensePlate = "27A-111.11", Type = "B2", Odo = 1500, Status = "Ready" },
                new Vehicle { LicensePlate = "27A-222.22", Type = "B1", Odo = 5000, Status = "Ready" },
                new Vehicle { LicensePlate = "27A-333.33", Type = "C", Odo = 12000, Status = "Ready" },

                // 4 xe biển 29 (Hà Nội)
                new Vehicle { LicensePlate = "29A-444.44", Type = "B2", Odo = 8000, Status = "Ready" },
                new Vehicle { LicensePlate = "29A-555.55", Type = "B1", Odo = 2500, Status = "Ready" },
                new Vehicle { LicensePlate = "29A-666.66", Type = "B2", Odo = 300, Status = "Maintenance" }, // Xe đang bảo trì
                new Vehicle { LicensePlate = "29A-777.77", Type = "C", Odo = 15000, Status = "Ready" },

                // 3 xe biển 30 (Hà Nội)
                new Vehicle { LicensePlate = "30A-888.88", Type = "B2", Odo = 4500, Status = "Ready" },
                new Vehicle { LicensePlate = "30A-999.99", Type = "B1", Odo = 6000, Status = "Ready" },
                new Vehicle { LicensePlate = "30A-123.45", Type = "C", Odo = 22000, Status = "Maintenance" } // Xe đang bảo trì
            );
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Lỗi khi nạp dữ liệu mẫu.");
    }
}
// ------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// QUAN TRỌNG: UseCors phải đặt trước UseAuthorization
app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();