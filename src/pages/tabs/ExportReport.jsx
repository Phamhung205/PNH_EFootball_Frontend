import React, { useState } from 'react';
import { FileText, Download, Table, Calendar, Clock, CheckCircle } from 'lucide-react';

const ExportReport = ({ darkMode = true, language = 'vi' }) => {
  const [reportType, setReportType] = useState('standings');
  const [format, setFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-29');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  const translations = {
    vi: {
      title: 'Xuất Báo Cáo',
      subtitle: 'Tải xuống báo cáo giải đấu dưới nhiều định dạng',
      reportType: 'Loại Báo Cáo',
      standings: 'Bảng Xếp Hạng',
      results: 'Kết Quả Trận Đấu',
      teamStats: 'Thống Kê Đội',
      fullReport: 'Báo Cáo Đầy Đủ',
      format: 'Định Dạng',
      dateRange: 'Khoảng Thời Gian',
      from: 'Từ',
      to: 'Đến',
      export: 'Xuất Báo Cáo',
      exporting: 'Đang xuất...',
      done: 'Hoàn tất!',
      preview: 'Xem Trước',
      recentExports: 'Xuất Gần Đây',
    },
    en: {
      title: 'Export Report',
      subtitle: 'Download tournament reports in multiple formats',
      reportType: 'Report Type',
      standings: 'Standings',
      results: 'Match Results',
      teamStats: 'Team Stats',
      fullReport: 'Full Report',
      format: 'Format',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      export: 'Export Report',
      exporting: 'Exporting...',
      done: 'Complete!',
      preview: 'Preview',
      recentExports: 'Recent Exports',
    },
  };

  const t = translations[language];

  const reportTypes = [
    { id: 'standings', icon: '🏆', label: t.standings },
    { id: 'results', icon: '⚽', label: t.results },
    { id: 'teamStats', icon: '📊', label: t.teamStats },
    { id: 'fullReport', icon: '📋', label: t.fullReport },
  ];

  const formats = [
    { id: 'pdf', label: 'PDF', icon: '📄', color: 'text-red-400' },
    { id: 'excel', label: 'Excel', icon: '📊', color: 'text-emerald-400' },
    { id: 'csv', label: 'CSV', icon: '📃', color: 'text-blue-400' },
  ];

  const recentExports = [
    { name: 'BXH_PNH_League_S1.pdf', date: '28/05/2026', size: '1.2 MB', type: 'standings' },
    { name: 'KetQua_Vong1.xlsx', date: '27/05/2026', size: '845 KB', type: 'results' },
    { name: 'ThongKe_Full.pdf', date: '25/05/2026', size: '3.1 MB', type: 'fullReport' },
  ];

  const previewData = [
    { rank: 1, team: 'PNH Esports', p: 5, w: 4, d: 1, l: 0, pts: 13 },
    { rank: 2, team: 'Dragon Warriors', p: 5, w: 3, d: 1, l: 1, pts: 10 },
    { rank: 3, team: 'Shadow Wolves', p: 5, w: 3, d: 0, l: 2, pts: 9 },
    { rank: 4, team: 'Cyber Phoenix', p: 5, w: 2, d: 1, l: 2, pts: 7 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setProgress(0);
    setExportDone(false);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportDone(true);
          setTimeout(() => setExportDone(false), 3000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
          <FileText size={28} className="text-emerald-400" />
          {t.title}
        </h2>
        <p className="text-slate-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.reportType}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                    reportType === type.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <span className={`text-xs font-bold ${reportType === type.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Format + Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Format */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.format}</h3>
              <div className="flex gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
                      format === f.id
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg block mb-1">{f.icon}</span>
                    <span className={`text-xs font-bold ${format === f.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                {t.dateRange}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold">{t.from}</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">{t.to}</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Table size={14} className="text-emerald-400" />
              {t.preview}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs">#</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-bold text-xs">{language === 'vi' ? 'Đội' : 'Team'}</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-bold text-xs">P</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-bold text-xs">W</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-bold text-xs">D</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-bold text-xs">L</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-bold text-xs">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row) => (
                    <tr key={row.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-bold">{row.rank}</td>
                      <td className="py-3 px-3 text-white font-semibold">{row.team}</td>
                      <td className="py-3 px-3 text-center text-slate-300">{row.p}</td>
                      <td className="py-3 px-3 text-center text-emerald-400">{row.w}</td>
                      <td className="py-3 px-3 text-center text-yellow-400">{row.d}</td>
                      <td className="py-3 px-3 text-center text-red-400">{row.l}</td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-black text-base">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Export Action + Recent */}
        <div className="space-y-6">
          {/* Export Button */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <Download size={28} className="text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">
                {reportTypes.find((r) => r.id === reportType)?.label} • {format.toUpperCase()}
              </p>
            </div>

            {/* Progress Bar */}
            {(isExporting || exportDone) && (
              <div className="mb-4">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      exportDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 text-center font-semibold ${exportDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {exportDone ? (
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle size={14} /> {t.done}
                    </span>
                  ) : (
                    `${t.exporting} ${Math.round(Math.min(progress, 100))}%`
                  )}
                </p>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                isExporting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
              {isExporting ? t.exporting : t.export}
            </button>
          </div>

          {/* Recent Exports */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={14} className="text-emerald-400" />
              {t.recentExports}
            </h3>
            <div className="space-y-3">
              {recentExports.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-lg shrink-0">
                    {file.name.endsWith('.pdf') ? '📄' : '📊'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.date} • {file.size}</p>
                  </div>
                  <Download size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReport;
