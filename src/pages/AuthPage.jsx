import React, { useState } from 'react';
import { authApi } from '../services/api';

import {
  Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User, Trophy, Shield, Zap,
  ArrowRight, CheckCircle, Send, ChevronLeft, Star, Check,
} from 'lucide-react';

/* ─── Translations ─── */
const T = {
  vi: {
    heroTitle: 'PNH Football',
    heroTagline: 'Hệ thống quản lý giải đấu\nbóng đá chuyên nghiệp',
    f1Title: 'Quản Lý Toàn Diện',
    f1Desc: 'Lên lịch, xếp hạng và theo dõi kết quả toàn bộ giải đấu',
    f2Title: 'Bảo Mật Tuyệt Đối',
    f2Desc: 'Dữ liệu được mã hóa SSL 256-bit, an toàn tuyệt đối',
    f3Title: 'Trải Nghiệm Mượt Mà',
    f3Desc: 'Giao diện hiện đại, tối ưu cho cả desktop và di động',
    login: 'Đăng Nhập', register: 'Đăng Ký',
    emailPlaceholder: 'Địa chỉ Email',
    passwordPlaceholder: 'Mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    loginBtn: 'Đăng Nhập', loggingIn: 'Đang đăng nhập...',
    noAccount: 'Chưa có tài khoản?', registerNow: 'Đăng ký ngay',
    fullNamePlaceholder: 'Họ và tên đầy đủ',
    confirmPwPlaceholder: 'Xác nhận mật khẩu',
    registerBtn: 'Tạo Tài Khoản', registering: 'Đang tạo...',
    haveAccount: 'Đã có tài khoản?', loginLink: 'Đăng nhập ngay',
    orDivider: 'hoặc tiếp tục với',
    googleBtn: 'Đăng nhập bằng Google',
    forgotTitle: 'Lấy Lại Mật Khẩu',
    forgotDesc: 'Nhập email để nhận link đặt lại mật khẩu',
    forgotEmailPlaceholder: 'Email đã đăng ký',
    sendLink: 'Gửi Link Đặt Lại', sending: 'Đang gửi...',
    sentSuccess: 'Email đã được gửi! Kiểm tra hộp thư của bạn.',
    backToLogin: 'Quay lại đăng nhập',
    wrongCredentials: 'Email hoặc mật khẩu không đúng!',
    pwMismatch: 'Mật khẩu xác nhận không khớp!',
  },
  en: {
    heroTitle: 'PNH Football',
    heroTagline: 'Professional football\ntournament management system',
    f1Title: 'Full Management',
    f1Desc: 'Schedule, rank and track results for the entire tournament',
    f2Title: 'Top Security',
    f2Desc: 'Data encrypted with 256-bit SSL, fully secure',
    f3Title: 'Smooth Experience',
    f3Desc: 'Modern interface, optimized for desktop and mobile',
    login: 'Login', register: 'Register',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'Sign In', loggingIn: 'Signing in...',
    noAccount: "Don't have an account?", registerNow: 'Register now',
    fullNamePlaceholder: 'Full name',
    confirmPwPlaceholder: 'Confirm password',
    registerBtn: 'Create Account', registering: 'Creating...',
    haveAccount: 'Already have an account?', loginLink: 'Sign in now',
    orDivider: 'or continue with',
    googleBtn: 'Sign in with Google',
    forgotTitle: 'Reset Password',
    forgotDesc: 'Enter your email to receive a reset link',
    forgotEmailPlaceholder: 'Registered email',
    sendLink: 'Send Reset Link', sending: 'Sending...',
    sentSuccess: 'Email sent! Check your inbox.',
    backToLogin: 'Back to login',
    wrongCredentials: 'Incorrect email or password!',
    pwMismatch: 'Passwords do not match!',
  },
};

