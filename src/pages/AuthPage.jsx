import React, { useState } from 'react';
import { authApi } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

import {
  Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User, Shield, Zap,
  ArrowRight, CheckCircle, Send, ChevronLeft, Check, KeyRound
} from 'lucide-react';

const T = {
  vi: {
    loginTitle: 'Chào mừng ',
    loginHighlight: 'trở lại!',
    loginDesc: 'Đăng nhập để tiếp tục hành trình cùng PNH Football',
    registerTitle: 'Tạo tài ',
    registerHighlight: 'khoản mới!',
    registerDesc: 'Gia nhập cộng đồng quản lý giải đấu PNH Football',
    login: 'Đăng Nhập', register: 'Đăng Ký',
    emailLabel: 'Email',
    emailPlaceholder: 'Nhập email',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    loginBtn: 'ĐĂNG NHẬP', loggingIn: 'ĐANG ĐĂNG NHẬP...',
    noAccount: 'Chưa có tài khoản?', registerNow: 'Đăng ký ngay',
    fullNameLabel: 'Họ và tên',
    fullNamePlaceholder: 'Nhập họ và tên đầy đủ',
    confirmPwLabel: 'Xác nhận mật khẩu',
    confirmPwPlaceholder: 'Nhập lại mật khẩu',
    registerBtn: 'ĐĂNG KÝ TÀI KHOẢN', registering: 'ĐANG TẠO...',
    haveAccount: 'Đã có tài khoản?', loginLink: 'Đăng nhập ngay',
    orDivider: 'HOẶC',
    forgotTitle: 'Lấy Lại Mật Khẩu',
    forgotDesc: 'Nhập email để nhận mã OTP đặt lại mật khẩu',
    forgotEmailPlaceholder: 'Email đã đăng ký',
    sendOtpBtn: 'GỬI MÃ OTP', sending: 'ĐANG GỬI...',
    sentOtpInfo: 'Mã OTP đã gửi tới email. Nhập mã + mật khẩu mới bên dưới.',
    otpPlaceholder: 'Nhập mã OTP 6 số',
    newPwPlaceholder: 'Mật khẩu mới',
    confirmNewPwPlaceholder: 'Xác nhận mật khẩu mới',
    resetBtn: 'ĐẶT LẠI MẬT KHẨU', resetting: 'ĐANG ĐẶT LẠI...',
    resetSuccess: 'Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.',
    backToLogin: 'Quay lại đăng nhập',
    wrongCredentials: 'Email hoặc mật khẩu không đúng!',
    pwMismatch: 'Mật khẩu xác nhận không khớp!',
  },
  en: {
    loginTitle: 'Welcome ',
    loginHighlight: 'back!',
    loginDesc: 'Log in to continue your journey with PNH Football',
    registerTitle: 'Create new ',
    registerHighlight: 'account!',
    registerDesc: 'Join the PNH Football tournament management community',
    login: 'Login', register: 'Register',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'LOG IN', loggingIn: 'LOGGING IN...',
    noAccount: "Don't have an account?", registerNow: 'Register now',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Enter your full name',
    confirmPwLabel: 'Confirm password',
    confirmPwPlaceholder: 'Re-enter your password',
    registerBtn: 'REGISTER ACCOUNT', registering: 'CREATING...',
    haveAccount: 'Already have an account?', loginLink: 'Log in now',
    orDivider: 'OR',
    forgotTitle: 'Reset Password',
    forgotDesc: 'Enter your email to receive an OTP code',
    forgotEmailPlaceholder: 'Registered email',
    sendOtpBtn: 'SEND OTP', sending: 'SENDING...',
    sentOtpInfo: 'OTP sent to your email. Enter code + new password below.',
    otpPlaceholder: 'Enter 6-digit OTP',
    newPwPlaceholder: 'New password',
    confirmNewPwPlaceholder: 'Confirm new password',
    resetBtn: 'RESET PASSWORD', resetting: 'RESETTING...',
    resetSuccess: 'Password reset successful! Please sign in with your new password.',
    backToLogin: 'Back to login',
    wrongCredentials: 'Incorrect email or password!',
    pwMismatch: 'Passwords do not match!',
  },
};

