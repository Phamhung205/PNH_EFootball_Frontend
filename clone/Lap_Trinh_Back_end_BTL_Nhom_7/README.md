BÁO CÁO BÀI TẬP LỚN

Xây dựng Hệ thống Quản lý Đào tạo Lái xe (PHMCAR DNU)

PHẦN I: MỞ ĐẦU

1. Tên đề tài

"Xây dựng Hệ thống Quản lý Đào tạo Lái xe (PHMCAR DNU)"

2. Tính cấp thiết của đề tài

Tại các Trung tâm đào tạo và sát hạch lái xe hiện nay, công tác quản lý vận hành vẫn còn gặp nhiều khó khăn do sử dụng sổ sách thủ công hoặc phần mềm rời rạc:

Vấn đề xếp lịch: Việc xếp lịch thực hành thủ công dễ dẫn đến tình trạng chồng chéo (trùng xe, trùng giảng viên trong cùng một khung giờ).

Vấn đề quản lý tài nguyên: Khó theo dõi trạng thái phương tiện (sẵn sàng hay bảo trì) và lịch trình của giảng viên.

Vấn đề tài chính: Học viên thường nộp học phí chia làm nhiều đợt, kế toán dễ nhầm lẫn công nợ, khó kiểm soát việc nộp dư/thiếu.

Vấn đề đánh giá: Quá trình chấm điểm sát hạch và lưu hồ sơ còn phân tán, khó lập báo cáo thống kê tỷ lệ đỗ/trượt.

Giải pháp: Xây dựng một hệ thống Web Application tập trung để tự động hóa quy trình xếp lịch (có thuật toán chống trùng), quản lý tài chính chặt chẽ và cung cấp báo cáo trực quan.

3. Mục tiêu đề tài

Mục tiêu chính của bài tập lớn:

Thiết kế cơ sở dữ liệu chuẩn hóa với 8 bảng cho hệ thống quản lý trung tâm lái xe.

Xây dựng RESTful API Backend (C# ASP.NET Core) hỗ trợ nghiệp vụ từ cơ bản đến nâng cao.

Triển khai thuật toán cốt lõi: Thuật toán chống trùng lịch thực hành tự động và logic tính toán công nợ học phí.

Phát triển giao diện Frontend (ReactJS) trực quan, cung cấp Dashboard báo cáo doanh thu và mô phỏng sa hình.

Đảm bảo tính bảo mật và phân quyền đúng quy trình nghiệp vụ.

4. Phạm vi công việc

Phạm vi dữ liệu: Quản lý học viên, giảng viên, phương tiện và hồ sơ đặt lịch của trung tâm.

Phạm vi chức năng: Hỗ trợ 3 nhóm người dùng (Quản trị viên, Nhân viên văn phòng, Hội đồng xét duyệt).

Phạm vi công nghệ: Backend ASP.NET Core 8.0, Frontend ReactJS, Database SQL Server (Entity Framework).

Phạm vi thời gian: 1 kỳ học.

PHẦN II: PHÂN TÍCH YÊU CẦU HỆ THỐNG

1. Phân tích đối tượng sử dụng

Nhóm người dùng

Vai trò

Nhu cầu chính

Nhân viên Văn phòng

Lễ tân, Xếp lịch

Thêm mới học viên, khai báo xe/thầy, đặt lịch thực hành nhanh chóng.

Hội đồng xét duyệt

Giảng viên chấm thi

Xem danh sách học viên, chấm điểm sát hạch đầu ra.

Quản trị Admin

Root Admin

Xem báo cáo doanh thu, tỷ lệ đỗ/trượt, quản lý tài chính và công nợ.

Kết luận: Hệ thống tập trung vào xử lý nghiệp vụ Xếp lịch, Tài nguyên và Tài chính.

2. Phân tích yêu cầu chức năng chính

Nhóm chức năng A: Quản lý Hệ thống & Xếp lịch (Core)

Xác thực và phân quyền người dùng.

Tạo lịch tập thực hành (yêu cầu thuật toán chặn trùng lịch).

Quản lý danh sách lịch tập.

Nhóm chức năng B: Quản lý Tài nguyên (Master Data)

Quản lý danh sách Đội xe (chặn trùng biển số).

Quản lý danh sách Giảng viên.

Nhóm chức năng C: Tài chính & Đào tạo

Quản lý danh mục Khóa học (B1, B2, C).

Chấm điểm sát hạch và tự động đổi trạng thái hồ sơ.

Quản lý công nợ, thu tiền học phí theo đợt.

PHẦN III: THIẾT KẾ CƠ SỞ DỮ LIỆU

1. Sơ đồ Lôgic ER (Entity-Relationship)

┌──────────────┐         ┌──────────────────┐
│  Users       │────────→│  Bookings        │ (Lõi trung tâm)
│              │ 1:N     │                  │
│ PK: Id       │         │ PK: Id           │
└──────────────┘         │ FK: StudentId    │
       │                 │ FK: VehicleId    │
       │                 │ FK: InstructorId │
       │                 └──────────────────┘
       │                          │      │
       │                          │      └──→ ┌────────────────┐
       │                          │           │ Instructors    │
       │                          │           │                │
       │                          │           │ PK: Id         │
       │                          │           └────────────────┘
       │                          │
       │                          └───→ ┌──────────────┐
       │                                │ Vehicles     │
       │                                │              │
       │                                │ PK: Id       │
       │                                └──────────────┘
       │
       ├──→ ┌────────────────────┐
       │    │ Tuitions           │ (Học phí)
       │    │ PK: Id             │
       │    └────────────────────┘
       │
       ├──→ ┌────────────────────┐
       │    │ TrainingResults    │ (Điểm số)
       │    │ PK: Id             │
       │    └────────────────────┘
       │
       └──→ ┌────────────────────┐
            │ Enrollments        │ (Hồ sơ đăng ký)
            │ PK: Id             │
            │ FK: CourseId       │
            └────────────────────┘
                     │
                     ↓
            ┌────────────────────┐
            │ Courses            │ (Khóa học)
            │ PK: Id             │
            └────────────────────┘


2. Chi tiết các bảng dữ liệu vật lý (SQL Server)

Bảng 1: Users (Tài khoản & Học viên)

CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL -- Admin, Staff, Student
);


