import React, { useState } from 'react';
import { ScrollText, Settings, Save } from 'lucide-react';

const translations = {
  vi: {
    title: 'Thiết Lập Luật Thi Đấu',
    tournamentName: 'Tên Giải Đấu',
    maxTeams: 'Số Đội Tối Đa',
    halfDuration: 'Thời Gian Mỗi Hiệp (phút)',
    halves: 'Số Hiệp',
    cardRules: 'Luật Thẻ Phạt',
    extraTime: 'Cho Phép Bù Giờ',
    penalty: 'Cho Phép Đá Penalty',
    drawRules: 'Quy Định Khi Hòa',
    save: 'Lưu Cài Đặt',
    saved: 'Đã lưu thành công!',
    tournamentNamePlaceholder: 'Nhập tên giải đấu...',
    cardRulesPlaceholder: 'Nhập luật thẻ phạt chi tiết...',
    penaltyOption: 'Đá Penalty',
    extraTimeOption: 'Hiệp phụ',
    replayOption: 'Đá lại',
  },
  en: {
    title: 'Tournament Rules Setup',
    tournamentName: 'Tournament Name',
    maxTeams: 'Max Teams',
    halfDuration: 'Half Duration (min)',
    halves: 'Number of Halves',
    cardRules: 'Card Penalty Rules',
    extraTime: 'Allow Extra Time',
    penalty: 'Allow Penalty Shootout',
    drawRules: 'Draw Resolution',
    save: 'Save Settings',
    saved: 'Settings saved!',
    tournamentNamePlaceholder: 'Enter tournament name...',
    cardRulesPlaceholder: 'Enter detailed card penalty rules...',
    penaltyOption: 'Penalty Shootout',
    extraTimeOption: 'Extra Time',
    replayOption: 'Replay',
  },
};

export default function RulesSetup({ darkMode = true, language = 'vi' }) {
  const t = translations[language] || translations.vi;

  const [form, setForm] = useState({
    tournamentName: '',
    maxTeams: '16',
    halfDuration: 45,
    halves: '2',
    cardRules: '',
    extraTime: false,
    penalty: true,
    drawRules: 'penalty',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const inputClass =
    'w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 placeholder-slate-500';

  const labelClass = 'block text-sm font-semibold text-slate-300 mb-2';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <ScrollText className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <Settings className="w-5 h-5 text-slate-500 ml-auto animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Tournament Name */}
        <div>
          <label className={labelClass}>{t.tournamentName}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t.tournamentNamePlaceholder}
            value={form.tournamentName}
            onChange={(e) => handleChange('tournamentName', e.target.value)}
          />
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Max Teams */}
          <div>
            <label className={labelClass}>{t.maxTeams}</label>
            <select
              className={inputClass + ' cursor-pointer'}
              value={form.maxTeams}
              onChange={(e) => handleChange('maxTeams', e.target.value)}
            >
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="20">20</option>
              <option value="32">32</option>
            </select>
          </div>

          {/* Half Duration */}
          <div>
            <label className={labelClass}>{t.halfDuration}</label>
            <input
              type="number"
              className={inputClass}
              value={form.halfDuration}
              min={1}
              max={90}
              onChange={(e) => handleChange('halfDuration', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Halves */}
          <div>
            <label className={labelClass}>{t.halves}</label>
            <select
              className={inputClass + ' cursor-pointer'}
              value={form.halves}
              onChange={(e) => handleChange('halves', e.target.value)}
            >
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Draw Rules */}
          <div>
            <label className={labelClass}>{t.drawRules}</label>
            <select
              className={inputClass + ' cursor-pointer'}
              value={form.drawRules}
              onChange={(e) => handleChange('drawRules', e.target.value)}
            >
              <option value="penalty">{t.penaltyOption}</option>
              <option value="extra_time">{t.extraTimeOption}</option>
              <option value="replay">{t.replayOption}</option>
            </select>
          </div>
        </div>

        {/* Card Rules */}
        <div>
          <label className={labelClass}>{t.cardRules}</label>
          <textarea
            className={inputClass + ' min-h-[100px] resize-y'}
            placeholder={t.cardRulesPlaceholder}
            value={form.cardRules}
            onChange={(e) => handleChange('cardRules', e.target.value)}
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-700/50 cursor-pointer hover:border-emerald-500/30 transition-all duration-300 group">
            <input
              type="checkbox"
              checked={form.extraTime}
              onChange={(e) => handleChange('extraTime', e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-white transition-colors">{t.extraTime}</span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-700/50 cursor-pointer hover:border-emerald-500/30 transition-all duration-300 group">
            <input
              type="checkbox"
              checked={form.penalty}
              onChange={(e) => handleChange('penalty', e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-white transition-colors">{t.penalty}</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-emerald-400 text-sm font-semibold animate-pulse">
            ✓ {t.saved}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] ${
            saving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
          {saving ? '...' : t.save}
        </button>
      </div>
    </div>
  );
}
