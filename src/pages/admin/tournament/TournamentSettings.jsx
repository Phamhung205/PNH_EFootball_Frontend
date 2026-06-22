import React, { useState } from 'react';
import { Settings2, Trophy, Calendar, Users, Eye, EyeOff, Copy, Save, CheckCircle2, Loader, Globe2, Lock } from 'lucide-react';

const T = {
  vi: {
    title: 'Cài Đặt Giải Đấu', saved: 'Đã lưu!', saving: 'Đang lưu...',
    basicInfo: 'Thông Tin Cơ Bản', tName: 'Tên Giải Đấu', tLogo: 'Logo URL', tDesc: 'Mô Tả',
    tNamePh: 'VD: PNH Super League Mùa 1', tLogoPh: 'https://...', tDescPh: 'Nhập mô tả giải đấu...',
    formatTitle: 'Thể Thức Thi Đấu',
    f1: 'Vòng Tròn', f1s: 'Mỗi đội đấu với nhau một lượt, tính điểm.', 
    f2: 'Loại Trực Tiếp', f2s: 'Thua là bị loại ngay, vào vòng sau.',
    f3: 'Bảng + Knockout', f3s: 'Vòng bảng rồi đấu loại trực tiếp.',
    season: 'Cài Đặt Mùa Giải', year: 'Năm Mùa Giải', startDate: 'Ngày Bắt Đầu', endDate: 'Ngày Kết Thúc',
    options: 'Tùy Chỉnh',
    publicLabel: 'Giải Đấu Công Khai', publicDesc: 'Cho phép mọi người xem giải đấu này.',
    multiLegLabel: 'Giải Đấu Nhiều Lượt', multiLegDesc: 'Lượt đi và lượt về.',
    addTimeLabel: 'Cho Phép Bù Giờ', addTimeDesc: 'Thêm giờ khi kết quả hòa.',
    extraTimeLabel: 'Hiệp Phụ', extraTimeDesc: 'Đấu thêm 2 hiệp phụ nếu cần.',
    penaltyLabel: 'Penalty', penaltyDesc: 'Đá penalty khi hết hiệp phụ.',
    clone: 'Nhân Bản Mùa Trước', save: 'Lưu Cài Đặt',
  },
  en: {
    title: 'Tournament Settings', saved: 'Saved!', saving: 'Saving...',
    basicInfo: 'Basic Information', tName: 'Tournament Name', tLogo: 'Logo URL', tDesc: 'Description',
    tNamePh: 'E.g: PNH Super League Season 1', tLogoPh: 'https://...', tDescPh: 'Enter tournament description...',
    formatTitle: 'Tournament Format',
    f1: 'League', f1s: 'All teams play each other, points system.',
    f2: 'Knockout', f2s: 'Lose and you are eliminated immediately.',
    f3: 'Group + Knockout', f3s: 'Group stage followed by knockout rounds.',
    season: 'Season Settings', year: 'Season Year', startDate: 'Start Date', endDate: 'End Date',
    options: 'Options',
    publicLabel: 'Public Tournament', publicDesc: 'Allow anyone to view this tournament.',
    multiLegLabel: 'Multi-Leg', multiLegDesc: 'Home and away fixtures.',
    addTimeLabel: 'Allow Added Time', addTimeDesc: 'Add time at end of match.',
    extraTimeLabel: 'Extra Time', extraTimeDesc: 'Play extra time if draw.',
    penaltyLabel: 'Penalty Shootout', penaltyDesc: 'Penalties after extra time.',
    clone: 'Clone from Last Season', save: 'Save Settings',
  },
};

