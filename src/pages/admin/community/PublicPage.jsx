import { useState } from 'react';
import {
  Globe, Lock, Copy, CheckCheck, Eye, Settings, ChevronDown,
  ExternalLink, Search, Users, ShieldCheck, Tag, AlignLeft, Image
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Trang Công Khai',
    subtitle: 'Quản lý trang giải đấu công khai',
    previewTitle: 'Xem Trước Trang Công Khai',
    tournamentStatus: 'Đang diễn ra',
    teams: 'đội',
    togglePublic: 'Công khai',
    togglePrivate: 'Riêng tư',
    publicUrl: 'URL Công Khai',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    shareSettings: 'Cài Đặt Chia Sẻ',
    whoCanSee: 'Ai có thể xem?',
    everyone: 'Tất cả mọi người',
    registered: 'Người dùng đã đăng ký',
    inviteOnly: 'Chỉ người được mời',
    seoSettings: 'Cài Đặt SEO',
    metaTitle: 'Meta Tiêu Đề',
    metaDesc: 'Meta Mô Tả',
    metaTitlePlaceholder: 'VD: Giải Bóng Đá PNH 2025 - Theo Dõi Trực Tiếp',
    metaDescPlaceholder: 'Mô tả ngắn về giải đấu...',
    previewBtn: 'Mở Xem Trước',
    saveBtn: 'Lưu Cài Đặt',
    saved: 'Đã lưu!',
    publicOn: 'Trang đang công khai',
    privateOn: 'Trang đang ẩn',
    characters: 'ký tự',
  },
  en: {
    title: 'Public Page',
    subtitle: 'Manage your public tournament page',
    previewTitle: 'Public Page Preview',
    tournamentStatus: 'Ongoing',
    teams: 'teams',
    togglePublic: 'Public',
    togglePrivate: 'Private',
    publicUrl: 'Public URL',
    copy: 'Copy',
    copied: 'Copied!',
    shareSettings: 'Share Settings',
    whoCanSee: 'Who can see this?',
    everyone: 'Everyone',
    registered: 'Registered users',
    inviteOnly: 'Invite only',
    seoSettings: 'SEO Settings',
    metaTitle: 'Meta Title',
    metaDesc: 'Meta Description',
    metaTitlePlaceholder: 'E.g.: PNH Football League 2025 - Live Standings',
    metaDescPlaceholder: 'Short description of the tournament...',
    previewBtn: 'Open Preview',
    saveBtn: 'Save Settings',
    saved: 'Saved!',
    publicOn: 'Page is public',
    privateOn: 'Page is private',
    characters: 'characters',
  }
};

const sampleTeams = [
  { name: 'Rồng Vàng FC', logo: '🐉', pts: 25 },
  { name: 'Hùm Xám FC', logo: '🐯', pts: 23 },
  { name: 'Đại Bàng FC', logo: '🦅', pts: 21 },
  { name: 'Bão Lửa FC', logo: '🔥', pts: 18 },
  { name: 'Sao Biển FC', logo: '⭐', pts: 16 },
  { name: 'Thần Sấm FC', logo: '⚡', pts: 14 },
];

const visibilityOptions = ['everyone', 'registered', 'inviteOnly'];

