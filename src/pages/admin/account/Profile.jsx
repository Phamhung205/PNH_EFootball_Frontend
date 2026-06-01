import React, { useState, useEffect } from 'react';
import { User, Save, Camera, Trophy, Crown } from 'lucide-react';

const Profile = ({ darkMode, language }) => {
  const dm = darkMode;

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setCurrentUser(u);
    } catch { /* */ }
  }, []);

  const ADMIN_EMAILS = ['admin@pnhfootball.com', 'admin@gmail.com'];
  const userEmail = (currentUser?.email || '').toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', website: '' });

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || (isAdmin ? 'Quản trị viên' : 'Thành viên'),
        email: currentUser.email || '',
        phone: '',
        bio: isAdmin ? 'Quản lý giải đấu football chuyên nghiệp.' : 'Thành viên hệ thống PNH Football.',
        website: '',
      });
    }
  }, [currentUser, isAdmin]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const label = dm ? 'text-slate-400' : 'text-slate-600';

  const handleSave = async () => {
    setSaving(true);
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: form.name }));
    }
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initial = (form.name || userEmail || '?').trim().charAt(0).toUpperCase();

  const fields = [
    { key: 'name', label: 'Họ và tên', type: 'text', ph: 'Nhập tên...' },
    { key: 'email', label: 'Email', type: 'email', ph: 'email@example.com' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', ph: '09xxxxxxxx' },
    { key: 'website', label: 'Website', type: 'url', ph: 'https://...' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <style>{`
        .pf-input {
          background-color: #0f172a !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #10b981 !important;
          border-color: #334155 !important;
        }
        .pf-input::placeholder { color: #64748b !important; }
        .pf-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16,185,129,.2) !important;
        }
        .pf-input:-webkit-autofill,
        .pf-input:-webkit-autofill:hover,
        .pf-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{language === 'vi' ? 'Hồ Sơ Cá Nhân' : 'My Profile'}</h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{language === 'vi' ? 'Quản lý thông tin tài khoản' : 'Manage your account info'}</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-500/20">
              {initial}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{form.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown size={9} /> ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <User size={9} /> THÀNH VIÊN
                </span>
              )}
              <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAdmin ? '5 giải đấu · 24 đội' : 'Người dùng mới'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 space-y-4 ${card}`}>
        {fields.map(f => (
          <div key={f.key}>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.ph}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="pf-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all" />
          </div>
        ))}
        <div>
          <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>Bio</label>
          <textarea rows={3} value={form.bio} placeholder="Giới thiệu bản thân..."
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className="pf-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none" />
        </div>
        <button onClick={handleSave}
          className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20'}`}>
          {saving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : saved ? <><Trophy size={16} /> Đã lưu!</>
            : <><Save size={16} /> {language === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes'}</>}
        </button>
      </div>
    </div>
  );
};
export default Profile;