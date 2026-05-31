// Hằng số dịch cho app
export const translations = {
  vi: {
    // Header & Navigation
    home: 'Trang Chủ',
    myTournaments: 'Giải Đấu Của Tôi',
    createTournament: 'Tạo Giải Đấu',
    manageTournament: 'Quản Lý Giải',
    findTournament: 'Tìm Giải',
    pricing: 'Bảng Giá',
    darkMode: 'Chế Độ Tối',
    lightMode: 'Chế Độ Sáng',
    language: 'Ngôn Ngữ',
    logout: 'Đăng Xuất',
    vietnamese: 'Tiếng Việt',
    english: 'English',
 
    // Auth
    signIn: 'Đăng Nhập',
    signUp: 'Đăng Ký',
    email: 'Email',
    password: 'Mật Khẩu',
    confirmPassword: 'Xác Nhận Mật Khẩu',
    fullName: 'Họ Và Tên',
    phone: 'Số Điện Thoại',
    alreadyHaveAccount: 'Bạn đã có tài khoản rồi?',
    noAccount: 'Bạn chưa có tài khoản?',
 
    // Tournament
    tournamentName: 'Tên Giải Đấu',
    tournamentFormat: 'Thể Thức Thi Đấu',
    numberOfTeams: 'Số Đội Tham Gia',
    startDate: 'Ngày Khởi Tranh',
    endDate: 'Ngày Kết Thúc',
    description: 'Mô Tả',
    status: 'Trạng Thái',
    venue: 'Địa Điểm',
    league: 'League (Vòng Tròn)',
    knockout: 'Knockout (Loại Trực Tiếp)',
    groupStage: 'Vòng Bảng & Knockout',
 
    // Status
    upcoming: 'Sắp Khởi Tranh',
    ongoing: 'Đang Diễn Ra',
    completed: 'Hoàn Thành',
    cancelled: 'Đã Hủy',
 
    // Buttons
    create: 'Tạo',
    edit: 'Chỉnh Sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    view: 'Xem',
    back: 'Quay Lại',
 
    // Messages
    success: 'Thành Công',
    error: 'Lỗi',
    loading: 'Đang Tải...',
    empty: 'Không Có Dữ Liệu',
  },
  en: {
    // Header & Navigation
    home: 'Home',
    myTournaments: 'My Tournaments',
    createTournament: 'Create Tournament',
    manageTournament: 'Manage Tournament',
    findTournament: 'Find Tournament',
    pricing: 'Pricing',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    logout: 'Logout',
    vietnamese: 'Tiếng Việt',
    english: 'English',
 
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
 
    // Tournament
    tournamentName: 'Tournament Name',
    tournamentFormat: 'Tournament Format',
    numberOfTeams: 'Number of Teams',
    startDate: 'Start Date',
    endDate: 'End Date',
    description: 'Description',
    status: 'Status',
    venue: 'Venue',
    league: 'League (Round Robin)',
    knockout: 'Knockout (Direct Elimination)',
    groupStage: 'Group Stage & Knockout',
 
    // Status
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
 
    // Buttons
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    view: 'View',
    back: 'Back',
 
    // Messages
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    empty: 'No Data',
  }
};
 
// API Config — dùng http khi dev để tránh lỗi SSL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5215';
 
// Thông tin ứng dụng
export const APP_NAME = 'PNH Football';
export const APP_VERSION = '1.0.0';
 
// Default values
export const DEFAULT_TOURNAMENT_FORMAT = 'League';
export const DEFAULT_TEAM_COUNT = 16;
export const TOURNAMENT_FORMATS = ['League', 'Knockout', 'GroupStage_Knockout'];
export const TEAM_COUNT_OPTIONS = [8, 16, 20, 32];
export const TOURNAMENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];