import { useState } from 'react';
import {
  Share2, Copy, CheckCheck, Download, Eye, MousePointerClick,
  Facebook, Twitter, Link, QrCode, TrendingUp
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Chia Sẻ & Mã QR',
    subtitle: 'Chia sẻ giải đấu với cộng đồng',
    qrCode: 'Mã QR Giải Đấu',
    qrDesc: 'Quét mã để truy cập trang giải đấu',
    tournamentUrl: 'Đường Dẫn Giải Đấu',
    copyUrl: 'Sao chép',
    copied: 'Đã sao chép!',
    shareTitle: 'Chia Sẻ Qua Mạng Xã Hội',
    facebook: 'Facebook',
    zalo: 'Zalo',
    twitter: 'Twitter / X',
    copyLink: 'Sao Chép Link',
    downloadQR: 'Tải Xuống QR PNG',
    statsTitle: 'Thống Kê Chia Sẻ',
    viewsWeek: 'Lượt xem tuần này',
    clicksWeek: 'Lượt click tuần này',
    totalShares: 'Tổng chia sẻ',
    scanQR: 'Quét QR Code',
  },
  en: {
    title: 'Share & QR Code',
    subtitle: 'Share your tournament with the community',
    qrCode: 'Tournament QR Code',
    qrDesc: 'Scan the code to access the tournament page',
    tournamentUrl: 'Tournament URL',
    copyUrl: 'Copy',
    copied: 'Copied!',
    shareTitle: 'Share on Social Media',
    facebook: 'Facebook',
    zalo: 'Zalo',
    twitter: 'Twitter / X',
    copyLink: 'Copy Link',
    downloadQR: 'Download QR as PNG',
    statsTitle: 'Share Statistics',
    viewsWeek: 'Views this week',
    clicksWeek: 'Clicks this week',
    totalShares: 'Total shares',
    scanQR: 'Scan QR Code',
  }
};

// SVG QR code pattern (decorative)
const QRCodeSVG = ({ size = 200, dm }) => {
  const cellSize = size / 25;
  // Simple pattern generator based on coordinates
  const pattern = Array.from({ length: 25 }, (_, y) =>
    Array.from({ length: 25 }, (_, x) => {
      // Finder patterns (corners)
      if ((x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17)) {
        const inBorder = x === 0 || x === 6 || y === 0 || y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        return inBorder ? 1 : 0;
      }
      // Data area - pseudo random
      const hash = (x * 7 + y * 13 + x * y * 3) % 7;
      return hash < 4 ? 1 : 0;
    })
  );

  const dark = dm ? '#e2e8f0' : '#0f172a';
  const light = 'transparent';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + 2}
              y={y * cellSize + 2}
              width={cellSize - 1}
              height={cellSize - 1}
              fill={dark}
              rx="1"
            />
          ) : null
        )
      )}
    </svg>
  );
};

const shareButtons = [
  {
    id: 'facebook',
    label: 'Facebook',
    bg: 'from-blue-600 to-blue-700',
    hover: 'hover:from-blue-700 hover:to-blue-800',
    shadow: 'shadow-blue-500/30',
    icon: Facebook,
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id: 'zalo',
    label: 'Zalo',
    bg: 'from-teal-500 to-teal-600',
    hover: 'hover:from-teal-600 hover:to-teal-700',
    shadow: 'shadow-teal-500/30',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <text x="2" y="18" fontSize="14" fontWeight="bold" fill="currentColor">Z</text>
      </svg>
    ),
    url: (u) => `https://chat.zalo.me/?shareLink=${encodeURIComponent(u)}`,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    bg: 'from-slate-800 to-slate-900',
    hover: 'hover:from-slate-700 hover:to-slate-800',
    shadow: 'shadow-slate-800/50',
    icon: Twitter,
    url: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=Check+out+PNH+Football+2025!`,
  },
];

export default function ShareQR({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [copied, setCopied] = useState(false);
  const tournamentUrl = 'https://pnhfootball.vn/tournament/pnh-2025';

  const handleCopy = () => {
    navigator.clipboard.writeText(tournamentUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (btn) => {
    window.open(btn.url(tournamentUrl), '_blank', 'width=600,height=400');
  };

  const handleDownloadQR = () => {
    // In production this would generate a real download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'pnh-football-qr.png';
    alert(language === 'vi' ? 'Tính năng tải QR đang phát triển!' : 'QR download coming soon!');
  };

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';

  const stats = [
    { label: t.viewsWeek, value: '1,248', icon: Eye, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { label: t.clicksWeek, value: '386', icon: MousePointerClick, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
    { label: t.totalShares, value: '74', icon: Share2, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/10', textColor: 'text-purple-400' },
  ];

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={sub}>{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: QR Code */}
        <div className="flex flex-col gap-6">
          <div className={`${card} p-6 flex flex-col items-center`}>
            <div className="flex items-center gap-2 mb-4 self-start">
              <QrCode className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.qrCode}</h2>
            </div>

            {/* QR Display */}
            <div className={`relative p-6 rounded-2xl shadow-2xl mb-4 ${dm ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 pointer-events-none" />
              <QRCodeSVG size={200} dm={dm} />
              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <span className="text-lg">⚽</span>
                </div>
              </div>
            </div>

            <p className={`text-sm ${sub} text-center mb-4`}>{t.qrDesc}</p>

            {/* Download Button */}
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 w-full justify-center"
            >
              <Download className="w-4 h-4" />
              {t.downloadQR}
            </button>
          </div>

          {/* Stats */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.statsTitle}</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`flex flex-col items-center p-4 rounded-xl ${s.bg}`}>
                    <Icon className={`w-5 h-5 ${s.textColor} mb-2`} />
                    <div className={`text-xl font-black ${text}`}>{s.value}</div>
                    <div className={`text-xs ${sub} text-center mt-1`}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: URL + Share Buttons */}
        <div className="flex flex-col gap-6">
          {/* URL Copy */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <Link className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.tournamentUrl}</h2>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${dm ? 'bg-slate-950/70 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <div className={`flex-1 text-sm truncate font-mono ${sub}`}>{tournamentUrl}</div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ${copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                }`}
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t.copied : t.copyUrl}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.shareTitle}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {shareButtons.map(btn => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => handleShare(btn)}
                    className={`group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${btn.bg} ${btn.hover} text-white font-bold transition-all duration-200 shadow-lg ${btn.shadow} hover:scale-[1.02] hover:shadow-xl`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left text-base">{btn.label}</span>
                    <Share2 className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}

              {/* Copy Link Button */}
              <button
                onClick={handleCopy}
                className={`group flex items-center gap-4 p-4 rounded-xl border-2 border-dashed font-bold transition-all duration-200 hover:scale-[1.02] ${copied
                  ? dm ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-emerald-500 bg-emerald-50 text-emerald-600'
                  : dm ? 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white' : 'border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${copied ? 'bg-emerald-500/20' : dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {copied ? <CheckCheck className="w-5 h-5 text-emerald-400" /> : <Link className="w-5 h-5" />}
                </div>
                <span className="flex-1 text-left">{t.copyLink}</span>
                <Copy className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          {/* Scan QR hint */}
          <div className={`${card} p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`font-bold text-sm ${text}`}>{t.scanQR}</div>
                <div className={`text-xs ${sub} mt-0.5`}>
                  {language === 'vi'
                    ? 'Sử dụng camera điện thoại để quét mã QR bên trái'
                    : 'Use your phone camera to scan the QR code on the left'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
