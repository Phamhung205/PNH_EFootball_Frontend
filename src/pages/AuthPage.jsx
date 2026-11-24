import React, { useState, useRef, useEffect } from 'react';
import { authApi } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

import {
  Eye, EyeOff, Mail, Lock, User, Shield, Zap,
  ArrowRight, CheckCircle, Send, ChevronLeft, Check, KeyRound, Trophy
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   BẢNG NGÔN NGỮ (Việt / Anh)
══════════════════════════════════════════════════════════ */
const T = {
  vi: {
    heroEyebrow: 'Nền tảng eFootball dành cho bạn',
    heroTitle: 'Tổ chức giải đấu,',
    heroHighlight: 'kết nối đam mê.',
    heroDesc: 'Tạo giải đấu, quản lý lịch thi đấu và theo dõi bảng xếp hạng — tất cả trong một nền tảng dành cho cộng đồng bóng đá điện tử.',
    loginTitle: 'Chào mừng ',
    loginHighlight: 'trở lại!',
    loginDesc: 'Đăng nhập để tiếp tục hành trình cùng PNH Football',
    registerTitle: 'Tạo tài ',
    registerHighlight: 'khoản mới!',
    registerDesc: 'Gia nhập cộng đồng quản lý giải đấu PNH Football',
    login: 'Đăng Nhập', register: 'Đăng Ký',
    emailLabel: 'Email',
    emailPlaceholder: 'Nhập địa chỉ email',
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
    heroEyebrow: 'Your eFootball tournament platform',
    heroTitle: 'Host tournaments,',
    heroHighlight: 'connect through football.',
    heroDesc: 'Create competitions, manage fixtures, and follow standings — all in one home for the eFootball community.',
    loginTitle: 'Welcome ',
    loginHighlight: 'back!',
    loginDesc: 'Log in to continue your journey with PNH Football',
    registerTitle: 'Create new ',
    registerHighlight: 'account!',
    registerDesc: 'Join the PNH Football tournament management community',
    login: 'Login', register: 'Register',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
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

/* ══════════════════════════════════════════════════════════
   HOOK: useTabTransition
   Quản lý trạng thái animation khi chuyển tab.
   - Khi gọi transition(newTab), nó:
     1. Bắt đầu fade-out + slide-out nội dung cũ
     2. Sau 220ms đổi nội dung (tab thực sự thay đổi)
     3. Bắt đầu fade-in + slide-in nội dung mới
   - direction: 'left' khi đi sang register, 'right' khi về login
══════════════════════════════════════════════════════════ */
function useTabTransition(initialTab) {
  const [activeTab, setActiveTab]   = useState(initialTab);
  const [animState, setAnimState]   = useState('idle'); // 'idle' | 'exit' | 'enter'
  const [direction, setDirection]   = useState('left'); // 'left' | 'right'
  const pendingTab = useRef(null);

  const transition = (newTab) => {
    if (newTab === activeTab) return;

    // Xác định hướng slide: login→register = sang trái, register→login = sang phải
    setDirection(newTab === 'register' ? 'left' : 'right');
    pendingTab.current = newTab;
    setAnimState('exit');

    setTimeout(() => {
      setActiveTab(newTab);
      setAnimState('enter');
      setTimeout(() => setAnimState('idle'), 300);
    }, 220);
  };

  return { activeTab, animState, direction, transition };
}

/* ══════════════════════════════════════════════════════════
   HELPER: tính class CSS cho animation slide+fade
   exit  → trượt ra ngoài + mờ dần
   enter → trượt vào từ phía đối diện + hiện dần
   idle  → hiển thị bình thường
══════════════════════════════════════════════════════════ */
function getAnimClass(animState, direction) {
  if (animState === 'exit') {
    return direction === 'left'
      ? 'opacity-0 -translate-x-6 scale-[0.98]'
      : 'opacity-0 translate-x-6 scale-[0.98]';
  }
  if (animState === 'enter') {
    return direction === 'left'
      ? 'opacity-0 translate-x-8 scale-[0.98]'
      : 'opacity-0 -translate-x-8 scale-[0.98]';
  }
  // idle
  return 'opacity-100 translate-x-0 scale-100';
}

/* ══════════════════════════════════════════════════════════
   COMPONENT: Ô NHẬP LIỆU (Input Field)
   - Nền tối bán trong suốt với viền mỏng
   - Chữ trắng rõ ràng, placeholder xám nhạt
   - Hiệu ứng focus màu xanh lá (accent bóng đá)
   - Hỗ trợ toggle hiện/ẩn mật khẩu
══════════════════════════════════════════════════════════ */
function InputField({
  label, icon: Icon, type = 'text', placeholder,
  value, onChange, withToggle, showPw, onToggle, error
}) {
  return (
    <div className="mb-4">

      {/* Nhãn trường nhập */}
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}

      {/* Wrapper có vị trí tương đối cho icon */}
      <div className="relative group">

        {/* Icon bên trái – màu xanh lá accent bóng đá */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="w-[17px] h-[17px] text-green-400 opacity-80 group-focus-within:opacity-100 transition-opacity" />
        </div>

        {/* Trường nhập chính – chữ TRẮNG rõ ràng, nền đủ tối */}
        <input
          type={withToggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          className={[
            'w-full pl-11 py-3.5 rounded-xl text-sm font-medium transition-all duration-200',
            /* Màu chữ TRẮNG + placeholder XÁM – rõ ràng, không mờ */
            'text-white placeholder-slate-500',
            /* Nền tối đủ tương phản */
            'bg-[#0d1f35] border border-white/10',
            withToggle ? 'pr-11' : 'pr-4',
            /* Focus: viền xanh lá bóng đá */
            'focus:outline-none focus:border-green-500/70 focus:ring-2 focus:ring-green-500/20',
            error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : '',
            'hover:border-white/20',
          ].join(' ')}
        />

        {/* Nút toggle hiện/ẩn mật khẩu */}
        {withToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-400 transition-colors z-10"
          >
            {showPw
              ? <EyeOff className="w-[17px] h-[17px]" />
              : <Eye className="w-[17px] h-[17px]" />}
          </button>
        )}

        {/* Đường sáng underline khi focus */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-300 group-focus-within:w-[80%] opacity-70" />
      </div>

      {/* Lỗi inline */}
      {error && typeof error === 'string' && (
        <p className="text-red-400 text-[11px] mt-1.5 pl-1">{error}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ICON GOOGLE
══════════════════════════════════════════════════════════ */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mr-2.5 flex-shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   ICON FACEBOOK
══════════════════════════════════════════════════════════ */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mr-2.5 flex-shrink-0" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   COMPONENT: Thẻ tính năng (cột trái PC)
══════════════════════════════════════════════════════════ */
function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-2.5">
        <Icon className="w-5 h-5 text-green-400" />
      </div>
      <p className="text-white text-[11px] font-bold uppercase tracking-wide mb-1">{title}</p>
      <p className="text-slate-500 text-[10px] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENT: Hộp thông báo lỗi / thành công
══════════════════════════════════════════════════════════ */
function AlertBox({ error, success }) {
  if (!error && !success) return null;
  return (
    <div className={[
      'flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-[13px]',
      error
        ? 'bg-red-500/8 border border-red-500/25 text-red-400'
        : 'bg-green-500/8 border border-green-500/25 text-green-400',
    ].join(' ')}>
      {success && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      <p>{error || success}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENT: Nút hành động chính (gradient xanh lá bóng đá)
   - Hiển thị spinner khi loading
   - Glow shadow khi hover
══════════════════════════════════════════════════════════ */
function PrimaryButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-2
        py-3.5 mt-1 rounded-xl
        font-black tracking-widest uppercase text-sm text-white
        bg-gradient-to-r from-green-500 to-emerald-400
        hover:from-green-400 hover:to-emerald-300
        shadow-[0_6px_28px_rgba(34,197,94,0.3)]
        hover:shadow-[0_8px_32px_rgba(34,197,94,0.45)]
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed
      "
    >
      {loading
        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {loadingText}</>
        : children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   TRANG CHÍNH: AuthPage
   Props:
     language – 'vi' | 'en'
     onLogin  – callback trả về object user khi thành công
══════════════════════════════════════════════════════════ */
export default function AuthPage({ darkMode = true, language = 'vi', onLogin }) {
  const t  = T[language] || T.vi;
  const tr = (vi, en) => (language === 'en' ? en : vi);

  /* ── Hook animation chuyển tab (login ↔ register) ── */
  const { activeTab, animState, direction, transition } = useTabTransition('login');

  /* ── State riêng cho tab quên mật khẩu (không dùng hook anim vì khác luồng) ── */
  const [mainVisible, setMainVisible]   = useState(true); // hiển thị main form hay forgot form
  const [forgotAnim, setForgotAnim]     = useState('idle'); // 'idle' | 'exit' | 'enter'

  /* Chuyển sang Forgot: slide main ra, slide forgot vào */
  const goForgot = () => {
    setForgotAnim('exit-main');
    setTimeout(() => { setMainVisible(false); setForgotAnim('enter-forgot'); setTimeout(() => setForgotAnim('idle'), 300); }, 220);
  };

  /* Quay lại Login từ Forgot */
  const goLogin = () => {
    setForgotAnim('exit-forgot');
    setTimeout(() => { setMainVisible(true); transition('login'); setForgotAnim('idle'); }, 220);
  };

  /* ── State form đăng nhập ── */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /* ── State form đăng ký ── */
  const [fullName, setFullName]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showConfPw, setShowConfPw]   = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode]         = useState('');

  /* ── State form quên mật khẩu ── */
  const [forgotEmail, setForgotEmail]       = useState('');
  const [forgotStep, setForgotStep]         = useState(1);
  const [resetOtp, setResetOtp]             = useState('');
  const [resetNewPw, setResetNewPw]         = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [resetDone, setResetDone]           = useState(false);
  const [showResetPw, setShowResetPw]       = useState(false);

  /* ── State thông báo & loading ── */
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(''); setSuccess(''); };

  /* ── Wrapper switchTab: dùng hook transition thay vì setTab thẳng ── */
  const switchTab = (newTab) => {
    clearMessages();
    setForgotStep(1); setResetDone(false);
    setForgotEmail(''); setResetOtp('');
    setResetNewPw(''); setResetConfirmPw('');

    if (newTab === 'forgot') {
      goForgot();
    } else {
      if (!mainVisible) {
        goLogin();
      } else {
        transition(newTab);
      }
    }
  };

  /* ── Đăng nhập email/mật khẩu ── */
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
        setSuccess(tr('Đăng nhập thành công!', 'Signed in successfully!'));
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

  /* ── Gửi OTP đăng ký ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPw) { setError(t.pwMismatch); return; }
    setLoading(true);
    try {
      const response = await authApi.sendOtp(fullName, email, password);
      setLoading(false);
      if (response?.success || response?.token) {
        setSuccess(response.message || tr('Mã OTP đã gửi tới email!', 'OTP sent to your email!'));
        setIsVerifyingOtp(true);
      } else {
        setError(response?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Gửi mã OTP thất bại.');
    }
  };

  /* ── Xác minh OTP hoàn tất đăng ký ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otpCode || otpCode.length !== 6) { setError('Mã OTP phải chứa đúng 6 ký tự.'); return; }
    setLoading(true);
    try {
      const response = await authApi.verifyOtp({ contactInfo: email, otpCode, fullName, email, password });
      setLoading(false);
      if (response?.success) {
        setSuccess(tr('Đăng ký tài khoản thành công!', 'Account created successfully!'));
        setTimeout(() => { setIsVerifyingOtp(false); switchTab('login'); setSuccess(''); }, 2000);
      } else {
        setError(response?.message || 'Xác thực thất bại');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Xác thực mã OTP thất bại.');
    }
  };

  /* ── Đăng nhập Google ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    clearMessages();
    setLoading(true);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) { setLoading(false); setError('Không nhận được thông tin từ Google.'); return; }
      const response = await authApi.externalLogin('Google', idToken);
      setLoading(false);
      const data  = response?.data ?? response;
      const token = data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        setSuccess(tr('Đăng nhập Google thành công!', 'Signed in with Google!'));
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

  const handleGoogleError = () => setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');

  /* ── Gửi OTP đặt lại mật khẩu ── */
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

  /* ── Đặt lại mật khẩu ── */
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

  /* ── Facebook chưa hỗ trợ ── */
  const handleFacebookClick = () => alert('Tính năng chưa phát triển, chưa thể sử dụng');

  /* ══════════════════════════════════════════════════════
     CLASS ANIMATION cho các vùng nội dung
  ══════════════════════════════════════════════════════ */
  // Nội dung form chính (login/register)
  const mainContentClass = [
    'transition-all duration-[220ms] ease-out',
    getAnimClass(animState, direction),
  ].join(' ');

  // Panel forgot: slide từ phải vào, thoát sang trái
  const forgotPanelClass = [
    'transition-all duration-[220ms] ease-out',
    forgotAnim === 'exit-forgot'  ? 'opacity-0 translate-x-6 scale-[0.98]'  : '',
    forgotAnim === 'enter-forgot' ? 'opacity-0 -translate-x-8 scale-[0.98]' : '',
    forgotAnim === 'idle'         ? 'opacity-100 translate-x-0 scale-100'   : '',
  ].join(' ');

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    /* h-screen + overflow-hidden: khóa toàn trang đúng bằng viewport,
       ngăn background bị giãn khi form đăng ký/forgot cao hơn */
    <div className="h-screen bg-[#020613] flex font-sans overflow-hidden relative">

      {/* ════════════════════════════════════════════════
          BACKGROUND: Ảnh nền + Overlay + Hiệu ứng Glow
          ── GIỮ NGUYÊN 100% ──
      ════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none">

        {/* Ảnh nền Mobile */}
        <img
          src="/MobileDN.png"
          alt="Background"
          className="w-full h-full object-cover block lg:hidden opacity-100 scale-105"
        />

        {/* Ảnh nền Desktop */}
        <img
          src="/DangNhap.png"
          alt="Background"
          className="w-full h-full object-cover hidden lg:block opacity-100 scale-110"
          style={{ objectPosition: 'center center' }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-[#020613]/20 lg:bg-gradient-to-r lg:from-[#020613]/30 lg:via-[#020613]/15 lg:to-[#020613]/50" />

        {/* Glow góc trái trên */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px] animate-pulse mix-blend-screen" />

        {/* Glow góc phải dưới */}
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-green-600/12 rounded-full blur-[160px] animate-pulse mix-blend-screen"
          style={{ animationDelay: '1.5s' }}
        />

        {/* Lưới kỹ thuật số */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════
          CỘT TRÁI: Thương hiệu (chỉ Desktop)
          h-full để khớp chiều cao wrapper cố định
      ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-1/2 h-full flex-col justify-between items-center px-8 py-7 xl:px-12 xl:py-10 relative z-10 border-r border-white/5">

        {/* Logo thương hiệu */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <Trophy className="w-7 h-7 xl:w-8 xl:h-8 text-green-400" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white italic tracking-widest leading-none drop-shadow-lg">
            PNH
          </h1>
          <span className="text-base xl:text-lg tracking-[0.3em] text-green-400 font-bold uppercase mt-1 not-italic">
            Football
          </span>
          <p className="text-slate-400 text-[10px] font-semibold tracking-[0.25em] uppercase mt-2">
            Play · Compete · Win
          </p>
        </div>

        {/* Giới thiệu nền tảng */}
        <div className="w-full max-w-[540px] text-center py-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3.5 py-1.5 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.16em] text-green-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
            {t.heroEyebrow}
          </p>
          <h2 className="mt-5 text-3xl xl:text-[38px] font-black leading-tight tracking-tight text-white drop-shadow-lg">
            {t.heroTitle}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-cyan-300">
              {t.heroHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[430px] text-sm xl:text-[15px] leading-7 text-slate-300/90">
            {t.heroDesc}
          </p>
        </div>

        {/* 3 Thẻ tính năng */}
        <div className="grid grid-cols-3 gap-3 xl:gap-6 w-full max-w-[520px] border-t border-white/10 pt-5 xl:pt-7">
          <FeatureCard icon={Shield} title="Bảo mật tuyệt đối" desc="Mã hóa dữ liệu tiên tiến" />
          <FeatureCard icon={Zap}    title="Tốc độ vượt trội"  desc="Xử lý nhanh, mượt mà"     />
          <FeatureCard icon={User}   title="Cộng đồng lớn"      desc="Hàng ngàn game thủ"       />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CỘT PHẢI: Panel Form
          h-full + overflow-y-auto: chiều cao khớp viewport,
          scroll nội bộ khi form đăng ký dài hơn màn hình
          → background không bị giãn
      ════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 sm:p-8 overflow-y-auto relative z-10">

        {/*
         * Hộp form Glassmorphism
         * overflow-hidden để nội dung bên trong không tràn khi animate
         */}
        <div className="
          w-full max-w-[440px] relative z-20
          bg-[#0a1628]/90 backdrop-blur-xl
          border border-green-500/15
          rounded-3xl
          p-7 sm:p-9
          shadow-[0_32px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]
          overflow-hidden
        ">

          {/* Highlight viền trên */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

          {/* ── Logo gọn trong form ── */}
          <div className="flex flex-col items-center mb-7 lg:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white italic tracking-wider leading-tight">
                  PNH <span className="text-green-400 not-italic text-base font-bold tracking-widest">FOOTBALL</span>
                </h1>
                <p className="text-[9px] font-bold tracking-[0.25em] text-slate-500 uppercase">
                  Tournament System
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              PANEL: QUÊN MẬT KHẨU
              Hiển thị khi mainVisible = false
          ════════════════════════════════════════ */}
          {!mainVisible && (
            <div className={forgotPanelClass}>
              {/* Nút quay lại */}
              <button
                onClick={() => switchTab('login')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-colors mb-6 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> {t.backToLogin}
              </button>

              {/* Icon + tiêu đề */}
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/25 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{t.forgotTitle}</h2>
              <p className="text-slate-400 text-[13px] mb-7">{t.forgotDesc}</p>

              <AlertBox error={error} success={success && !resetDone ? success : ''} />

              {resetDone ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">{t.resetSuccess}</p>
                  <button
                    onClick={() => switchTab('login')}
                    className="mt-6 text-green-400 hover:text-green-300 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t.backToLogin}
                  </button>
                </div>
              ) : forgotStep === 1 ? (
                <form onSubmit={handleSendResetOtp}>
                  <InputField label="Email khôi phục" icon={Mail} type="email" placeholder={t.forgotEmailPlaceholder} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  <PrimaryButton loading={loading} loadingText={t.sending}>
                    {t.sendOtpBtn} <ArrowRight className="w-4 h-4 ml-1" />
                  </PrimaryButton>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <InputField label="Mã xác thực OTP"      icon={Shield}   type="text"     placeholder={t.otpPlaceholder}        value={resetOtp}       onChange={(e) => setResetOtp(e.target.value)} />
                  <InputField label="Mật khẩu mới"         icon={KeyRound} type="password" placeholder={t.newPwPlaceholder}      value={resetNewPw}     onChange={(e) => setResetNewPw(e.target.value)}     withToggle showPw={showResetPw} onToggle={() => setShowResetPw(!showResetPw)} />
                  <InputField label="Xác nhận mật khẩu mới" icon={Lock}   type="password" placeholder={t.confirmNewPwPlaceholder} value={resetConfirmPw} onChange={(e) => setResetConfirmPw(e.target.value)} withToggle showPw={showResetPw} onToggle={() => setShowResetPw(!showResetPw)} />
                  <PrimaryButton loading={loading} loadingText={t.resetting}>{t.resetBtn}</PrimaryButton>
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); clearMessages(); }}
                    className="w-full text-center text-slate-400 hover:text-green-400 text-[13px] mt-4 transition-colors block"
                  >
                    Gửi lại mã / đổi email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              PANEL: ĐĂNG NHẬP / ĐĂNG KÝ CHÍNH
              Hiển thị khi mainVisible = true
              Toàn bộ nội dung wrapped trong div với class animation
          ════════════════════════════════════════ */}
          {mainVisible && (
            <>
              {/* Tiêu đề – animate cùng nội dung */}
              <div className={[mainContentClass, 'text-center mb-6'].join(' ')}>
                <h2 className="text-[26px] font-bold text-white mb-2 tracking-tight">
                  {activeTab === 'login' ? t.loginTitle : t.registerTitle}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    {activeTab === 'login' ? t.loginHighlight : t.registerHighlight}
                  </span>
                </h2>
                <p className="text-slate-400 text-[13px]">
                  {activeTab === 'login' ? t.loginDesc : t.registerDesc}
                </p>
              </div>

              {/* ── Tab switcher ──
               * Thanh tab với indicator chạy mượt bên dưới tab active
               * Nút ấn gọi transition() thay vì setTab() trực tiếp
               */}
              <div className="relative flex rounded-xl overflow-hidden bg-[#060f1e] border border-white/8 mb-6">
                {[
                  { key: 'login',    label: t.login    },
                  { key: 'register', label: t.register },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => transition(key)}
                    className={[
                      'flex-1 py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all duration-200 relative z-10',
                      activeTab === key
                        ? 'text-green-400'
                        : 'text-slate-500 hover:text-slate-300',
                    ].join(' ')}
                  >
                    {label}

                    {/* Indicator gạch chân chạy mượt */}
                    <span
                      className={[
                        'absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300',
                        activeTab === key
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400 opacity-100'
                          : 'opacity-0',
                      ].join(' ')}
                    />
                  </button>
                ))}

                {/* Sliding background highlight di chuyển theo tab active */}
                <div
                  className="absolute top-0 bottom-0 w-1/2 bg-green-500/10 transition-all duration-300 ease-out pointer-events-none"
                  style={{ left: activeTab === 'login' ? '0%' : '50%' }}
                />
              </div>

              {/* ── Nút Social Login ── */}
              <div className={[mainContentClass, 'flex flex-col gap-3 mb-6 relative z-20'].join(' ')}>

                {/* Google */}
                <div className="
                  relative flex items-center justify-center w-full h-[46px]
                  rounded-xl border border-slate-700/50 bg-[#131B2C]/75
                  hover:bg-slate-800/80 transition-colors overflow-hidden cursor-pointer group
                  shadow-[0_0_20px_rgba(34,211,238,0.15)]
                ">
                  <div className="absolute inset-0 opacity-0 z-10 w-full h-full flex items-center justify-center scale-[3]">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                  </div>
                  <GoogleIcon />
                  <span className="text-[14px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    Google
                  </span>
                </div>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookClick}
                  className="
                    flex items-center justify-center w-full h-[46px]
                    rounded-xl border border-slate-700/50 bg-[#131B2C]/75
                    hover:bg-slate-800/80 transition-colors
                    shadow-[0_0_20px_rgba(59,130,246,0.12)]
                  "
                >
                  <FacebookIcon />
                  <span className="text-[14px] font-semibold text-slate-300">Facebook</span>
                </button>
              </div>

              {/* Phân cách */}
              <div className={[mainContentClass, 'flex items-center gap-4 mb-6'].join(' ')}>
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-[10px] font-bold tracking-widest">{t.orDivider}</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Thông báo */}
              <AlertBox error={error} success={success} />

              {/* ════════════════════════════════
                  FORM ĐĂNG NHẬP – animate slide
              ════════════════════════════════ */}
              {activeTab === 'login' && (
                <div className={mainContentClass}>
                  <form onSubmit={handleLogin}>

                    <InputField
                      label={t.emailLabel}
                      icon={Mail}
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Mật khẩu + link quên mật khẩu */}
                    <div className="relative mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          {t.passwordLabel}
                        </label>
                        <button
                          type="button"
                          onClick={() => switchTab('forgot')}
                          className="text-[11px] font-semibold text-green-400 hover:text-green-300 transition-colors"
                        >
                          {t.forgotPassword}
                        </button>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Lock className="w-[17px] h-[17px] text-green-400 opacity-80 group-focus-within:opacity-100 transition-opacity" />
                        </div>
                        <input
                          type={showPw ? 'text' : 'password'}
                          placeholder={t.passwordPlaceholder}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="off"
                          className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 text-white placeholder-slate-500 bg-[#0d1f35] border border-white/10 hover:border-white/20 focus:outline-none focus:border-green-500/70 focus:ring-2 focus:ring-green-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-400 transition-colors z-10"
                        >
                          {showPw ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
                        </button>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-300 group-focus-within:w-[80%] opacity-70" />
                      </div>
                    </div>

                    {/* Checkbox ghi nhớ */}
                    <label className="flex items-center gap-3 cursor-pointer group mb-6 w-max">
                      <div
                        onClick={() => setRememberMe(!rememberMe)}
                        className={[
                          'w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0',
                          rememberMe
                            ? 'bg-green-500 border-green-500'
                            : 'bg-[#0d1f35] border-slate-600 group-hover:border-green-400',
                        ].join(' ')}
                      >
                        {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                      <span className="text-slate-400 text-[13px] group-hover:text-slate-300 transition-colors select-none">
                        {t.rememberMe}
                      </span>
                    </label>

                    <PrimaryButton loading={loading} loadingText={t.loggingIn}>
                      {t.loginBtn} <ArrowRight className="w-5 h-5 ml-1" />
                    </PrimaryButton>

                    <div className="mt-6 text-center">
                      <span className="text-slate-400 text-[13px]">{t.noAccount} </span>
                      <button
                        type="button"
                        onClick={() => transition('register')}
                        className="text-green-400 hover:text-green-300 text-[13px] font-bold transition-colors"
                      >
                        {t.registerNow}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ════════════════════════════════
                  FORM ĐĂNG KÝ – animate slide
              ════════════════════════════════ */}
              {activeTab === 'register' && (
                <div className={mainContentClass}>
                  {isVerifyingOtp ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center mb-2 mx-auto border border-green-500/30">
                        <Send className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-white mb-1">{tr('Xác thực mã OTP', 'Verify OTP')}</h3>
                        <p className="text-slate-400 text-[13px] leading-relaxed px-4">
                          {tr('Mã xác thực đã được gửi đến email ', 'Code sent to ')}<br />
                          <strong className="text-white">{email}</strong>
                        </p>
                      </div>
                      <InputField label="Mã OTP" icon={Shield} placeholder={tr('Nhập mã OTP 6 số', 'Enter 6-digit OTP')} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} type="text" />
                      <PrimaryButton loading={loading} loadingText="Xác thực...">
                        Hoàn tất đăng ký <ArrowRight className="w-5 h-5 ml-1" />
                      </PrimaryButton>
                      <button type="button" onClick={() => setIsVerifyingOtp(false)} className="w-full text-center text-slate-400 hover:text-green-400 text-[13px] mt-4 transition-colors">
                        Quay lại điền thông tin
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister}>
                      <InputField label={t.fullNameLabel}  icon={User} placeholder={t.fullNamePlaceholder}  value={fullName}  onChange={(e) => setFullName(e.target.value)} />
                      <InputField label={t.emailLabel}     icon={Mail} type="email" placeholder={t.emailPlaceholder}     value={email}     onChange={(e) => setEmail(e.target.value)} />
                      <InputField label={t.passwordLabel}  icon={Lock} type="password" placeholder={t.passwordPlaceholder}  value={password}  onChange={(e) => setPassword(e.target.value)} withToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} />
                      <InputField
                        label={t.confirmPwLabel}
                        icon={Lock}
                        type="password"
                        placeholder={t.confirmPwPlaceholder}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        withToggle showPw={showConfPw} onToggle={() => setShowConfPw(!showConfPw)}
                        error={error && error === t.pwMismatch}
                      />
                      <PrimaryButton loading={loading} loadingText={t.registering}>
                        {t.registerBtn} <ArrowRight className="w-5 h-5 ml-1" />
                      </PrimaryButton>

                      <div className="mt-6 text-center">
                        <span className="text-slate-400 text-[13px]">{t.haveAccount} </span>
                        <button
                          type="button"
                          onClick={() => transition('login')}
                          className="text-green-400 hover:text-green-300 text-[13px] font-bold transition-colors"
                        >
                          {t.loginLink}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* Highlight viền dưới */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        </div>

        {/* Footer bản quyền – fixed dưới đáy viewport, không ảnh hưởng layout */}
        <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-30">
          <p className="text-slate-500 text-[11px]">© 2026 PNH Football. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
