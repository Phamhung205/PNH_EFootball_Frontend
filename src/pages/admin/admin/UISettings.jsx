import React, { useState, useRef } from 'react';
import { loadUiSettings, saveUiSettings, applyUiSettings, DEFAULT_UI } from '../../../services/themeStore';
import {
  Palette,
  Type,
  Image,
  Monitor,
  Moon,
  Sun,
  Check,
  Upload,
  Save,
  RefreshCw,
  Eye,
  Sparkles,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  Bell,
  Settings,
  Star,
  Zap,
} from 'lucide-react';

/* ─── Translations ─── */
const T = {
  vi: {
    title: 'Tuỳ Chỉnh Giao Diện',
    subtitle: 'Tùy chỉnh màu sắc, font chữ và hình ảnh thương hiệu của giải đấu',
    colorTheme: 'Bảng Màu Chủ Đề',
    colorThemeDesc: 'Chọn bộ màu chủ đạo cho toàn bộ giao diện',
    customColor: 'Màu Tuỳ Chỉnh',
    customColorDesc: 'Nhập mã màu HEX của riêng bạn',
    hexPlaceholder: '#10b981',
    logoUpload: 'Logo Giải Đấu',
    logoUploadDesc: 'Tải lên logo hiển thị trên header và trang chủ (PNG, SVG, 512×512px)',
    bannerUpload: 'Banner Giải Đấu',
    bannerUploadDesc: 'Ảnh bìa hiển thị trên trang cộng đồng (JPG, PNG, 1200×400px)',
    clickToUpload: 'Nhấp để tải ảnh lên',
    orDragDrop: 'hoặc kéo thả vào đây',
    fontSelection: 'Kiểu Chữ (Font)',
    fontSelectionDesc: 'Chọn font chữ hiển thị toàn trang',
    fontDefault: 'Mặc định',
    modePreference: 'Chế Độ Hiển Thị',
    modePreferenceDesc: 'Lựa chọn giao diện sáng hoặc tối',
    darkMode: 'Chế Độ Tối',
    darkModeDesc: 'Nền tối, bảo vệ mắt ban đêm',
    lightMode: 'Chế Độ Sáng',
    lightModeDesc: 'Nền sáng, phù hợp ban ngày',
    previewTitle: 'Xem Trước Giao Diện',
    previewDesc: 'Preview trực tiếp với cài đặt hiện tại',
    save: 'Lưu Thay Đổi',
    reset: 'Đặt Lại Mặc Định',
    saved: 'Đã Lưu!',
    previewCard1: 'Tổng Giải Đấu',
    previewCard2: 'Số Đội Thi Đấu',
    previewCard3: 'Trận Sắp Diễn Ra',
    previewBtn: 'Quản Lý Ngay',
    previewTable: 'Bảng Xếp Hạng',
    previewTeam: 'Đội Bóng',
    previewPoints: 'Điểm',
    sampleToast: 'Lưu thành công!',
    accentLabel: 'Màu nhấn',
    recommended: 'Được đề xuất',
  },
  en: {
    title: 'UI Customization',
    subtitle: 'Customize colors, fonts and branding assets for your tournament',
    colorTheme: 'Color Theme',
    colorThemeDesc: 'Choose the primary accent color for the entire interface',
    customColor: 'Custom Color',
    customColorDesc: 'Enter your own HEX color code',
    hexPlaceholder: '#10b981',
    logoUpload: 'Tournament Logo',
    logoUploadDesc: 'Upload logo shown on header and homepage (PNG, SVG, 512×512px)',
    bannerUpload: 'Tournament Banner',
    bannerUploadDesc: 'Cover image shown on community page (JPG, PNG, 1200×400px)',
    clickToUpload: 'Click to upload image',
    orDragDrop: 'or drag & drop here',
    fontSelection: 'Font Selection',
    fontSelectionDesc: 'Choose the typeface for the entire site',
    fontDefault: 'Default',
    modePreference: 'Display Mode',
    modePreferenceDesc: 'Choose light or dark interface',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Dark background, easy on the eyes at night',
    lightMode: 'Light Mode',
    lightModeDesc: 'Bright background, ideal for daytime',
    previewTitle: 'Live Preview',
    previewDesc: 'Preview directly with current settings',
    save: 'Save Changes',
    reset: 'Reset to Default',
    saved: 'Saved!',
    previewCard1: 'Total Tournaments',
    previewCard2: 'Registered Teams',
    previewCard3: 'Upcoming Matches',
    previewBtn: 'Manage Now',
    previewTable: 'Standings',
    previewTeam: 'Team',
    previewPoints: 'Pts',
    sampleToast: 'Saved successfully!',
    accentLabel: 'Accent',
    recommended: 'Recommended',
  },
};