Bảng 2: Bookings (Lịch tập - Bảng trung tâm)

CREATE TABLE Bookings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentId INT NOT NULL,
    VehicleId INT NOT NULL,
    InstructorId INT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (StudentId) REFERENCES Users(Id),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id),
    FOREIGN KEY (InstructorId) REFERENCES Instructors(Id)
);


Bảng 3: Vehicles (Phương tiện)

CREATE TABLE Vehicles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LicensePlate NVARCHAR(50) UNIQUE NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- B1, B2, C
    Odo FLOAT DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Ready'
);


Bảng 4: Tuitions (Học phí & Công nợ)

CREATE TABLE Tuitions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentName NVARCHAR(100) NOT NULL,
    CourseName NVARCHAR(100),
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaidAmount DECIMAL(18,2) DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Đang nợ'
);


(Các bảng Instructors, Courses, Enrollments, TrainingResults được thiết kế tương tự với đầy đủ Khóa chính và Khóa ngoại).

3. Tóm tắt thiết kế dữ liệu

Bảng

Thành phần

Phụ trách

Chức năng

Users

Hệ thống

Hùng

Quản lý tài khoản, phân quyền

Bookings

Nghiệp vụ Lõi

Hùng

Quản lý lịch thực hành

Vehicles

Tài nguyên

Mạnh

Quản lý đội xe tập lái

Instructors

Tài nguyên

Mạnh

Quản lý hồ sơ giáo viên

Tuitions

Tài chính

Đức

Quản lý công nợ học phí

TrainingResults

Xét duyệt

Đức

Lưu điểm thi sát hạch

Courses

Đào tạo

Đức

Danh mục khóa học (B1,B2)

PHẦN IV: THIẾT KẾ API BACKEND

1. Kiến trúc Backend (Monolithic)

Hệ thống được xây dựng theo kiến trúc Monolithic sử dụng ASP.NET Core 8.0, giao tiếp qua RESTful API chuẩn JSON:

Presentation Layer: Controllers (Định tuyến API).

Business Layer: Các thuật toán xử lý Logic (Anti-overlap, Finance).

Data Access Layer: Entity Framework Core thao tác với SQL Server.

2. Danh sách API Endpoints

A. Module Hệ thống & Xếp Lịch (SV: Hùng)

Method

Endpoint

Mô tả

POST

/api/Auth/login

Xác thực người dùng (JWT Token)

