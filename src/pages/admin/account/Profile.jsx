import React, { useState } from 'react';
import { User, Camera, Crown, Save, Trophy, Users, Swords, Phone, Globe, MapPin, Edit3, Loader } from 'lucide-react';

const T = {
  vi: {
    title: 'Hồ Sơ Cá Nhân', adminBadge: 'Quản Trị Viên',
    fullName: 'Họ và Tên', bio: 'Giới Thiệu / Bio', phone: 'Số Điện Thoại',
    address: 'Địa Chỉ', website: 'Website',
    saveBtn: 'Lưu Thay Đổi', saving: 'Đang lưu...', saved: 'Đã lưu!',
    statsTitle: 'Thống Kê',
    s1: 'Giải Đấu Tạo', s2: 'Đội Quản Lý', s3: 'Trận Đấu',
    uploadAvatar: 'Thay ảnh đại diện',
    changePic: 'Thay Đổi',
  },
  en: {
    title: 'My Profile', adminBadge: 'Administrator',
    fullName: 'Full Name', bio: 'Bio / Introduction', phone: 'Phone Number',
    address: 'Address', website: 'Website',
    saveBtn: 'Save Changes', saving: 'Saving...', saved: 'Saved!',
    statsTitle: 'Statistics',
    s1: 'Tournaments', s2: 'Teams', s3: 'Matches',
    uploadAvatar: 'Upload avatar',
    changePic: 'Change',
  },
};

const Profile = ({ darkMode = true, language = 'vi' }) => {
  const t = T[language] || T.vi;
  const dm = darkMode;
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [form, setForm] = useState({
    fullName: 'Phạm Ngọc Hùng', bio: 'Admin hệ thống quản lý giải đấu PNH Football E-sports.',
    phone: '0901234567', address: 'TP. Hồ Chí Minh, Việt Nam', website: 'pnhfootball.com',
  });

  const card = `rounded-2xl p-6 border ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp  = `w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 ${dm ? 'bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'}`;
  const lbl  = `block text-xs font-bold mb-2 uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('https://localhost:7051/api/users/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch { /* offline ok */ }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = [
    { icon: Trophy, value: '5', label: t.s1, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Users,  value: '24', label: t.s2, color: 'text-cyan-400',  bg: 'bg-cyan-500/10' },
    { icon: Swords, value: '156', label: t.s3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar + Stats */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className={`${card} text-center`}>
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-500/30 mx-auto">
                P
              </div>
              <button className={`absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500' : 'bg-white border-slate-300 text-slate-600 hover:border-emerald-400'}`}>
                <Camera size={15} />
              </button>
            </div>
            <h2 className={`font-black text-lg ${dm ? 'text-white' : 'text-slate-900'}`}>{form.fullName}</h2>
            <p className={`text-sm mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>admin@pnhfootball.com</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Crown size={13} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{t.adminBadge}</span>
            </div>
          </div>

          {/* Stats */}
          <div className={card}>
            <h3 className={`text-sm font-bold mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.statsTitle}</h3>
            <div className="space-y-3">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <Icon size={16} className={s.color} />
                    </div>
                    <div>
                      <p className={`text-lg font-black leading-none ${dm ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
                      <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className={card}>
            <h3 className={`text-base font-black mb-5 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
              <Edit3 size={18} className="text-emerald-400" />
              {t.title}
            </h3>
            <div className="space-y-5">
              <div>
                <label className={lbl}>{t.fullName}</label>
                <input value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} className={inp} />
              </div>
              <div>
                <label className={lbl}>{t.bio}</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={3} className={`${inp} resize-none`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}><Phone size={11} className="inline mr-1" />{t.phone}</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className={inp} />
                </div>
                <div>
                  <label className={lbl}><Globe size={11} className="inline mr-1" />{t.website}</label>
                  <input value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}><MapPin size={11} className="inline mr-1" />{t.address}</label>
                <input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className={inp} />
              </div>
              <button type="submit" disabled={saving}
                className={`w-full flex items-center justify-center gap-2 font-black py-3.5 rounded-xl transition-all ${
                  saved ? 'bg-emerald-600 text-white' :
                  saving ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
                  'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}>
                {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? t.saving : saved ? t.saved : t.saveBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