/* ─── Color Presets ─── */
const COLOR_PRESETS = [
  {
    id: 'emerald',
    label: { vi: 'Emerald', en: 'Emerald' },
    primary: '#10b981',
    secondary: '#06b6d4',
    from: 'from-emerald-500',
    to: 'to-cyan-500',
    glow: 'shadow-emerald-500/30',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-500',
    dot: '#10b981',
    dot2: '#06b6d4',
    recommended: true,
  },
  {
    id: 'blue',
    label: { vi: 'Đại Dương', en: 'Ocean Blue' },
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    from: 'from-blue-500',
    to: 'to-violet-500',
    glow: 'shadow-blue-500/30',
    ring: 'ring-blue-500',
    bg: 'bg-blue-500',
    dot: '#3b82f6',
    dot2: '#8b5cf6',
  },
  {
    id: 'purple',
    label: { vi: 'Tím Ngọc', en: 'Royal Purple' },
    primary: '#a855f7',
    secondary: '#ec4899',
    from: 'from-purple-500',
    to: 'to-pink-500',
    glow: 'shadow-purple-500/30',
    ring: 'ring-purple-500',
    bg: 'bg-purple-500',
    dot: '#a855f7',
    dot2: '#ec4899',
  },
  {
    id: 'orange',
    label: { vi: 'Cam Lửa', en: 'Fire Orange' },
    primary: '#f97316',
    secondary: '#ef4444',
    from: 'from-orange-500',
    to: 'to-red-500',
    glow: 'shadow-orange-500/30',
    ring: 'ring-orange-500',
    bg: 'bg-orange-500',
    dot: '#f97316',
    dot2: '#ef4444',
  },
  {
    id: 'rose',
    label: { vi: 'Hồng Ngọc', en: 'Rose Gold' },
    primary: '#f43f5e',
    secondary: '#fb923c',
    from: 'from-rose-500',
    to: 'to-orange-400',
    glow: 'shadow-rose-500/30',
    ring: 'ring-rose-500',
    bg: 'bg-rose-500',
    dot: '#f43f5e',
    dot2: '#fb923c',
  },
  {
    id: 'gold',
    label: { vi: 'Vàng Kim', en: 'Golden' },
    primary: '#eab308',
    secondary: '#f97316',
    from: 'from-yellow-500',
    to: 'to-orange-500',
    glow: 'shadow-yellow-500/30',
    ring: 'ring-yellow-500',
    bg: 'bg-yellow-500',
    dot: '#eab308',
    dot2: '#f97316',
  },
];

/* ─── Font Options ─── */
const FONTS = [
  { id: 'inter', name: 'Inter', sample: 'Aa Bb Cc', desc: { vi: tr('Mặc định · Hiện đại','Default · Modern'), en: 'Default · Modern' } },
  { id: 'roboto', name: 'Roboto', sample: 'Aa Bb Cc', desc: { vi: tr('Cân bằng · Dễ đọc','Balanced · Readable'), en: 'Balanced · Readable' } },
  { id: 'outfit', name: 'Outfit', sample: 'Aa Bb Cc', desc: { vi: tr('Tròn trịa · Thân thiện','Rounded · Friendly'), en: 'Rounded · Friendly' } },
];