const ToggleSwitch = ({ checked, onChange, dm }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${checked ? 'bg-emerald-500' : dm ? 'bg-slate-700' : 'bg-slate-300'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const TournamentSettings = ({ darkMode = true, language = 'vi' }) => {
  const t = T[language] || T.vi;
  const dm = darkMode;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'PNH Super League', logo: '', description: '',
    format: 'League', year: '2025', startDate: '', endDate: '',
    isPublic: true, multiLeg: false, addTime: true, extraTime: true, penalty: true,
  });

  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  const card = `rounded-2xl border ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp = `w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 ${dm ? 'bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'}`;
  const lbl = `block text-xs font-bold mb-2 uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`;

  const formats = [
    { id:'League',              icon:'🏆', name: t.f1, desc: t.f1s, color: 'emerald' },
    { id:'Knockout',            icon:'⚡', name: t.f2, desc: t.f2s, color: 'orange' },
    { id:'GroupStage_Knockout', icon:'🏅', name: t.f3, desc: t.f3s, color: 'purple' },
  ];

  const opts = [
    { k:'isPublic', icon: Globe2,   label: t.publicLabel, desc: t.publicDesc, color:'text-emerald-400' },
    { k:'multiLeg', icon: Copy,     label: t.multiLegLabel, desc: t.multiLegDesc, color:'text-cyan-400' },
    { k:'addTime',  icon: Calendar, label: t.addTimeLabel, desc: t.addTimeDesc, color:'text-yellow-400' },
    { k:'extraTime',icon: Settings2,label: t.extraTimeLabel, desc: t.extraTimeDesc, color:'text-purple-400' },
    { k:'penalty',  icon: Trophy,   label: t.penaltyLabel, desc: t.penaltyDesc, color:'text-red-400' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('https://localhost:7051/api/tournaments/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.title}</h1>
      </div>

      {/* Basic Info */}
      <div className={`${card} p-6`}>
        <h2 className={`text-base font-bold mb-5 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
          <Trophy size={18} className="text-amber-400" />{t.basicInfo}
        </h2>
        <div className="space-y-4">
          <div>
            <label className={lbl}>{t.tName} *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={t.tNamePh} className={inp} required />
          </div>
          <div>
            <label className={lbl}>{t.tLogo}</label>
            <input value={form.logo} onChange={e => set('logo', e.target.value)} placeholder={t.tLogoPh} className={inp} />
          </div>
          <div>
            <label className={lbl}>{t.tDesc}</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder={t.tDescPh} rows={3} className={`${inp} resize-none`} />
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className={`${card} p-6`}>
        <h2 className={`text-base font-bold mb-5 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
          <Settings2 size={18} className="text-purple-400" />{t.formatTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {formats.map(f => {
            const isSelected = form.format === f.id;
            return (
              <button type="button" key={f.id} onClick={() => set('format', f.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/15'
                    : dm ? 'border-slate-700 hover:border-slate-600 bg-slate-800/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <p className={`font-black text-sm mb-1 ${isSelected ? 'text-emerald-400' : dm ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{f.desc}</p>
                {isSelected && <CheckCircle2 size={16} className="text-emerald-400 mt-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Season + Options row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Season */}
        <div className={`${card} p-6`}>
          <h2 className={`text-base font-bold mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
            <Calendar size={18} className="text-cyan-400" />{t.season}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>{t.year}</label>
              <select value={form.year} onChange={e => set('year', e.target.value)} className={`${inp} appearance-none`}>
                {['2024','2025','2026','2027'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>{t.startDate}</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className={lbl}>{t.endDate}</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={`${inp} [color-scheme:dark]`} />
            </div>
          </div>
        </div>

        {/* Options toggles */}
        <div className={`${card} p-6`}>
          <h2 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>{t.options}</h2>
          <div className="space-y-4">
            {opts.map(o => {
              const Icon = o.icon;
              return (
                <div key={o.k} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon size={16} className={o.color} />
                    <div>
                      <p className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{o.label}</p>
                      <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{o.desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={form[o.k]} onChange={v => set(o.k, v)} dm={dm} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button type="button"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm transition-all hover:scale-[1.02] ${dm ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'}`}>
          <Copy size={16} />{t.clone}
        </button>
        <button type="submit" disabled={saving}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${
            saved ? 'bg-emerald-600 text-white' :
            saving ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
            'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
          }`}>
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? t.saving : saved ? t.saved : t.save}
        </button>
      </div>
    </form>
  );
};

export default TournamentSettings;
