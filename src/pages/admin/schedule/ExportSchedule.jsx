import { useState, useEffect } from 'react';
import {
  FileText, FileSpreadsheet, Download, CheckSquare, Square,
  ChevronDown, Clock, Eye, RefreshCw, FileDown, Loader2,
  CheckCircle2, AlertCircle, Trophy, MapPin, User, Image,
  Calendar, Filter
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Xuất Lịch Thi Đấu',
    subtitle: 'Xuất lịch thi đấu ra file để chia sẻ hoặc in ấn',
    formatTitle: 'Chọn Định Dạng Xuất',
    pdf: 'PDF Document',
    pdfDesc: 'Phù hợp để in ấn và chia sẻ',
    excel: 'Excel Spreadsheet',
    excelDesc: 'Phù hợp để chỉnh sửa và phân tích',
    csv: 'CSV File',
    csvDesc: 'Phù hợp cho dữ liệu thô',
    filterTitle: 'Bộ Lọc',
    allRounds: 'Tất cả vòng đấu',
    round: 'Vòng',
    includeTitle: 'Tùy Chọn Nội Dung',
    includeVenue: 'Bao gồm địa điểm thi đấu',
    includeReferee: 'Bao gồm trọng tài',
    includeLogos: 'Bao gồm logo đội bóng',
    previewTitle: 'Xem Trước',
    matchNo: 'Trận',
    date: 'Ngày',
    homeTeam: 'Đội Nhà',
    awayTeam: 'Đội Khách',
    venue: 'Địa Điểm',
    referee: 'Trọng Tài',
    exportBtn: 'Xuất File',
    exporting: 'Đang xuất...',
    exportDone: 'Xuất thành công!',
    recentTitle: 'Xuất Gần Đây',
    download: 'Tải xuống',
    ago: 'trước',
    minutesAgo: 'phút trước',
    hoursAgo: 'giờ trước',
    daysAgo: 'ngày trước',
    size: 'Kích thước',
    status: 'Trạng thái',
    completed: 'Hoàn thành',
  },
  en: {
    title: 'Export Schedule',
    subtitle: 'Export the match schedule to a file for sharing or printing',
    formatTitle: 'Select Export Format',
    pdf: 'PDF Document',
    pdfDesc: 'Ideal for printing and sharing',
    excel: 'Excel Spreadsheet',
    excelDesc: 'Ideal for editing and analysis',
    csv: 'CSV File',
    csvDesc: 'Ideal for raw data',
    filterTitle: 'Filters',
    allRounds: 'All Rounds',
    round: 'Round',
    includeTitle: 'Content Options',
    includeVenue: 'Include match venue',
    includeReferee: 'Include referee',
    includeLogos: 'Include team logos',
    previewTitle: 'Preview',
    matchNo: 'Match',
    date: 'Date',
    homeTeam: 'Home',
    awayTeam: 'Away',
    venue: 'Venue',
    referee: 'Referee',
    exportBtn: 'Export File',
    exporting: 'Exporting...',
    exportDone: 'Export successful!',
    recentTitle: 'Recent Exports',
    download: 'Download',
    ago: 'ago',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    size: 'Size',
    status: 'Status',
    completed: 'Completed',
  }
};

const sampleMatches = [
  { no: 1, date: '01/06/2025', home: 'Rồng Vàng FC', away: 'Sao Biển FC', venue: 'SVĐ Thống Nhất', referee: 'Nguyễn Văn A' },
  { no: 2, date: '01/06/2025', home: 'Hùm Xám FC', away: 'Đại Bàng FC', venue: 'SVĐ Hòa Xuân', referee: 'Trần Văn B' },
  { no: 3, date: '02/06/2025', home: 'Bão Lửa FC', away: 'Rồng Vàng FC', venue: 'SVĐ Thống Nhất', referee: 'Lê Văn C' },
  { no: 4, date: '03/06/2025', home: 'Sao Biển FC', away: 'Hùm Xám FC', venue: 'SVĐ Hòa Xuân', referee: 'Phạm Văn D' },
  { no: 5, date: '04/06/2025', home: 'Đại Bàng FC', away: 'Bão Lửa FC', venue: 'SVĐ Thống Nhất', referee: 'Nguyễn Văn A' },
];

const recentExports = [
  { name: 'schedule_round1.pdf', format: 'PDF', size: '2.4 MB', time: '5 phút trước', status: 'completed' },
  { name: 'schedule_all.xlsx', format: 'Excel', size: '1.1 MB', time: '2 giờ trước', status: 'completed' },
  { name: 'schedule_round2.csv', format: 'CSV', size: '128 KB', time: '1 ngày trước', status: 'completed' },
  { name: 'schedule_full.pdf', format: 'PDF', size: '3.2 MB', time: '3 ngày trước', status: 'completed' },
];