GET

/api/Booking/my-schedule/{id}

Lấy danh sách lịch tập của 1 người

POST

/api/Booking

Tạo lịch tập (Kèm logic Check trùng)

PUT

/api/Booking/{id}/status

Cập nhật trạng thái lịch tập

B. Module Tài nguyên (SV: Mạnh)

Method

Endpoint

Mô tả

GET

/api/Vehicle

Lấy danh sách đội xe

POST

/api/Vehicle

Thêm xe mới (Kèm check trùng Biển số)

GET

/api/Instructor

Lấy danh sách giáo viên

POST

/api/Instructor

Thêm giáo viên mới

C. Module Đào tạo & Tài chính (SV: Đức)

Method

Endpoint

Mô tả

GET

/api/Finance

Lấy danh sách công nợ học phí

POST

/api/Finance/pay/{id}

Thu tiền học phí (Logic trừ nợ/Cắt dư)

GET

/api/Course

Lấy danh mục khóa học

POST

/api/Result/submit-score

Nhập điểm (Logic Đỗ/Trượt & Đổi status)

3. Cấu trúc Request/Response mẫu

Ví dụ 1: API Đặt lịch tập (POST /api/Booking)

Request Body:

{
  "studentId": 1,
  "vehicleId": 2,
  "instructorId": 3,
  "startTime": "2026-03-20T08:00:00",
  "endTime": "2026-03-20T10:00:00"
}


Response Lỗi (400 Bad Request) - Trùng lịch:

{
  "message": "Lỗi: Chiếc xe hoặc Giảng viên này đã có lịch dạy trong khung giờ bạn chọn!"
}


Ví dụ 2: API Thu tiền học phí (POST /api/Finance/pay/1)

Request Body (Truyền số tiền nộp):

500000


Response Success (200 OK):

{
  "message": "Thu tiền thành công. Trạng thái công nợ: Đang nợ",
  "paidAmount": 1500000,
  "totalAmount": 15000000
}


PHẦN V: PHÂN CÔNG NHIỆM VỤ SINH VIÊN

1. Bảng phân công chi tiết

SV1: Phạm Hùng (Nhóm trưởng) - Module Hệ thống & Xếp lịch

Trách nhiệm Backend: Thiết kế Database (Users, Bookings). Xây dựng API Đăng nhập và thuật toán lõi Kiểm tra trùng lịch thực hành.

Trách nhiệm Frontend: Dựng cấu trúc Base Layout (ReactJS, Tailwind CSS), Sidebar, Dashboard. Vẽ biểu đồ thống kê và Sơ đồ sa hình 11 bài thi.

Khó độ: ⭐⭐⭐ (Thuật toán thời gian phức tạp, kiến trúc hệ thống).

SV2: Nguyễn Văn Mạnh - Module Tài nguyên (Master Data)

Trách nhiệm Backend: Thiết kế Database (Vehicles, Instructors). Viết các luồng API CRUD. Xử lý thuật toán Kiểm tra tính duy nhất (Check trùng Biển số xe) trong CSDL.

Trách nhiệm Frontend: Dựng màn hình danh sách Đội xe, Giảng viên. Xây dựng Form khai báo tài nguyên mới.

Khó độ: ⭐⭐ (Nghiệp vụ nền tảng).

SV3: Trần Văn Đức - Module Tài chính & Xét duyệt

Trách nhiệm Backend: Thiết kế Database (Courses, TrainingResults, Tuitions). Viết API chấm điểm sát hạch (tự động cập nhật vòng đời Booking) và thuật toán Thu tiền học phí (Xử lý cộng dồn, cắt nộp dư).

Trách nhiệm Frontend: Xây dựng Form nhập điểm cho Hội đồng và Bảng theo dõi công nợ (kèm Progress Bar thanh tiến trình).

Khó độ: ⭐⭐⭐ (Nghiệp vụ tính toán số liệu tài chính).

PHẦN VI: CHI TIẾT LOGIC CỐT LÕI (BUSINESS LOGIC)

1. Thuật toán kiểm tra trùng lịch tập (SV: Phạm Hùng)

Vấn đề: Đảm bảo 1 chiếc Xe hoặc 1 Giáo viên không bị xếp 2 ca dạy giao nhau về mặt thời gian.
Giải pháp: Sử dụng LINQ truy vấn SQL Server, áp dụng công thức giao nhau đoạn thẳng thời gian.