export default function PublicPage({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [isPublic, setIsPublic] = useState(true);
  const [visibility, setVisibility] = useState('everyone');
  const [metaTitle, setMetaTitle] = useState('Giải Bóng Đá PNH 2025 - Xem Trực Tiếp');
  const [metaDesc, setMetaDesc] = useState('Theo dõi giải bóng đá PNH 2025 với bảng xếp hạng trực tiếp, kết quả và lịch thi đấu đầy đủ.');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const publicUrl = 'https://pnhfootball.vn/tournament/pnh-2025';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const input = dm ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  const visibilityLabels = {
    everyone: { label: t.everyone, icon: Globe, color: 'text-emerald-400' },
    registered: { label: t.registered, icon: Users, color: 'text-blue-400' },
    inviteOnly: { label: t.inviteOnly, icon: Lock, color: 'text-yellow-400' },
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={sub}>{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Preview */}
        <div className="xl:col-span-3">
          {/* Public/Private Toggle */}
          <div className={`${card} p-5 mb-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublic ? 'bg-emerald-500/20' : dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {isPublic ? <Globe className="w-5 h-5 text-emerald-400" /> : <Lock className={`w-5 h-5 ${sub}`} />}
                </div>
                <div>
                  <div className={`font-bold ${text}`}>{isPublic ? t.publicOn : t.privateOn}</div>
                  <div className={`text-xs ${sub}`}>{publicUrl}</div>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${isPublic ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : dm ? 'bg-slate-700' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${isPublic ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <Eye className={`w-4 h-4 ${sub}`} />
              <span className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.previewTitle}</span>
            </div>

            {/* Mock browser chrome */}
            <div className={`mx-5 mb-5 rounded-xl overflow-hidden border ${dm ? 'border-slate-700' : 'border-slate-200'} shadow-2xl`}>
              {/* URL bar */}
              <div className={`flex items-center gap-2 px-4 py-2 ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className={`flex-1 mx-3 px-3 py-1.5 rounded-lg text-xs ${dm ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                  🔒 {publicUrl}
                </div>
              </div>

              {/* Page content */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                {/* Tournament Banner */}
                <div className="relative rounded-xl overflow-hidden mb-5 h-28 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.05%3E%3Ccircle cx=30 cy=30 r=15/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-1">⚽</div>
                    <div className="text-white font-black text-lg">PNH FOOTBALL 2025</div>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      {t.tournamentStatus}
                    </span>
                  </div>
                </div>

                {/* Teams grid */}
                <div className="mb-3">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    {language === 'vi' ? 'Các đội tham dự' : 'Participating Teams'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleTeams.map((team, i) => (
                      <div key={i} className="flex flex-col items-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <span className="text-xl mb-1">{team.logo}</span>
                        <span className="text-white text-xs font-semibold text-center leading-tight">{team.name}</span>
                        <span className="text-emerald-400 text-xs font-black mt-1">{team.pts} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Open preview button */}
            <div className="px-5 pb-5">
              <button
                onClick={() => window.open(publicUrl, '_blank')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed transition-all text-sm font-medium
                  border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                <ExternalLink className="w-4 h-4" />
                {t.previewBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Public URL */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-3 flex items-center gap-2`}>
              <Globe className="w-4 h-4" />{t.publicUrl}
            </h2>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${dm ? 'bg-slate-950/70 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <div className={`flex-1 text-xs truncate ${sub}`}>{publicUrl}</div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${copied
                  ? 'bg-emerald-500 text-white'
                  : dm ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          {/* Share Settings */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4 flex items-center gap-2`}>
              <ShieldCheck className="w-4 h-4" />{t.shareSettings}
            </h2>
            <p className={`text-xs ${sub} mb-3`}>{t.whoCanSee}</p>
            <div className="flex flex-col gap-2">
              {visibilityOptions.map(opt => {
                const cfg = visibilityLabels[opt];
                const Icon = cfg.icon;
                const isActive = visibility === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setVisibility(opt)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isActive
                      ? dm ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'
                      : dm ? 'border-slate-700/50 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? cfg.color : sub}`} />
                    <span className={`text-sm font-medium ${isActive ? text : sub}`}>{cfg.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO Settings */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4 flex items-center gap-2`}>
              <Search className="w-4 h-4" />{t.seoSettings}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs font-semibold ${sub} mb-1.5 block flex items-center gap-1`}>
                  <Tag className="w-3.5 h-3.5" />{t.metaTitle}
                </label>
                <input
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  maxLength={60}
                  placeholder={t.metaTitlePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-emerald-500 ${input}`}
                />
                <div className={`text-xs ${sub} mt-1 text-right`}>{metaTitle.length}/60 {t.characters}</div>
              </div>
              <div>
                <label className={`text-xs font-semibold ${sub} mb-1.5 block flex items-center gap-1`}>
                  <AlignLeft className="w-3.5 h-3.5" />{t.metaDesc}
                </label>
                <textarea
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder={t.metaDescPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-emerald-500 resize-none ${input}`}
                />
                <div className={`text-xs ${sub} mt-1 text-right`}>{metaDesc.length}/160 {t.characters}</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-4 font-bold rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 ${saved
              ? 'bg-emerald-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25'
            }`}
          >
            {saved ? <CheckCheck className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            {saved ? t.saved : t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
