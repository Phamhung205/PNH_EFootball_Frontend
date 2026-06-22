import React, { useState } from 'react';
import { Globe, Languages, Type, Clock, Save } from 'lucide-react';

const translations = {
  vi: {
    title: 'Cài Đặt Ngôn Ngữ',
    languageSelection: 'Chọn Ngôn Ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    preview: 'Xem Trước',
    previewText:
      'Chào mừng bạn đến với hệ thống quản lý giải đấu PNH Football Esports. Tại đây bạn có thể quản lý các giải đấu, theo dõi kết quả và xem bảng xếp hạng.',
    fontSize: 'Cỡ Chữ',
    small: 'Nhỏ',
    medium: 'Vừa',
    large: 'Lớn',
    timezone: 'Múi Giờ',
    dateFormat: 'Định Dạng Ngày',
    savePreferences: 'Lưu Cài Đặt',
    saved: 'Đã lưu thành công!',
    displaySettings: 'Cài Đặt Hiển Thị',
    currentLang: 'Ngôn ngữ hiện tại',
  },
  en: {
    title: 'Language Settings',
    languageSelection: 'Select Language',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    preview: 'Preview',
    previewText:
      'Welcome to the PNH Football Esports tournament management system. Here you can manage tournaments, track results, and view standings.',
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    timezone: 'Timezone',
    dateFormat: 'Date Format',
    savePreferences: 'Save Preferences',
    saved: 'Saved successfully!',
    displaySettings: 'Display Settings',
    currentLang: 'Current language',
  },
};

const timezones = [
  { value: 'Asia/Ho_Chi_Minh', label: '(UTC+7) Ho Chi Minh' },
  { value: 'Asia/Bangkok', label: '(UTC+7) Bangkok' },
  { value: 'Asia/Singapore', label: '(UTC+8) Singapore' },
  { value: 'Asia/Tokyo', label: '(UTC+9) Tokyo' },
  { value: 'Europe/London', label: '(UTC+0) London' },
  { value: 'America/New_York', label: '(UTC-5) New York' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '29/05/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/29/2026' },
];

const fontSizeMap = {
  14: 'text-sm',
  16: 'text-base',
  18: 'text-lg',
};

export default function LanguageSwitch({
  darkMode = true,
  language = 'vi',
  onLanguageChange,
}) {
  const [selectedLang, setSelectedLang] = useState(language);
  const [fontSize, setFontSize] = useState(16);
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [saved, setSaved] = useState(false);

  const t = translations[selectedLang] || translations.vi;

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const languageOptions = [
    {
      key: 'vi',
      flag: '🇻🇳',
      name: t.vietnamese,
      nativeName: 'Tiếng Việt',
    },
    {
      key: 'en',
      flag: '🇬🇧',
      name: t.english,
      nativeName: 'English',
    },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} p-4 md:p-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Globe className="w-7 h-7 text-emerald-400" />
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Language Selection */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Languages className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-bold text-lg">
                {t.languageSelection}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {languageOptions.map((opt) => {
                const isSelected = selectedLang === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleLanguageSelect(opt.key)}
                    className={`relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'border-slate-700/50 bg-slate-950/30 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-4xl">{opt.flag}</span>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {opt.nativeName}
                      </p>
                      <p className="text-slate-400 text-sm">{opt.name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white font-bold text-lg">{t.preview}</h2>
            </div>
            <div className="bg-slate-950/50 border border-slate-700 rounded-xl p-5">
              <p
                className={`text-slate-300 leading-relaxed ${fontSizeMap[fontSize] || 'text-base'}`}
              >
                {t.previewText}
              </p>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">
              {t.displaySettings}
            </h2>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-400" />
                    <label className="text-slate-300 font-semibold text-sm">
                      {t.fontSize}
                    </label>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">
                    {fontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-xs">{t.small}</span>
                  <input
                    type="range"
                    min="14"
                    max="18"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30"
                  />
                  <span className="text-slate-500 text-xs">{t.large}</span>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <label className="text-slate-300 font-semibold text-sm">
                    {t.timezone}
                  </label>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                >
                  {timezones.map((tz) => (
                    <option
                      key={tz.value}
                      value={tz.value}
                      className="bg-slate-900 text-white"
                    >
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <label className="text-slate-300 font-semibold text-sm">
                    {t.dateFormat}
                  </label>
                </div>
                <div className="flex gap-3">
                  {dateFormats.map((df) => (
                    <button
                      key={df.value}
                      onClick={() => setDateFormat(df.value)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
                        dateFormat === df.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700/50 bg-slate-950/30 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="font-bold text-sm">{df.label}</p>
                      <p className="text-xs mt-1 opacity-70">{df.example}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] ${
              saved ? 'from-emerald-600 to-emerald-600' : ''
            }`}
          >
            {saved ? (
              <>
                <Save className="w-5 h-5" />
                {t.saved}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t.savePreferences}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