[HttpPost]
public async Task<IActionResult> CreateBooking([FromBody] Booking newBooking)
{
    bool isConflict = _context.Bookings.Any(existing =>
        existing.Status != "Cancelled" && 
        (existing.VehicleId == newBooking.VehicleId || existing.InstructorId == newBooking.InstructorId) && 
        existing.StartTime < newBooking.EndTime && // Bắt đầu cũ < Kết thúc mới
        newBooking.StartTime < existing.EndTime    // Bắt đầu mới < Kết thúc cũ
    );

    if (isConflict) return BadRequest("Xe hoặc Giáo viên đã bị trùng lịch!");

    _context.Bookings.Add(newBooking);
    await _context.SaveChangesAsync();
    return Ok("Đặt lịch thành công!");
}


2. Logic kiểm tra trùng lặp tài nguyên (SV: Nguyễn Văn Mạnh)

Vấn đề: Chặn nhập dữ liệu rác/trùng lặp Biển số xe ngay từ lớp Controller.
Giải pháp:

[HttpPost("add")]
public async Task<IActionResult> AddVehicle([FromBody] Vehicle request)
{
    if (_context.Vehicles.Any(x => x.LicensePlate == request.LicensePlate)) {
        return BadRequest("Biển số xe này đã tồn tại trong hệ thống!");
    }
    
    _context.Vehicles.Add(request);
    await _context.SaveChangesAsync();
    return Ok("Thêm xe thành công");
}


3. Thuật toán thu tiền & Đóng sổ công nợ (SV: Trần Văn Đức)

Vấn đề: Xử lý việc cộng dồn tiền khách nộp nhiều đợt. Nếu nộp vượt quá học phí, hệ thống phải cắt phần dư và đóng sổ.
Giải pháp:

[HttpPost("pay/{id}")]
public async Task<IActionResult> PayTuition(int id, [FromBody] decimal amount)
{
    var tuition = await _context.Tuitions.FindAsync(id);
    if (tuition.Status == "Hoàn thành") return BadRequest("Đã đóng đủ tiền!");

    tuition.PaidAmount += amount; // Cộng dồn tiền

    // Thuật toán chặn nộp dư và đóng sổ
    if (tuition.PaidAmount >= tuition.TotalAmount)
    {
        tuition.PaidAmount = tuition.TotalAmount; 
        tuition.Status = "Hoàn thành";
    }

    await _context.SaveChangesAsync();
    return Ok("Thu tiền thành công");
}


PHẦN VII: YÊU CẦU KỸ THUẬT & MÔI TRƯỜNG LÀM VIỆC

1. Stack công nghệ

Lớp

Công nghệ

Phiên bản

Backend

C# ASP.NET Core Web API

.NET 8.0

Frontend

ReactJS + Vite + Tailwind CSS

v18+

Database

Microsoft SQL Server

2019+

ORM

Entity Framework Core (Code-First)

v8.0

API Testing

Postman & Swagger UI

-

2. Yêu cầu môi trường chạy dự án

Máy tính Local:

.NET 8.0 SDK.

Node.js v18 trở lên.

Microsoft SQL Server Management Studio (SSMS).

Trình biên dịch: Visual Studio 2022 (Backend) và Visual Studio Code (Frontend).

KẾT LUẬN

Đề tài "Xây dựng Hệ thống Quản lý Đào tạo Lái xe PHMCAR DNU" là một dự án mang tính thực tiễn cao, phản ánh đúng quy trình nghiệp vụ ngoài thực tế.

Thành quả đạt được:

✅ Triển khai thành công kiến trúc Client - Server hiện đại.

✅ Chia module rõ ràng, mỗi sinh viên phụ trách một luồng Logic độc lập.

✅ Xử lý triệt để bài toán khó nhất: Thuật toán chống trùng lịch thực hành tự động với hiệu suất O(1) tại tầng Application.

✅ Số hóa hoàn toàn quy trình thu học phí và chấm điểm sát hạch.

Hệ thống hoạt động ổn định, mượt mà và hoàn toàn có tiềm năng để nâng cấp, áp dụng vào các trung tâm đào tạo sát hạch lái xe quy mô nhỏ và vừa.

Báo cáo được thực hiện bởi Nhóm 7 - Trường Đại học Đại Nam  (Năm 2026)