/* ─── Upload Zone Component ─── */
function UploadZone({ dm, label, desc, accept, aspect, previewUrl, onUpload }) {
  // Ham nay nam NGOAI component nen khong nhan prop language.
  // Doc ngon ngu da luu de van dich duoc.
  const _lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'vi';
  const tr = (vi, en) => (_lang === 'en' ? en : vi);
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    // Gioi han 2MB de tranh localStorage qua tai (localStorage chi ~5MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Anh qua lon (toi da 2MB). Vui long chon anh nho hon.');
      return;
    }
    // Doc anh thanh base64 (dataURL) -> luu duoc vao localStorage, khong mat khi F5
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result);
    reader.onerror = () => alert('Khong doc duoc anh. Thu lai anh khac.');
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className={`text-sm font-semibold mb-1 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{label}</p>
      <p className={`text-xs mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</p>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden
          ${aspect === 'banner' ? 'h-28' : 'h-24'}
          ${dragging
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : dm
              ? 'border-slate-600 hover:border-slate-400 bg-slate-950/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="text-center">
            <Upload className={`w-7 h-7 mx-auto mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
            <p className={`text-xs font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              {dragging ? tr('📂 Thả vào đây...','📂 Drop here...') : label}
            </p>
          </div>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

/* ─── Preview Panel ─── */
function PreviewPanel({ dm, accent, font, previewDark, t }) {
  const cardBg = previewDark
    ? 'bg-slate-800/80 border border-slate-700/50'
    : 'bg-white border border-slate-200';
  const textPrimary = previewDark ? 'text-white' : 'text-slate-900';
  const textSecondary = previewDark ? 'text-slate-400' : 'text-slate-500';
  const bg = previewDark ? 'bg-slate-900' : 'bg-slate-100';

  const statCards = [
    { icon: Trophy, label: t.previewCard1, val: '12', change: '+2' },
    { icon: Users, label: t.previewCard2, val: '128', change: '+8' },
    { icon: Calendar, label: t.previewCard3, val: '5', change: 'Hôm nay' },
  ];

  const teams = [
    { name: 'FC Alpha', pts: 21 },
    { name: 'Thunder', pts: 18 },
    { name: 'Storm FC', pts: 15 },
  ];

  return (
    <div className={`rounded-2xl overflow-hidden border ${previewDark ? 'border-slate-700/50' : 'border-slate-200'} ${bg} font-${font}`}>
      {/* Mini nav */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b ${previewDark ? 'bg-slate-950/80 border-slate-700/50' : 'bg-white border-slate-200'}`}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})` }}>
          <Trophy className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-black" style={{ background: `linear-gradient(to right, ${accent.primary}, ${accent.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PNH FOOTBALL
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Bell className={`w-3.5 h-3.5 ${textSecondary}`} />
          <Settings className={`w-3.5 h-3.5 ${textSecondary}`} />
          <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})` }} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2">
          {statCards.map(({ icon: Icon, label, val, change }) => (
            <div key={label} className={`${cardBg} rounded-xl p-2.5`}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center mb-1.5" style={{ background: `${accent.primary}20` }}>
                <Icon className="w-3 h-3" style={{ color: accent.primary }} />
              </div>
              <p className={`text-base font-black ${textPrimary}`}>{val}</p>
              <p className={`text-[10px] ${textSecondary}`}>{label}</p>
              <p className="text-[10px] font-medium" style={{ color: accent.primary }}>{change}</p>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          className="w-full py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
          style={{ background: `linear-gradient(to right, ${accent.primary}, ${accent.secondary})` }}
        >
          <Zap className="w-3 h-3" />
          {t.previewBtn}
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Mini table */}
        <div className={`${cardBg} rounded-xl overflow-hidden`}>
          <div className="px-3 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: previewDark ? 'rgba(100,116,139,0.3)' : '#e2e8f0' }}>
            <Star className="w-3 h-3" style={{ color: accent.primary }} />
            <span className={`text-[11px] font-bold ${textPrimary}`}>{t.previewTable}</span>
          </div>
          {teams.map((team, i) => (
            <div key={team.name} className={`px-3 py-1.5 flex items-center gap-2 ${i < teams.length - 1 ? 'border-b' : ''}`} style={{ borderColor: previewDark ? 'rgba(100,116,139,0.2)' : '#f1f5f9' }}>
              <span className="text-[10px] font-bold w-4" style={{ color: i === 0 ? accent.primary : undefined }}>{i + 1}</span>
              <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${accent.primary}60, ${accent.secondary}60)` }} />
              <span className={`text-[10px] flex-1 font-medium ${textPrimary}`}>{team.name}</span>
              <span className="text-[10px] font-black" style={{ color: accent.primary }}>{team.pts}</span>
            </div>
          ))}
        </div>

        {/* Toast sample */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: `${accent.primary}20`, border: `1px solid ${accent.primary}40` }}>
          <Check className="w-3 h-3" style={{ color: accent.primary }} />
          <span className="text-[11px] font-medium" style={{ color: accent.primary }}>{t.sampleToast}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════ */