/* ── Custom Input Field khớp thiết kế mới ── */
function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, withToggle, showPw, onToggle, error }) {
  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between items-end mb-2">
          <label className="text-[13px] font-medium text-slate-300">{label}</label>
        </div>
      )}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none drop-shadow-[0_0_4px_rgba(255,255,255,0.25)]">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <input
          type={withToggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder} value={value} onChange={onChange} autoComplete="off"
          className={`w-full pl-12 pr-${withToggle ? '12' : '4'} py-3.5 rounded-xl border text-[13px] transition-all duration-200
            bg-white/70 backdrop-blur-[1px] border-slate-300/80 text-slate-900 placeholder-slate-500
            focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]
            ${error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : ''}`} 
        />
        {withToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors drop-shadow-[0_0_4px_rgba(255,255,255,0.25)]">
            {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── SVG Icons cho Social Login ── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mr-2.5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mr-2.5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);


export default function AuthPage({ darkMode = true, language = 'vi', onLogin }) {
  const t = T[language] || T.vi;
  const tr = (vi, en) => (language === 'en' ? en : vi);

  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPw, setResetNewPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      setLoading(false);
      const token = response?.token || response?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        const u = response?.user || response?.data?.user || {};
        localStorage.setItem('user', JSON.stringify(u));
        setSuccess(tr('Đăng nhập thành công!','Signed in successfully!'));
        setTimeout(() => {
          if (onLogin) onLogin({
            id: u.id ?? u.Id ?? null,
            email,
            name: u.fullName || u.FullName,
            role: u.role || u.Role,
            plan: u.plan || u.Plan || 'free',
            planExpiry: u.planExpiry || u.PlanExpiry || null,
            avatar: u.avatarUrl || u.AvatarUrl || '',
          });
        }, 1000);
      } else {
        setError(response?.message || t.wrongCredentials);
      }
    } catch (err) {
      setLoading(false);
      setError('Lỗi hệ thống: ' + err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPw) { setError(t.pwMismatch); return; }
    setLoading(true);
    try {
      const response = await authApi.sendOtp(fullName, email, password);
      setLoading(false);
      if (response?.success || response?.token) {
        setSuccess(response.message || tr('Mã OTP đã được gửi tới email của bạn!','An OTP code has been sent to your email!'));
        setIsVerifyingOtp(true);
      } else {
        setError(response?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Gửi mã OTP thất bại.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otpCode || otpCode.length !== 6) {
      setError('Mã OTP phải chứa đúng 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.verifyOtp({ contactInfo: email, otpCode, fullName, email, password });
      setLoading(false);
      if (response?.success) {
        setSuccess(tr('Đăng ký tài khoản thành công!','Account created successfully!'));
        setTimeout(() => {
          setIsVerifyingOtp(false);
          switchTab('login');
          setSuccess('');
        }, 2000);
      } else {
        setError(response?.message || 'Xác thực thất bại');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Xác thực mã OTP thất bại.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    clearMessages();
    setLoading(true);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setLoading(false);
        setError('Không nhận được thông tin từ Google.');
        return;
      }
      const response = await authApi.externalLogin('Google', idToken);
      setLoading(false);

      const data = response?.data ?? response;
      const token = data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        setSuccess(tr('Đăng nhập bằng Google thành công!','Signed in with Google!'));
        setTimeout(() => {
          if (onLogin) onLogin({
            id: data.user?.id ?? data.user?.Id ?? null,
            email: data.user?.email,
            name: data.user?.fullName,
            role: data.user?.role,
            plan: data.user?.plan || 'free',
            planExpiry: data.user?.planExpiry || null,
            avatar: data.user?.avatarUrl || '',
          });
        }, 800);
      } else {
        setError(response?.message || 'Đăng nhập Google thất bại');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đăng nhập bằng Google thất bại.');
    }
  };

  const handleGoogleError = () => {
    setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail) { setError('Vui lòng nhập email.'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setLoading(false);
      setForgotStep(2);
      setSuccess(t.sentOtpInfo);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Gửi OTP thất bại.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!resetOtp || resetOtp.length !== 6) { setError('Mã OTP phải đúng 6 số.'); return; }
    if (resetNewPw.length < 6) { setError('Mật khẩu mới ít nhất 6 ký tự.'); return; }
    if (resetNewPw !== resetConfirmPw) { setError(t.pwMismatch); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(forgotEmail, resetOtp, resetNewPw);
      setLoading(false);
      setResetDone(true);
      setSuccess(t.resetSuccess);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đặt lại mật khẩu thất bại.');
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    clearMessages();
    setForgotStep(1); setResetDone(false);
    setForgotEmail(''); setResetOtp(''); setResetNewPw(''); setResetConfirmPw('');
  };

  // Hàm thông báo khi bấm vào Facebook
  const handleFacebookClick = () => {
    alert('Tính năng chưa phát triển, chưa thể sử dụng');
  };

  return (
    <div className="min-h-screen bg-[#020613] flex font-sans overflow-hidden relative">
      
      {/* ── ẢNH NỀN VÀ BACKGROUND GLOW EFFECTS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Ảnh nền hiển thị trên Mobile */}
        <img src="/DangNhap.png" alt="Background" className="w-full h-full object-cover block lg:hidden opacity-60 scale-105 blur-[1px]" />
        
        {/* Ảnh nền hiển thị trên PC */}
        <img src="/DangNhap.png" alt="Background" className="w-full h-full object-cover hidden lg:block opacity-60 scale-105 blur-[1px]" />
        
        {/* Lớp Overlay làm mờ ảnh nền để nổi bật form */}
        <div className="absolute inset-0 bg-[#020613]/40 lg:bg-gradient-to-r lg:from-[#020613]/55 lg:via-[#020613]/35 lg:to-[#020613]/55" />

        {/* Các dải sáng Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px] animate-pulse mix-blend-screen" style={{ animationDelay: '1s' }} />
        
        {/* Lưới Grid mờ */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* ── CỘT TRÁI (VISUAL / THƯƠNG HIỆU) CHỈ HIỆN TRÊN PC ── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative z-10 border-r border-white/5">
        <div className="w-full max-w-[420px] flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl font-black text-white italic tracking-widest leading-none drop-shadow-lg">
              PNH <br/><span className="text-xl tracking-[0.2em] text-cyan-400 not-italic">FOOTBALL</span>
            </h1>
            <p className="text-slate-300 text-[10px] font-bold tracking-[0.3em] uppercase mt-4">Play · Compete · Win</p>
          </div>

          {/* Khối khoảng trống ở giữa để nhường chỗ cho ảnh nền (cầu thủ đang sút bóng) */}
          <div className="flex-1 w-full min-h-[220px]" />

          {/* 3 Tính năng nổi bật nằm ở dưới cùng */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-[520px] border-t border-slate-700/50 pt-8 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-6 h-6 text-cyan-400 mb-2 drop-shadow-md" />
              <p className="text-white text-[11px] font-bold uppercase mb-1">Bảo mật tuyệt đối</p>
              <p className="text-slate-400 text-[10px]">Công nghệ mã hóa tiên tiến</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="w-6 h-6 text-cyan-400 mb-2 drop-shadow-md" />
              <p className="text-white text-[11px] font-bold uppercase mb-1">Tốc độ vượt trội</p>
              <p className="text-slate-400 text-[10px]">Xử lý nhanh chóng, mượt mà</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <User className="w-6 h-6 text-cyan-400 mb-2 drop-shadow-md" />
              <p className="text-white text-[11px] font-bold uppercase mb-1">Cộng đồng lớn mạnh</p>
              <p className="text-slate-400 text-[10px]">Hàng ngàn game thủ tin dùng</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CỘT PHẢI (FORM ĐĂNG NHẬP / ĐĂNG KÝ) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        
        {/* Container Form Glassmorphism */}
        <div className="w-full max-w-[440px] relative z-20 bg-[#0A101C]/35 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/5 overflow-hidden">
          
          {/* Header Form (Logo DangNhap.png) */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <h1 className="text-xl font-black text-white italic tracking-wider drop-shadow-md">
              PNH <span className="text-cyan-400 not-italic text-sm">FOOTBALL</span>
            </h1>
          </div>

          {tab === 'forgot' ? (
              /* --- FORM QUÊN MẬT KHẨU --- */
              <div>
                <button onClick={() => switchTab('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                  <ChevronLeft className="w-4 h-4" />{t.backToLogin}
                </button>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center mb-4 border border-cyan-500/30">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.forgotTitle}</h2>
                <p className="text-slate-400 text-[13px] mb-8">{t.forgotDesc}</p>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
                    <p className="text-red-400 text-[13px]">{error}</p>
                  </div>
                )}
                {success && !resetDone && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6">
                    <p className="text-emerald-400 text-[13px]">{success}</p>
                  </div>
                )}

                {resetDone ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold">{t.resetSuccess}</p>
                    <button onClick={() => switchTab('login')} className="mt-6 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1.5">
                      <ChevronLeft className="w-4 h-4" /> {t.backToLogin}
                    </button>
                  </div>
                ) : forgotStep === 1 ? (
                  <form onSubmit={handleSendResetOtp}>
                    <InputField label="Email khôi phục" icon={Mail} type="email" placeholder={t.forgotEmailPlaceholder} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                    <button type="submit" disabled={loading} className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-400 to-cyan-500 hover:opacity-90 shadow-[0_4px_20px_rgba(34,211,238,0.3)] transition-all">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.sending}</> : <>{t.sendOtpBtn} <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <InputField label="Mã xác thực OTP" icon={Shield} type="text" placeholder={t.otpPlaceholder} value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} />
                    <InputField label="Mật khẩu mới" icon={KeyRound} type="password" placeholder={t.newPwPlaceholder} value={resetNewPw} onChange={(e) => setResetNewPw(e.target.value)} withToggle showPw={showResetPw} onToggle={() => setShowResetPw(!showResetPw)} />
                    <InputField label="Xác nhận mật khẩu mới" icon={Lock} type="password" placeholder={t.confirmNewPwPlaceholder} value={resetConfirmPw} onChange={(e) => setResetConfirmPw(e.target.value)} withToggle showPw={showResetPw} onToggle={() => setShowResetPw(!showResetPw)} />
                    <button type="submit" disabled={loading} className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-400 to-cyan-500 hover:opacity-90 shadow-[0_4px_20px_rgba(34,211,238,0.3)] transition-all">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.resetting}</> : <>{t.resetBtn}</>}
                    </button>
                    <button type="button" onClick={() => { setForgotStep(1); clearMessages(); }} className="w-full text-center text-slate-400 hover:text-white text-[13px] mt-4 transition-colors block">
                      Gửi lại mã / đổi email
                    </button>
                  </form>
                )}
              </div>
          ) : (
              /* --- FORM ĐĂNG NHẬP / ĐĂNG KÝ CHÍNH --- */
              <>
                <div className="text-center mb-8">
                  <h2 className="text-[26px] font-bold text-white mb-2 tracking-tight">
                    {tab === 'login' ? t.loginTitle : t.registerTitle} 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">{tab === 'login' ? t.loginHighlight : t.registerHighlight}</span>
                  </h2>
                  <p className="text-slate-400 text-[13px]">{tab === 'login' ? t.loginDesc : t.registerDesc}</p>
                </div>

                {/* Nút Đăng nhập Mạng Xã Hội (Sắp xếp theo chiều dọc) */}
                <div className="flex flex-col gap-3 mb-6 relative z-20">
                  {/* Google Login bọc trong style */}
                  <div className="flex items-center justify-center w-full h-[46px] rounded-xl border border-slate-700/50 bg-[#131B2C]/75 hover:bg-slate-800/80 transition-colors overflow-hidden relative cursor-pointer group shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                     {/* Phủ iframe lên toàn bộ nút để bắt click */}
                     <div className="absolute inset-0 opacity-0 z-10 w-full h-full flex items-center justify-center scale-[3]">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                        />
                     </div>
                     <GoogleIcon />
                     <span className="text-[14px] font-semibold text-slate-300 group-hover:text-white">Google</span>
                  </div>
                  
                  {/* Facebook Login (Tính năng chưa mở) */}
                  <button type="button" onClick={handleFacebookClick} className="flex items-center justify-center w-full h-[46px] rounded-xl border border-slate-700/50 bg-[#131B2C]/75 hover:bg-slate-800/80 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                     <FacebookIcon />
                     <span className="text-[14px] font-semibold text-slate-300">Facebook</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-slate-500 text-[10px] font-bold tracking-widest">{t.orDivider}</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Vùng Thông báo Lỗi / Thành công */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                    <p className="text-red-400 text-[13px]">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-400 text-[13px]">{success}</p>
                  </div>
                )}

                {/* FORM ĐĂNG NHẬP */}
                {tab === 'login' && (
                  <form onSubmit={handleLogin}>
                    <InputField label={t.emailLabel} icon={Mail} type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                    
                    <div className="relative">
                      <button type="button" onClick={() => switchTab('forgot')} className="absolute right-0 top-0 text-slate-500 hover:text-cyan-400 text-[12px] font-medium transition-colors z-10">
                        {t.forgotPassword}
                      </button>
                      <InputField label={t.passwordLabel} icon={Lock} type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} withToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group mb-6 w-max">
                      <div onClick={() => setRememberMe(!rememberMe)} className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all duration-200 cursor-pointer ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0B1325] border-slate-600 group-hover:border-cyan-400'}`}>
                        {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                      <span className="text-slate-400 text-[13px] group-hover:text-slate-300 transition-colors">{t.rememberMe}</span>
                    </label>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black tracking-wide text-white bg-gradient-to-r from-cyan-500/90 to-emerald-400/90 hover:opacity-95 shadow-[0_4px_25px_rgba(34,211,238,0.28)] transition-all duration-200 active:scale-[0.98] disabled:opacity-70">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.loggingIn}</> : <>{t.loginBtn} <ArrowRight className="w-5 h-5 ml-1" /></>}
                    </button>

                    <div className="mt-6 text-center">
                      <span className="text-slate-400 text-[13px]">{t.noAccount} </span>
                      <button type="button" onClick={() => switchTab('register')} className="text-cyan-400 hover:text-cyan-300 text-[13px] font-bold transition-colors">
                        {t.registerNow}
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM ĐĂNG KÝ */}
                {tab === 'register' && (
                  isVerifyingOtp ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center mb-2 mx-auto border border-cyan-500/30">
                        <Send className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-white mb-1">{tr('Xác thực mã OTP','Verify OTP')}</h3>
                        <p className="text-slate-400 text-[13px] leading-relaxed px-4">
                          {tr('Mã xác thực đã được gửi đến email ','Code sent to ')}<br/><strong className="text-white">{email}</strong>
                        </p>
                      </div>
                      <InputField label="Mã OTP" icon={Shield} placeholder={tr("Nhập mã OTP 6 số","Enter 6-digit OTP")} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} type="text" />
                      <button type="submit" disabled={loading} className="w-full mt-6 flex items-center justify-center py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-90 shadow-[0_4px_25px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98]">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Xác thực...</> : <>Hoàn tất đăng ký <ArrowRight className="w-5 h-5 ml-1" /></>}
                      </button>
                      <button type="button" onClick={() => setIsVerifyingOtp(false)} className="w-full text-center text-slate-400 hover:text-white text-[13px] mt-4 transition-colors">
                        Quay lại điền thông tin
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister}>
                      <InputField label={t.fullNameLabel} icon={User} placeholder={t.fullNamePlaceholder} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <InputField label="Email đăng nhập" icon={Mail} type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                      <InputField label={t.passwordLabel} icon={Lock} type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} withToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} />
                      <InputField label={t.confirmPwLabel} icon={Lock} type="password" placeholder={t.confirmPwPlaceholder} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} withToggle showPw={showConfPw} onToggle={() => setShowConfPw(!showConfPw)} error={error && error === t.pwMismatch} />
                      
                      <button type="submit" disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black tracking-wide text-white bg-gradient-to-r from-cyan-500/90 to-emerald-400/90 hover:opacity-95 shadow-[0_4px_25px_rgba(34,211,238,0.28)] transition-all duration-200 active:scale-[0.98] disabled:opacity-70">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.registering}</> : <>{t.registerBtn} <ArrowRight className="w-5 h-5 ml-1" /></>}
                      </button>

                      <div className="mt-6 text-center">
                        <span className="text-slate-400 text-[13px]">{t.haveAccount} </span>
                        <button type="button" onClick={() => switchTab('login')} className="text-cyan-400 hover:text-cyan-300 text-[13px] font-bold transition-colors">
                          {t.loginLink}
                        </button>
                      </div>
                    </form>
                  )
                )}
              </>
          )}

        </div>
        
        {/* Footer Bản Quyền */}
        <div className="absolute bottom-6 w-full text-center lg:left-0 pointer-events-none">
          <p className="text-slate-500 text-[11px]">© 2026 PNH Football. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}