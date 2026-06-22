import { useState } from 'react';
import {
  Trash2, AlertTriangle, Mail, CheckSquare, Square,
  XCircle, ShieldAlert, ChevronRight, Loader2, X
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Xóa Tài Khoản',
    subtitle: 'Hành động này không thể hoàn tác',
    warningTitle: 'Cảnh báo nghiêm trọng!',
    warningDesc: 'Bạn sắp xóa tài khoản quản trị viên của mình. Đây là hành động KHÔNG THỂ HOÀN TÁC.',
    consequencesTitle: 'Những gì sẽ xảy ra khi bạn xóa tài khoản:',
    consequences: [
      'Tất cả dữ liệu cá nhân sẽ bị xóa vĩnh viễn',
      'Tất cả các giải đấu bạn tạo sẽ không còn quản lý được',
      'Lịch sử hoạt động và báo cáo sẽ bị xóa hoàn toàn',
      'Quyền truy cập hệ thống bị thu hồi ngay lập tức',
      'Bạn không thể đăng nhập lại với tài khoản này',
    ],
    confirmLabel: 'Xác nhận bằng email',
    confirmPlaceholder: 'Nhập địa chỉ email của bạn để xác nhận',
    checkboxLabel: 'Tôi hiểu rằng hành động này không thể hoàn tác',
    deleteBtn: 'Xóa tài khoản vĩnh viễn',
    deleting: 'Đang xóa...',
    cancelBtn: 'Hủy bỏ',
    errorEmail: 'Email không khớp với tài khoản của bạn!',
    confirmDialog: 'Bạn có chắc chắn muốn xóa tài khoản không?',
    confirmYes: 'Có, xóa tài khoản',
    confirmNo: 'Không, giữ lại',
    emailHint: 'Nhập email: admin@pnhfootball.vn',
  },
  en: {
    title: 'Delete Account',
    subtitle: 'This action cannot be undone',
    warningTitle: 'Serious Warning!',
    warningDesc: 'You are about to delete your administrator account. This action is IRREVERSIBLE.',
    consequencesTitle: 'What will happen when you delete your account:',
    consequences: [
      'All personal data will be permanently deleted',
      'All tournaments you created will lose management access',
      'Activity history and reports will be completely deleted',
      'System access will be revoked immediately',
      'You will not be able to log in with this account again',
    ],
    confirmLabel: 'Confirm with email',
    confirmPlaceholder: 'Enter your email address to confirm',
    checkboxLabel: 'I understand that this action cannot be undone',
    deleteBtn: 'Permanently Delete Account',
    deleting: 'Deleting...',
    cancelBtn: 'Cancel',
    errorEmail: 'Email does not match your account!',
    confirmDialog: 'Are you sure you want to delete your account?',
    confirmYes: 'Yes, delete account',
    confirmNo: 'No, keep it',
    emailHint: 'Enter email: admin@pnhfootball.vn',
  }
};

const ADMIN_EMAIL = 'admin@pnhfootball.vn';

export default function DeleteAccount({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailValid = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const canDelete = checked && emailValid;

  const handleDelete = () => {
    if (!emailValid) {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 3000);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    setDeleting(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      // await fetch('https://localhost:7051/api/users/delete', { method: 'DELETE' });
      alert(language === 'vi' ? 'Tài khoản đã được xóa (demo).' : 'Account deleted (demo).');
    } catch {
      alert(language === 'vi' ? 'Có lỗi xảy ra.' : 'An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2
    ${emailError
      ? 'border-red-500 focus:ring-red-500/30 ' + (dm ? 'bg-red-950/30 text-red-300' : 'bg-red-50 text-red-700')
      : dm
        ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500/30'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:ring-red-500/30'
    }`;

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`relative max-w-sm w-full rounded-2xl border p-6 shadow-2xl
            ${dm ? 'bg-slate-900 border-red-500/30' : 'bg-white border-red-200 shadow-red-100'}`}>
            <button
              onClick={() => setShowConfirm(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{t.confirmDialog}</h3>
                <p className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  {language === 'vi' ? 'Email: ' : 'Email: '}<strong className="text-red-400">{email}</strong>
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all
                    ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                  {t.confirmNo}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20"
                >
                  {t.confirmYes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Warning Banner */}
        <div className={`rounded-2xl border-2 p-5 flex items-start gap-4
          ${dm
            ? 'bg-red-950/30 border-red-500/40'
            : 'bg-red-50 border-red-300'}`}>
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className={`text-sm font-black mb-1 ${dm ? 'text-red-300' : 'text-red-700'}`}>
              ⚠️ {t.warningTitle}
            </h2>
            <p className={`text-sm leading-relaxed ${dm ? 'text-red-400/80' : 'text-red-600'}`}>
              {t.warningDesc}
            </p>
          </div>
        </div>

        {/* Consequences Card */}
        <div className={`rounded-2xl border p-5
          ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-800'}`}>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {t.consequencesTitle}
          </h3>
          <div className="space-y-3">
            {t.consequences.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Form Card */}
        <div className={`rounded-2xl border p-5 space-y-5
          ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          {/* Email field */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              <Mail className="w-3 h-3 inline mr-1" />{t.confirmLabel}
            </label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(false); }}
              placeholder={t.confirmPlaceholder}
            />
            <p className={`text-xs mt-1.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
              {t.emailHint}
            </p>
            {emailError && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {t.errorEmail}
              </p>
            )}
            {emailValid && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <span>✓</span> {language === 'vi' ? 'Email hợp lệ' : 'Valid email'}
              </p>
            )}
          </div>

          {/* Checkbox */}
          <div>
            <button
              onClick={() => setChecked(c => !c)}
              className="flex items-start gap-3 group w-full text-left"
            >
              <div className="flex-shrink-0 mt-0.5">
                {checked
                  ? <CheckSquare className="w-5 h-5 text-red-400" />
                  : <Square className={`w-5 h-5 ${dm ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
                }
              </div>
              <span className={`text-sm font-medium leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.checkboxLabel}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className={`border-t ${dm ? 'border-slate-700/50' : 'border-slate-200'}`} />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all
                ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> {t.cancelBtn}
            </button>

            <button
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all
                ${canDelete && !deleting
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20 cursor-pointer'
                  : 'bg-gradient-to-r from-red-900/40 to-rose-900/40 cursor-not-allowed opacity-50'
                }`}
            >
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.deleting}</>
                : <><Trash2 className="w-4 h-4" /> {t.deleteBtn}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