export default function UISettings({ darkMode = true, setDarkMode, language = 'vi' }) {
  const dm = darkMode;
  const t = T[language] || T.vi;
  const tr = (vi, en) => (language === 'en' ? en : vi);

  // Doc cai dat da luu lam gia tri ban dau
  const initial = loadUiSettings();

  // Tim preset khop voi mau da luu (neu trung 1 trong 6 preset thi chon preset do)
  const matchedPreset = COLOR_PRESETS.find(p => p.primary === initial.accentPrimary);

  const [selectedPreset, setSelectedPreset] = useState(matchedPreset ? matchedPreset.id : 'emerald');
  const [customHex, setCustomHex] = useState(initial.accentPrimary || '#10b981');
  // Neu mau da luu KHONG trung preset nao -> dang dung mau tuy chinh
  const [useCustom, setUseCustom] = useState(!matchedPreset);
  const [selectedFont, setSelectedFont] = useState(initial.font || 'inter');
  // previewDark dong bo voi che do that cua web
  const [previewDark, setPreviewDark] = useState(darkMode);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || null);
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentPreset = COLOR_PRESETS.find((p) => p.id === selectedPreset) || COLOR_PRESETS[0];
  const accent = useCustom
    ? { primary: customHex, secondary: customHex }
    : { primary: currentPreset.primary, secondary: currentPreset.secondary };

  // LUU THAT: ghi localStorage + ap dung ngay ra giao dien
  const handleSave = () => {
    setSaving(true);

    const settings = {
      accentPrimary: accent.primary,
      accentSecondary: accent.secondary,
      font: selectedFont,
      darkMode: previewDark,
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
    };

    // Ghi xuong localStorage
    saveUiSettings(settings);
    // Ap dung mau + font ra toan trang ngay lap tuc
    applyUiSettings(settings);
    // Dong bo che do Sang/Toi that cua web (neu App co truyen setDarkMode)
    if (typeof setDarkMode === 'function') setDarkMode(previewDark);

    // Hieu ung nut "Da luu!"
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  const handleReset = () => {
    setSelectedPreset('emerald');
    setCustomHex('#10b981');
    setUseCustom(false);
    setSelectedFont('inter');
    setPreviewDark(true);
    setLogoUrl(null);
    setBannerUrl(null);

    // Ap dung lai mac dinh ngay
    saveUiSettings(DEFAULT_UI);
    applyUiSettings(DEFAULT_UI);
    if (typeof setDarkMode === 'function') setDarkMode(true);
  };

  /* ── Card styles ── */
  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const sectionTitle = dm ? 'text-white font-bold text-base' : 'text-slate-800 font-bold text-base';
  const sectionDesc = dm ? 'text-slate-400' : 'text-slate-500';
  const labelText = dm ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'text-white' : 'text-slate-900'}`}>
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className={`text-sm ${sectionDesc}`}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* COLOR PRESETS */}
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-emerald-400" />
              <h2 className={sectionTitle}>{t.colorTheme}</h2>
            </div>
            <p className={`text-xs mb-5 ${sectionDesc}`}>{t.colorThemeDesc}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = !useCustom && selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => { setSelectedPreset(preset.id); setUseCustom(false); }}
                    className={`relative group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left
                      ${isSelected
                        ? `border-2 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`
                        : `${dm ? 'border-slate-700/50 bg-slate-950/40 hover:bg-slate-800/60' : 'border-slate-200 bg-white hover:bg-slate-50'} hover:border-slate-400`
                      }`}
                    style={{ borderColor: isSelected ? preset.primary : undefined }}
                  >
                    {/* Swatch */}
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${dm ? 'text-white' : 'text-slate-800'}`}>
                        {preset.label[language] || preset.label.vi}
                      </p>
                      {preset.recommended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${preset.primary}25`, color: preset.primary }}>
                          ★ {t.recommended}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ background: preset.primary }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom color */}
            <div className={`mt-5 p-4 rounded-xl border ${dm ? 'border-slate-700/50 bg-slate-950/30' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-sm font-semibold ${labelText}`}>{t.customColor}</p>
                  <p className={`text-xs ${sectionDesc}`}>{t.customColorDesc}</p>
                </div>
                <button
                  onClick={() => setUseCustom(!useCustom)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${useCustom ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : dm ? 'bg-slate-700' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${useCustom ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => { setCustomHex(e.target.value); setUseCustom(true); }}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { setCustomHex(v); setUseCustom(true); } }}
                  placeholder={t.hexPlaceholder}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono transition-all
                    ${dm ? 'bg-slate-950/70 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'}
                    focus:outline-none focus:ring-1 focus:ring-emerald-500/30`}
                />
                <div className="w-10 h-10 rounded-xl shadow-md flex-shrink-0" style={{ background: customHex }} />
              </div>
            </div>
          </div>

          {/* LOGO & BANNER UPLOADS */}
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Image className="w-4 h-4 text-emerald-400" />
              <h2 className={sectionTitle}>{t.logoUpload}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
              <UploadZone
                dm={dm}
                label={t.clickToUpload}
                desc={t.logoUploadDesc}
                accept="image/png,image/svg+xml,image/jpeg"
                aspect="square"
                previewUrl={logoUrl}
                onUpload={setLogoUrl}
              />
              <UploadZone
                dm={dm}
                label={t.clickToUpload}
                desc={t.bannerUploadDesc}
                accept="image/png,image/jpeg"
                aspect="banner"
                previewUrl={bannerUrl}
                onUpload={setBannerUrl}
              />
            </div>
          </div>

          {/* FONT SELECTION */}
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Type className="w-4 h-4 text-emerald-400" />
              <h2 className={sectionTitle}>{t.fontSelection}</h2>
            </div>
            <p className={`text-xs mb-5 ${sectionDesc}`}>{t.fontSelectionDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FONTS.map((font) => {
                const isSel = selectedFont === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`relative p-5 rounded-xl border text-left transition-all duration-200
                      ${isSel
                        ? `border-2 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`
                        : `${dm ? 'border-slate-700/50 bg-slate-950/40 hover:bg-slate-800/60' : 'border-slate-200 bg-white hover:bg-slate-50'}`
                      }`}
                    style={{ borderColor: isSel ? accent.primary : undefined, fontFamily: font.name }}
                  >
                    <p className={`text-2xl font-bold mb-1 ${dm ? 'text-white' : 'text-slate-800'}`}>{font.sample}</p>
                    <p className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-800'}`}>{font.name}</p>
                    <p className={`text-xs mt-0.5 ${sectionDesc}`}>{font.desc[language] || font.desc.vi}</p>
                    {isSel && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accent.primary }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DISPLAY MODE */}
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <h2 className={sectionTitle}>{t.modePreference}</h2>
            </div>
            <p className={`text-xs mb-5 ${sectionDesc}`}>{t.modePreferenceDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: true, icon: Moon, label: t.darkMode, desc: t.darkModeDesc, iconColor: 'text-blue-400', bgIcon: 'bg-blue-500/15' },
                { id: false, icon: Sun, label: t.lightMode, desc: t.lightModeDesc, iconColor: 'text-amber-400', bgIcon: 'bg-amber-500/15' },
              ].map(({ id, icon: Icon, label, desc, iconColor, bgIcon }) => {
                const isSel = previewDark === id;
                return (
                  <button
                    key={String(id)}
                    onClick={() => setPreviewDark(id)}
                    className={`relative flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left
                      ${isSel
                        ? `border-2 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`
                        : `${dm ? 'border-slate-700/50 bg-slate-950/40 hover:bg-slate-800/60' : 'border-slate-200 bg-white hover:bg-slate-50'}`
                      }`}
                    style={{ borderColor: isSel ? accent.primary : undefined }}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgIcon}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                      <p className={`text-xs mt-0.5 ${sectionDesc}`}>{desc}</p>
                    </div>
                    {isSel && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accent.primary }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, ${accent.primary}, ${accent.secondary})` }}
            >
              {saving ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> {language === 'vi' ? 'Đang lưu...' : 'Saving...'}</>
              ) : saved ? (
                <><Check className="w-5 h-5" /> {t.saved}</>
              ) : (
                <><Save className="w-5 h-5" /> {t.save}</>
              )}
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <RefreshCw className="w-5 h-5" />
              {t.reset}
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Preview Panel ── */}
        <div className="xl:sticky xl:top-6 xl:self-start space-y-4">
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h2 className={sectionTitle}>{t.previewTitle}</h2>
            </div>
            <p className={`text-xs mb-5 ${sectionDesc}`}>{t.previewDesc}</p>

            {/* Accent display */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border" style={{ borderColor: `${accent.primary}40`, background: `${accent.primary}10` }}>
              <div className="w-8 h-8 rounded-lg shadow-md flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})` }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: accent.primary }}>{t.accentLabel}</p>
                <p className={`text-xs font-mono ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{accent.primary} → {accent.secondary}</p>
              </div>
              <Sparkles className="w-4 h-4 ml-auto" style={{ color: accent.primary }} />
            </div>

            <PreviewPanel
              dm={dm}
              accent={accent}
              font={selectedFont}
              previewDark={previewDark}
              t={t}
            />

            {/* Font preview */}
            <div className={`mt-4 p-4 rounded-xl border ${dm ? 'border-slate-700/50 bg-slate-950/30' : 'border-slate-200 bg-slate-50'}`} style={{ fontFamily: FONTS.find(f => f.id === selectedFont)?.name }}>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${sectionDesc}`}>{t.fontSelection}</p>
              <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-800'}`}>PNH Football 2026</p>
              <p className={`text-sm ${sectionDesc}`}>{language === 'vi' ? 'Hệ thống quản lý giải đấu chuyên nghiệp' : 'Professional tournament management system'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}