import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

const ChangePassword = ({ darkMode, language }) => {
  const dm = darkMode;
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const card  = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const input = dm ? 'bg-white/8 border-white/12 text-white placeholder-slate-500 focus:border-emerald-500/50' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500';
  const label = dm ? 'text-slate-400' : 'text-slate-600';

  const strength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  };
  const pwdStrength = strength(form.newPwd);
  const strengthLabel = ['', 'Yếu', 'Trung Bình', 'Mạnh', 'Rất Mạnh'][pwdStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-cyan-500'][pwdStrength];

  const handleSave = async () => {
    setError('');
    if (!form.current) return setError('Nhập mật khẩu hiện tại');
    if (form.newPwd.length < 6) return setError('Mật khẩu mới ít nhất 6 ký tự');
    if (form.newPwd !== form.confirm) return setError('Mật khẩu không khớp');
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true); setForm({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ k, lbl, ph }) => (
    <div>
      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>{lbl}</label>
      <div className="relative">
        <input type={show[k] ? 'text' : 'password'} value={form[k]} placeholder={ph}
          onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
          className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-all ${input}`} />
        <button type="button" onClick={() => setShow(p => ({ ...p, [k]: !p[k] }))}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
          {show[k] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <KeyRound size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Đổi Mật Khẩu</h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Cập nhật mật khẩu bảo mật</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 space-y-4 ${card}`}>
        <Field k="current" lbl="Mật Khẩu Hiện Tại" ph="••••••••" />
        <Field k="newPwd"  lbl="Mật Khẩu Mới"      ph="Ít nhất 6 ký tự" />

        {/* Strength bar */}
        {form.newPwd && (
          <div>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= pwdStrength ? strengthColor : dm ? 'bg-white/10' : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className={`text-xs font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{strengthLabel}</p>
          </div>
        )}

        <Field k="confirm" lbl="Xác Nhận Mật Khẩu" ph="Nhập lại mật khẩu mới" />

        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

        {/* Tips */}
        <div className={`rounded-xl p-3 border ${dm ? 'bg-white/4 border-white/8' : 'bg-slate-50 border-slate-200'}`}>
          <p className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${dm ? 'text-slate-300' : 'text-slate-700'}`}><Shield size={12} /> Gợi ý bảo mật</p>
          {['Ít nhất 8 ký tự', 'Có chữ hoa', 'Có số', 'Có ký tự đặc biệt'].map((tip, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
              <CheckCircle2 size={11} className={i < pwdStrength ? 'text-emerald-400' : 'opacity-30'} />
              {tip}
            </div>
          ))}
        </div>

        <button onClick={handleSave}
          className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'}`}>
          {saving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : saved ? <><CheckCircle2 size={16} /> Đã đổi mật khẩu!</>
            : 'Đổi Mật Khẩu'}
        </button>
      </div>
    </div>
  );
};
export default ChangePassword;