const FEATURES = (t) => [
  { icon: Trophy, title: t.f1Title, desc: t.f1Desc, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { icon: Shield, title: t.f2Title, desc: t.f2Desc, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  { icon: Zap, title: t.f3Title, desc: t.f3Desc, color: 'text-blue-400', bg: 'bg-blue-500/15' },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, withToggle, showPw, onToggle, error }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <input
        type={withToggle ? (showPw ? 'text' : 'password') : type}
        placeholder={placeholder} value={value} onChange={onChange} autoComplete="off"
        className={`w-full pl-11 pr-${withToggle ? '11' : '4'} py-3.5 rounded-xl border text-sm transition-all duration-200
          bg-slate-950/60 border-slate-700 text-white placeholder-slate-500
          focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
          ${error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
      {withToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

export default function AuthPage({ darkMode = true, language = 'vi', onLogin }) {
  const t = T[language] || T.vi;

  const [tab, setTab] = useState('login');
  // Ô email/mật khẩu để trống khi mới mở
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentReset, setSentReset] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => { if (onLogin) onLogin({ email, name: response?.user?.FullName || response?.user?.fullName }); }, 1000);
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
        setSuccess(response.message || 'Mã OTP đã được gửi thành công!');
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
        setSuccess('Đăng ký tài khoản thành công!');
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

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await authApi.externalLogin('Google', 'mock_google_id_token_' + Date.now(), 'mock_google_access_token');
      setLoading(false);
      if (response?.success || response?.token) {
        const token = response?.token || response?.data?.token;
        localStorage.setItem('token', token);
        setSuccess('Đăng nhập bằng Google thành công!');
        // Google login dùng email người dùng đã nhập vào ô (mock)
        setTimeout(() => { if (onLogin) onLogin({ email: email || 'google-user@gmail.com', name: 'Google User' }); }, 1000);
      } else {
        setError(response?.message || 'Đăng nhập Google thất bại');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đăng nhập bằng Google thất bại.');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSentReset(true); }, 1200);
  };

  const switchTab = (newTab) => {
    setTab(newTab); clearMessages(); setSentReset(false);
  };

  const features = FEATURES(t);

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[35%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="PNH" className="w-12 h-12 rounded-2xl object-cover shadow-xl shadow-emerald-500/30"
            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 items-center justify-center shadow-xl shadow-emerald-500/30" style={{ display:'none' }}>
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-wider">{t.heroTitle}</p>
            <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Platform v2.0</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              {t.heroTagline.split('\n').map((line, i) => (
                <span key={i} className={i === 0 ? 'block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent' : 'block text-white mt-1'}>
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-start gap-4 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {[['500+', language === 'vi' ? 'Giải Đấu' : 'Tournaments'], ['12K+', language === 'vi' ? 'Đội Bóng' : 'Teams'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{val}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.webp" alt="PNH" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-emerald-500/30"
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 items-center justify-center shadow-lg shadow-emerald-500/30" style={{ display:'none' }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-white font-black text-xl tracking-wider">{t.heroTitle}</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            {tab === 'forgot' ? (
              <div>
                <button onClick={() => switchTab('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                  <ChevronLeft className="w-4 h-4" />{t.backToLogin}
                </button>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-black text-white mb-1">{t.forgotTitle}</h2>
                <p className="text-slate-400 text-sm mb-6">{t.forgotDesc}</p>

                {sentReset ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold">{t.sentSuccess}</p>
                    <button onClick={() => switchTab('login')} className="mt-6 text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1.5">
                      <ChevronLeft className="w-4 h-4" /> {t.backToLogin}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <InputField icon={Mail} type="email" placeholder={t.forgotEmailPlaceholder} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.sending}</> : <><Send className="w-4 h-4" /> {t.sendLink}</>}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="flex bg-slate-950/60 rounded-2xl p-1 mb-6 border border-slate-800">
                  {['login', 'register'].map((tabId) => (
                    <button key={tabId} onClick={() => switchTab(tabId)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === tabId ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>
                      {tabId === 'login'
                        ? <span className="flex items-center justify-center gap-1.5"><LogIn className="w-3.5 h-3.5" />{t.login}</span>
                        : <span className="flex items-center justify-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />{t.register}</span>}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700 bg-white/95 hover:bg-white text-slate-800 font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm">
                    <GoogleIcon />{t.googleBtn}
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-slate-700/60" />
                  <span className="text-slate-500 text-xs font-medium">{t.orDivider}</span>
                  <div className="flex-1 h-px bg-slate-700/60" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black">!</span>
                    </div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-400 text-sm">{success}</p>
                  </div>
                )}

                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <InputField icon={Mail} type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField icon={Lock} type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} withToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => setRememberMe(!rememberMe)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-slate-400'}`}>
                          {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{t.rememberMe}</span>
                      </label>
                      <button type="button" onClick={() => switchTab('forgot')} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        {t.forgotPassword}
                      </button>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-2">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.loggingIn}</> : <><LogIn className="w-4 h-4" /> {t.loginBtn} <ArrowRight className="w-4 h-4" /></>}
                    </button>
                    <p className="text-center text-slate-400 text-sm">
                      {t.noAccount}{' '}
                      <button type="button" onClick={() => switchTab('register')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">{t.registerNow}</button>
                    </p>
                  </form>
                )}

                {tab === 'register' && (
                  isVerifyingOtp ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-2 mx-auto">
                        <Send className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-center mb-4">
                        <h3 className="text-md font-bold text-white">Xác thực mã OTP</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          Mã xác thực gồm 6 chữ số đã được gửi đến <strong>{email}</strong>. Vui lòng nhập để kích hoạt tài khoản (Mã test là <strong className="text-emerald-400 font-mono">123456</strong>).
                        </p>
                      </div>
                      <InputField icon={Shield} placeholder="Nhập mã OTP 6 số" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} type="text" />
                      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Xác thực...</> : <>Hoàn tất đăng ký</>}
                      </button>
                      <button type="button" onClick={() => setIsVerifyingOtp(false)} className="w-full text-center text-slate-400 hover:text-white text-xs mt-2 transition-colors block">
                        Quay lại điền thông tin
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                      <InputField icon={User} placeholder={t.fullNamePlaceholder} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <InputField icon={Mail} type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                      <InputField icon={Lock} type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} withToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} />
                      <InputField icon={Lock} type="password" placeholder={t.confirmPwPlaceholder} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} withToggle showPw={showConfPw} onToggle={() => setShowConfPw(!showConfPw)} error={error && error === t.pwMismatch} />
                      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-1">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.registering}</> : <><UserPlus className="w-4 h-4" /> {t.registerBtn}</>}
                      </button>
                      <p className="text-center text-slate-400 text-sm">
                        {t.haveAccount}{' '}
                        <button type="button" onClick={() => switchTab('login')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">{t.loginLink}</button>
                      </p>
                    </form>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}