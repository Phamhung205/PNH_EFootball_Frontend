import React, { useState } from 'react';
import { Trophy, Users, Image as ImageIcon, Settings, CheckCircle2, ArrowLeft } from 'lucide-react';

const T = {
  vi: {
    title: 'Tạo Giải Đấu Mới',
    sub: 'Thiết lập các thông số cơ bản để bắt đầu mùa giải của bạn.',
    basicInfo: 'Thông Tin Cơ Bản',
    customization: 'Tùy Chỉnh Thêm',
    tournamentName: 'Tên Giải Đấu', required: '*',
    namePlaceholder: 'VD: PNH Super League Mùa 1...',
    format: 'Thể Thức Thi Đấu',
    league: 'League (Vòng Tròn Tính Điểm)',
    knockout: 'Knockout (Loại Trực Tiếp)',
    groupKnockout: 'Vòng Bảng & Knockout',
    teamCount: 'Số Đội Tham Gia',
    teams8:'8 Đội', teams16:'16 Đội', teams20:'20 Đội', teams32:'32 Đội',
    description: 'Mô Tả / Luật Lệ (Tùy chọn)',
    descPlaceholder: 'Nhập thông tin chi tiết về giải đấu, luật thi đấu, giải thưởng...',
    startDate: 'Ngày Khởi Tranh',
    banner: 'Banner Giải Đấu',
    uploadHint: 'Nhấn để tải ảnh lên',
    fileFormat: 'PNG, JPG (Max 5MB)',
    createBtn: 'Hoàn Tất Tạo Giải',
    successMsg: 'Tuyệt vời! Giải đấu đã được tạo thành công!',
    errorMsg: 'Có lỗi xảy ra. Vui lòng kiểm tra lại!',
    connError: 'Không kết nối được tới Backend!',
    back: 'Quay lại',
  },
  en: {
    title: 'Create New Tournament',
    sub: 'Set up the basic parameters to start your tournament season.',
    basicInfo: 'Basic Information',
    customization: 'Additional Customization',
    tournamentName: 'Tournament Name', required: '*',
    namePlaceholder: 'E.g: PNH Super League Season 1...',
    format: 'Tournament Format',
    league: 'League (Round Robin)',
    knockout: 'Knockout (Direct Elimination)',
    groupKnockout: 'Group Stage & Knockout',
    teamCount: 'Number of Teams',
    teams8:'8 Teams', teams16:'16 Teams', teams20:'20 Teams', teams32:'32 Teams',
    description: 'Description / Rules (Optional)',
    descPlaceholder: 'Enter details about the tournament, rules, prizes...',
    startDate: 'Start Date',
    banner: 'Tournament Banner',
    uploadHint: 'Click to upload image',
    fileFormat: 'PNG, JPG (Max 5MB)',
    createBtn: 'Complete Tournament Creation',
    successMsg: 'Excellent! Tournament created successfully!',
    errorMsg: 'An error occurred. Please check your information!',
    connError: 'Cannot connect to Backend!',
    back: 'Back',
  },
};

const inp = 'w-full rounded-xl px-4 py-3.5 bg-slate-950/70 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition-all';
const sel = `${inp} appearance-none`;

const CreateTournament = ({ onNavigate, darkMode = true, language = 'vi' }) => {
  const t = T[language] || T.vi;
  const [form, setForm] = useState({ name:'', format:'League', teams:16, startDate:'', description:'' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://localhost:7051/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, format: form.format,
          maxTeams: parseInt(form.teams),
          startDate: form.startDate || new Date().toISOString(),
          description: form.description,
          numberOfGroups: 4, teamsAdvancingPerGroup: 2,
        }),
      });
      alert(res.ok ? t.successMsg : t.errorMsg);
      if (res.ok) onNavigate('home');
    } catch {
      alert(t.connError);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-10">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 mb-8 text-slate-400 hover:text-emerald-400 font-semibold text-sm transition-colors group"
      >
        <span className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </span>
        {t.back}
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t.title}</h1>
          <p className="text-slate-400 mt-1">{t.sub}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* ── Left: Basic Info ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
              <Settings className="text-emerald-500" size={20} />
              {t.basicInfo}
            </h2>
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  {t.tournamentName} <span className="text-rose-400">{t.required}</span>
                </label>
                <input
                  type="text" required placeholder={t.namePlaceholder}
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className={inp}
                />
              </div>
              {/* Format + Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">{t.format}</label>
                  <div className="relative">
                    <select value={form.format} onChange={e => set('format', e.target.value)} className={sel}>
                      <option value="League">{t.league}</option>
                      <option value="Knockout">{t.knockout}</option>
                      <option value="GroupStage_Knockout">{t.groupKnockout}</option>
                    </select>
                    <Trophy size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">{t.teamCount}</label>
                  <div className="relative">
                    <select value={form.teams} onChange={e => set('teams', parseInt(e.target.value))} className={sel}>
                      <option value={8}>{t.teams8}</option>
                      <option value={16}>{t.teams16}</option>
                      <option value={20}>{t.teams20}</option>
                      <option value={32}>{t.teams32}</option>
                    </select>
                    <Users size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{t.description}</label>
                <textarea
                  rows={4} placeholder={t.descPlaceholder}
                  value={form.description} onChange={e => set('description', e.target.value)}
                  className={`${inp} resize-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Customization ── */}
        <div>
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700/50 pb-4">{t.customization}</h2>

            {/* Start date */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-300 mb-2">{t.startDate}</label>
              <input
                type="date"
                value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className={`${inp} [color-scheme:dark]`}
              />
            </div>

            {/* Banner upload */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-300 mb-2">{t.banner}</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors group bg-slate-950/30">
                <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <ImageIcon size={22} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-sm font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">{t.uploadHint}</p>
                <p className="text-xs text-slate-500 mt-1">{t.fileFormat}</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 size={20} />
              {t.createBtn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;
