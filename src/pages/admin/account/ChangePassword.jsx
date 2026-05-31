import { useState } from 'react';
import {
  Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
  XCircle, Loader2, KeyRound, AlertCircle
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Đổi Mật Khẩu',
    subtitle: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    currentPlaceholder: 'Nhập mật khẩu hiện tại',
    newPlaceholder: 'Nhập mật khẩu mới',
    confirmPlaceholder: 'Nhập lại mật khẩu mới',
    strength: 'Độ mạnh mật khẩu',
    weak: 'Yếu',
    medium: 'Trung bình',
    strong: 'Mạnh',
    securityTips: 'Yêu cầu mật khẩu',
    tip1: 'Ít nhất 8 ký tự',
    tip2: 'Chứa chữ hoa (A-Z)',
    tip3: 'Chứa số (0-9)',
    tip4: 'Chứa ký tự đặc biệt (!@#$...)',
    submit: 'Cập nhật mật khẩu',
    submitting: 'Đang cập nhật...',
    successMsg: 'Đổi mật khẩu thành công!',
    errorMsg: 'Có lỗi xảy ra. Vui lòng kiểm tra lại.',
    mismatch: 'Mật khẩu xác nhận không khớp!',
  },
  en: {
    title: 'Change Password',
    subtitle: 'Update your password to keep your account secure',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    currentPlaceholder: 'Enter current password',
    newPlaceholder: 'Enter new password',
    confirmPlaceholder: 'Re-enter new password',
    strength: 'Password Strength',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    securityTips: 'Password Requirements',
    tip1: 'At least 8 characters',
    tip2: 'Contains uppercase letter (A-Z)',
    tip3: 'Contains number (0-9)',
    tip4: 'Contains special character (!@#$...)',
    submit: 'Update Password',
    submitting: 'Updating...',
    successMsg: 'Password changed successfully!',
    errorMsg: 'An error occurred. Please try again.',
    mismatch: 'Passwords do not match!',
  }
};

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function ChangePassword({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [fields, setFields] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [submitState, setSubmitState] = useState('idle');
  const [toast, setToast] = useState(null);

  const strength = getStrength(fields.newPwd);
  const checks = [
    { label: t.tip1, pass: fields.newPwd.length >= 8 },
    { label: t.tip2, pass: /[A-Z]/.test(fields.newPwd) },
    { label: t.tip3, pass: /[0-9]/.test(fields.newPwd) },
    { label: t.tip4, pass: /[^A-Za-z0-9]/.test(fields.newPwd) },
  ];

  const strengthLabel = strength <= 1 ? t.weak : strength <= 2 ? t.medium : t.strong;
  const strengthColor = strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthTextColor = strength <= 1 ? 'text-red-400' : strength <= 2 ? 'text-amber-400' : 'text-emerald-400';

  const handleSubmit = async () => {
    if (fields.newPwd !== fields.confirm) {
      setToast({ type: 'error', msg: t.mismatch });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSubmitState('submitting');
    try {
      const res = await fetch('https://localhost:7051/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: fields.current, newPassword: fields.newPwd }),
      });
      if (!res.ok) throw new Error();
      setSubmitState('done');
      setToast({ type: 'success', msg: t.successMsg });
      setFields({ current: '', newPwd: '', confirm: '' });
    } catch {
      setSubmitState('error');
      setToast({ type: 'error', msg: t.errorMsg });
    } finally {
      setTimeout(() => { setSubmitState('idle'); setToast(null); }, 3000);
    }
  };

  const inputWrap = `relative w-full`;
  const inputCls = `w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500/50
    ${dm
      ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'}`;
  const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`;

  const PasswordField = ({ id, label, placeholder }) => (
    <div>
      <label className={labelCls}><Lock className="w-3 h-3 inline mr-1" />{label}</label>
      <div className={inputWrap}>
        <input
          type={show[id] ? 'text' : 'password'}
          className={inputCls}
          value={fields[id]}
          onChange={e => setFields(f => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [id]: !s[id] }))}
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {show[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold
          ${toast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
          <KeyRound className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
        {/* Main Form Card */}
        <div className={`rounded-2xl border p-6
          ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="space-y-5">
            <PasswordField id="current" label={t.currentPassword} placeholder={t.currentPlaceholder} />
            <PasswordField id="newPwd" label={t.newPassword} placeholder={t.newPlaceholder} />

            {/* Strength Indicator */}
            {fields.newPwd.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.strength}
                  </span>
                  <span className={`text-xs font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <PasswordField id="confirm" label={t.confirmPassword} placeholder={t.confirmPlaceholder} />

            {/* Confirm mismatch visual */}
            {fields.confirm.length > 0 && fields.newPwd !== fields.confirm && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {t.mismatch}
              </p>
            )}
            {fields.confirm.length > 0 && fields.newPwd === fields.confirm && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'vi' ? 'Mật khẩu khớp!' : 'Passwords match!'}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className={`my-6 border-t ${dm ? 'border-slate-700/50' : 'border-slate-200'}`} />

          <button
            onClick={handleSubmit}
            disabled={submitState === 'submitting' || !fields.current || !fields.newPwd || !fields.confirm}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white
              bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
          >
            {submitState === 'submitting'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.submitting}</>
              : <><ShieldCheck className="w-4 h-4" /> {t.submit}</>
            }
          </button>
        </div>

        {/* Security Tips Card */}
        <div className={`rounded-2xl border p-5
          ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{t.securityTips}</h3>
          </div>
          <div className="space-y-3">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                {c.pass
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <XCircle className={`w-4 h-4 flex-shrink-0 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
                }
                <span className={`text-sm font-medium ${c.pass
                  ? 'text-emerald-400'
                  : dm ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
