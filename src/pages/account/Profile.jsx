import React, { useState } from 'react';
import { User, Save, Camera, Trophy, Star, Edit3 } from 'lucide-react';

const Profile = ({ darkMode, language }) => {
  const dm = darkMode;
  const [form, setForm] = useState({ name: 'Phạm Ngọc Hùng', email: 'admin@pnhfootball.com', phone: '0901234567', bio: 'Quản lý giải đấu football chuyên nghiệp.', website: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const input = dm ? 'bg-white/8 border-white/12 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/12' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500';
  const label = dm ? 'text-slate-400' : 'text-slate-600';

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{language === 'vi' ? 'Hồ Sơ Cá Nhân' : 'My Profile'}</h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{language === 'vi' ? 'Quản lý thông tin tài khoản' : 'Manage your account info'}</p>
        </div>
      </div>

      {/* Avatar */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-500/20">
              P
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{form.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Star size={8} /> ADMIN
              </span>
              <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>5 giải đấu · 24 đội</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={`rounded-2xl border p-6 space-y-4 ${card}`}>
        {[
          { key: 'name',    label: 'Họ và tên',     type: 'text',  ph: 'Nhập tên...' },
          { key: 'email',   label: 'Email',          type: 'email', ph: 'email@example.com' },
          { key: 'phone',   label: 'Số điện thoại', type: 'tel',   ph: '09xxxxxxxx' },
          { key: 'website', label: 'Website',        type: 'url',   ph: 'https://...' },
        ].map(f => (
          <div key={f.key}>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.ph}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
          </div>
        ))}
        <div>
          <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>Bio</label>
          <textarea rows={3} value={form.bio} placeholder="Giới thiệu bản thân..."
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${input}`} />
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