export default function ExportSchedule({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedRound, setSelectedRound] = useState('all');
  const [includeVenue, setIncludeVenue] = useState(true);
  const [includeReferee, setIncludeReferee] = useState(true);
  const [includeLogos, setIncludeLogos] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setDone(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExporting(false);
          setDone(true);
          setTimeout(() => setDone(false), 3000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const formats = [
    { id: 'pdf', label: t.pdf, desc: t.pdfDesc, icon: FileText, color: 'from-red-500 to-rose-600', bg: dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-300', activeBorder: 'border-red-500' },
    { id: 'excel', label: t.excel, desc: t.excelDesc, icon: FileSpreadsheet, color: 'from-emerald-500 to-green-600', bg: dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-300', activeBorder: 'border-emerald-500' },
    { id: 'csv', label: t.csv, desc: t.csvDesc, icon: FileDown, color: 'from-blue-500 to-cyan-600', bg: dm ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-300', activeBorder: 'border-blue-500' },
  ];

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';

  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const tbl = dm ? 'bg-slate-950/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700';
  const tblHead = dm ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-600';
  const tblRow = dm ? 'border-slate-700/40 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50';

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent`}>
              {t.title}
            </h1>
            <p className={sub}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Format + Filters + Options */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Format selection */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.formatTitle}</h2>
            <div className="flex flex-col gap-3">
              {formats.map(f => {
                const Icon = f.icon;
                const isSelected = selectedFormat === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected
                        ? `${f.bg} ${f.activeBorder} shadow-lg`
                        : dm ? 'border-slate-700/50 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${text}`}>{f.label}</div>
                      <div className={`text-xs ${sub}`}>{f.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4 flex items-center gap-2`}>
              <Filter className="w-4 h-4" />{t.filterTitle}
            </h2>
            <div className="relative">
              <select
                value={selectedRound}
                onChange={e => setSelectedRound(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm appearance-none pr-10 ${dm ? 'bg-slate-950/70 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="all">{t.allRounds}</option>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{t.round} {r}</option>)}
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${sub}`} />
            </div>
          </div>

          {/* Include Options */}
          <div className={`${card} p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.includeTitle}</h2>
            <div className="flex flex-col gap-3">
              {[
                { key: 'venue', label: t.includeVenue, icon: MapPin, value: includeVenue, set: setIncludeVenue },
                { key: 'referee', label: t.includeReferee, icon: User, value: includeReferee, set: setIncludeReferee },
                { key: 'logos', label: t.includeLogos, icon: Image, value: includeLogos, set: setIncludeLogos },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => opt.set(!opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${opt.value ? (dm ? 'bg-emerald-500/10' : 'bg-emerald-50') : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.value ? 'bg-emerald-500/20' : dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Icon className={`w-4 h-4 ${opt.value ? 'text-emerald-400' : sub}`} />
                    </div>
                    <span className={`text-sm font-medium flex-1 text-left ${text}`}>{opt.label}</span>
                    {opt.value
                      ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                      : <Square className={`w-5 h-5 ${sub}`} />
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex flex-col gap-3">
            {exporting && (
              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${text}`}>{t.exporting}</span>
                  <span className={`text-sm font-bold text-emerald-400`}>{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className={`h-2 rounded-full ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-200"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {done && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{t.exportDone}</span>
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {exporting ? t.exporting : t.exportBtn}
            </button>
          </div>
        </div>

        {/* Right column: Preview + Recent Exports */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Preview Table */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.previewTitle}</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className={tblHead}>
                    <th className="px-3 py-3 text-left font-semibold">{t.matchNo}</th>
                    <th className="px-3 py-3 text-left font-semibold">{t.date}</th>
                    <th className="px-3 py-3 text-left font-semibold">{t.homeTeam}</th>
                    <th className="px-3 py-3 text-left font-semibold">{t.awayTeam}</th>
                    {includeVenue && <th className="px-3 py-3 text-left font-semibold">{t.venue}</th>}
                    {includeReferee && <th className="px-3 py-3 text-left font-semibold">{t.referee}</th>}
                  </tr>
                </thead>
                <tbody>
                  {sampleMatches.map(m => (
                    <tr key={m.no} className={`border-t ${tblRow} transition-colors`}>
                      <td className={`px-3 py-3 font-bold ${text}`}>#{m.no}</td>
                      <td className={`px-3 py-3 ${sub}`}>{m.date}</td>
                      <td className={`px-3 py-3 font-medium ${text}`}>{m.home}</td>
                      <td className={`px-3 py-3 font-medium ${text}`}>{m.away}</td>
                      {includeVenue && <td className={`px-3 py-3 ${sub} text-xs`}>{m.venue}</td>}
                      {includeReferee && <td className={`px-3 py-3 ${sub} text-xs`}>{m.referee}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`text-xs ${sub} mt-2 text-center`}>
              {language === 'vi' ? 'Hiển thị 5 trận đấu mẫu' : 'Showing 5 sample matches'}
            </p>
          </div>

          {/* Recent Exports */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-4 h-4 ${sub}`} />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.recentTitle}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {recentExports.map((exp, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${dm ? 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    exp.format === 'PDF' ? 'bg-red-500/20' :
                    exp.format === 'Excel' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                  }`}>
                    {exp.format === 'PDF' ? <FileText className={`w-5 h-5 ${exp.format === 'PDF' ? 'text-red-400' : ''}`} /> :
                     exp.format === 'Excel' ? <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> :
                     <FileDown className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${text}`}>{exp.name}</div>
                    <div className={`text-xs ${sub} flex items-center gap-2 mt-0.5`}>
                      <span>{exp.size}</span>
                      <span>•</span>
                      <span>{exp.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                      ✓ {t.completed}
                    </span>
                    <button className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                      <Download className={`w-4 h-4 ${sub}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
