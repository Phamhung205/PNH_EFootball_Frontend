import { useState } from 'react';
import { Bell, Mail, Save, CheckCircle2, Loader2, Smartphone, AlertCircle } from 'lucide-react';

const translations = {
  vi: {
    title: 'Cài Đặt Thông Báo',
    subtitle: 'Tùy chỉnh cách bạn nhận thông báo',
    pushSection: 'Thông Báo Đẩy (Push)',
    emailSection: 'Thông Báo Email',
    saveBtn: 'Lưu cài đặt',
    saving: 'Đang lưu...',
    saved: 'Đã lưu!',
    successMsg: 'Cài đặt thông báo đã được lưu!',
    errorMsg: 'Có lỗi xảy ra. Vui lòng thử lại.',
    push: [
      { key: 'matchResult', label: 'Kết quả trận đấu', desc: 'Nhận thông báo ngay khi có kết quả trận đấu mới' },
      { key: 'schedule', label: 'Lịch thi đấu mới', desc: 'Thông báo khi có lịch thi đấu được cập nhật' },
      { key: 'system', label: 'Thông báo hệ thống', desc: 'Cập nhật quan trọng từ hệ thống PNH Football' },
    ],
    email: [
      { key: 'emailResult', label: 'Email khi có kết quả', desc: 'Gửi email tổng hợp kết quả sau mỗi trận' },
      { key: 'emailReminder', label: 'Email nhắc nhở lịch', desc: 'Nhắc nhở qua email trước mỗi trận 1 tiếng' },
    ],
  },
  en: {
    title: 'Notification Settings',
    subtitle: 'Customize how you receive notifications',
    pushSection: 'Push Notifications',
    emailSection: 'Email Notifications',
    saveBtn: 'Save Preferences',
    saving: 'Saving...',
    saved: 'Saved!',
    successMsg: 'Notification settings saved!',
    errorMsg: 'An error occurred. Please try again.',
    push: [
      { key: 'matchResult', label: 'Match Results', desc: 'Get notified immediately when match results are available' },
      { key: 'schedule', label: 'New Schedule', desc: 'Notifications when match schedules are updated' },
      { key: 'system', label: 'System Notifications', desc: 'Important updates from PNH Football system' },
    ],
    email: [
      { key: 'emailResult', label: 'Email on Results', desc: 'Receive a summary email after each match' },
      { key: 'emailReminder', label: 'Schedule Reminders', desc: 'Email reminder 1 hour before each match' },
    ],
  }
};

function Toggle({ enabled, onChange, dm }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex-shrink-0
        ${enabled
          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
          : dm ? 'bg-slate-700' : 'bg-slate-300'
        }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-300
        ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function NotifSettings({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [prefs, setPrefs] = useState({
    matchResult: true,
    schedule: true,
    system: false,
    emailResult: true,
    emailReminder: false,
  });
  const [saveState, setSaveState] = useState('idle');
  const [toast, setToast] = useState(null);

  const togglePref = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await new Promise(r => setTimeout(r, 1200)); // Simulate API
      setSaveState('saved');
      setToast({ type: 'success', msg: t.successMsg });
    } catch {
      setSaveState('error');
      setToast({ type: 'error', msg: t.errorMsg });
    } finally {
      setTimeout(() => { setSaveState('idle'); setToast(null); }, 3000);
    }
  };

  const cardCls = `rounded-2xl border p-6 ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;
  const dividerCls = `border-t ${dm ? 'border-slate-700/50' : 'border-slate-200'}`;

  const NotifRow = ({ item }) => (
    <div className={`flex items-center justify-between gap-4 py-4 border-b last:border-b-0 ${dividerCls}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-800'}`}>{item.label}</p>
        <p className={`text-xs mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
      </div>
      <Toggle enabled={prefs[item.key]} onChange={() => togglePref(item.key)} dm={dm} />
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
          <Bell className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Overview Banner */}
        <div className={`rounded-xl p-4 flex items-center gap-3 border
          ${dm ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <p className={`text-sm ${dm ? 'text-emerald-300' : 'text-emerald-700'}`}>
            {language === 'vi'
              ? 'Bạn đang bật 3/5 thông báo. Tùy chỉnh bên dưới để phù hợp với nhu cầu của bạn.'
              : 'You have 3/5 notifications enabled. Customize below to fit your needs.'}
          </p>
        </div>

        {/* Push Notifications */}
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h2 className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{t.pushSection}</h2>
          </div>
          <p className={`text-xs mb-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'vi' ? 'Thông báo trực tiếp trên trình duyệt hoặc thiết bị di động' : 'Direct notifications on browser or mobile device'}
          </p>
          <div>
            {t.push.map(item => <NotifRow key={item.key} item={item} />)}
          </div>
        </div>

        {/* Email Notifications */}
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-emerald-400" />
            <h2 className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{t.emailSection}</h2>
          </div>
          <p className={`text-xs mb-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'vi' ? 'Nhận thông báo qua địa chỉ email đã đăng ký' : 'Receive notifications at your registered email address'}
          </p>
          <div>
            {t.email.map(item => <NotifRow key={item.key} item={item} />)}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white
              bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600
              disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
          >
            {saveState === 'saving'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
              : saveState === 'saved'
                ? <><CheckCircle2 className="w-4 h-4" /> {t.saved}</>
                : <><Save className="w-4 h-4" /> {t.saveBtn}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
