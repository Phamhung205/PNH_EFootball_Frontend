import { useState } from 'react';
import {
  History, LogIn, Trophy, Users, Swords, Filter,
  Globe, ChevronLeft, ChevronRight, Calendar, Clock, Search
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Lịch Sử Hoạt Động',
    subtitle: 'Theo dõi tất cả hoạt động của tài khoản',
    filterAll: 'Tất cả',
    filterLogin: 'Đăng nhập',
    filterTournament: 'Giải đấu',
    filterTeam: 'Đội bóng',
    filterMatch: 'Trận đấu',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    ipAddress: 'IP',
    page: 'Trang',
    of: 'của',
    noResults: 'Không có hoạt động nào trong khoảng thời gian này',
    search: 'Tìm kiếm hoạt động...',
  },
  en: {
    title: 'Activity History',
    subtitle: 'Track all account activities',
    filterAll: 'All',
    filterLogin: 'Login',
    filterTournament: 'Tournament',
    filterTeam: 'Team',
    filterMatch: 'Match',
    dateFrom: 'From',
    dateTo: 'To',
    ipAddress: 'IP',
    page: 'Page',
    of: 'of',
    noResults: 'No activities found in this time range',
    search: 'Search activities...',
  }
};

const ITEMS_PER_PAGE = 5;

const sampleActivities = [
  { id: 1, type: 'login', text_vi: 'Đăng nhập thành công từ Chrome / Windows', text_en: 'Successful login from Chrome / Windows', time: '29/05/2025 16:30', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 2, type: 'tournament', text_vi: 'Tạo giải đấu "PNH Championship 2025"', text_en: 'Created tournament "PNH Championship 2025"', time: '29/05/2025 15:10', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 3, type: 'team', text_vi: 'Thêm đội "FC Hà Nội" vào hệ thống', text_en: 'Added team "FC Hà Nội" to the system', time: '29/05/2025 14:45', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 4, type: 'match', text_vi: 'Cập nhật tỉ số trận FC HCM vs FC HN: 2-1', text_en: 'Updated score FC HCM vs FC HN: 2-1', time: '29/05/2025 13:20', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 5, type: 'login', text_vi: 'Đăng xuất khỏi hệ thống', text_en: 'Logged out of the system', time: '28/05/2025 18:00', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 6, type: 'tournament', text_vi: 'Cập nhật thông tin giải "PNH League Q1"', text_en: 'Updated tournament "PNH League Q1"', time: '28/05/2025 11:30', ip: '203.45.xxx.88', device: 'Firefox 126' },
  { id: 7, type: 'team', text_vi: 'Xóa đội "FC Test" khỏi giải đấu', text_en: 'Removed team "FC Test" from tournament', time: '28/05/2025 10:05', ip: '203.45.xxx.88', device: 'Firefox 126' },
  { id: 8, type: 'match', text_vi: 'Tạo lịch thi đấu vòng bảng 16 trận', text_en: 'Created group stage schedule with 16 matches', time: '27/05/2025 16:00', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 9, type: 'login', text_vi: 'Đăng nhập từ thiết bị lạ - Mobile Safari', text_en: 'Login from new device - Mobile Safari', time: '27/05/2025 08:30', ip: '118.70.xxx.55', device: 'Mobile Safari' },
  { id: 10, type: 'tournament', text_vi: 'Kết thúc giải đấu "PNH Spring 2025"', text_en: 'Ended tournament "PNH Spring 2025"', time: '26/05/2025 20:00', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 11, type: 'team', text_vi: 'Cập nhật logo đội "FC Đà Nẵng"', text_en: 'Updated logo for team "FC Đà Nẵng"', time: '26/05/2025 15:20', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 12, type: 'match', text_vi: 'Nhập kết quả 8 trận bán kết', text_en: 'Entered results for 8 semifinal matches', time: '25/05/2025 21:10', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 13, type: 'login', text_vi: 'Đăng nhập thành công', text_en: 'Successful login', time: '25/05/2025 09:00', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 14, type: 'tournament', text_vi: 'Thêm tài trợ cho giải "PNH Cup 2025"', text_en: 'Added sponsor for tournament "PNH Cup 2025"', time: '24/05/2025 14:00', ip: '103.21.xxx.12', device: 'Chrome 124' },
  { id: 15, type: 'team', text_vi: 'Duyệt hồ sơ 3 đội mới tham gia', text_en: 'Approved applications for 3 new teams', time: '24/05/2025 10:45', ip: '103.21.xxx.12', device: 'Chrome 124' },
];

const typeConfig = {
  login: { icon: LogIn, color_dm: 'text-blue-400 bg-blue-500/15 border-blue-500/30', color_light: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
  tournament: { icon: Trophy, color_dm: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', color_light: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
  team: { icon: Users, color_dm: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', color_light: 'text-cyan-600 bg-cyan-50 border-cyan-200', dot: 'bg-cyan-400' },
  match: { icon: Swords, color_dm: 'text-purple-400 bg-purple-500/15 border-purple-500/30', color_light: 'text-purple-600 bg-purple-50 border-purple-200', dot: 'bg-purple-400' },
};

const FILTERS = [
  { key: 'all', label_vi: 'Tất cả', label_en: 'All' },
  { key: 'login', label_vi: 'Đăng nhập', label_en: 'Login', icon: LogIn },
  { key: 'tournament', label_vi: 'Giải đấu', label_en: 'Tournament', icon: Trophy },
  { key: 'team', label_vi: 'Đội bóng', label_en: 'Team', icon: Users },
  { key: 'match', label_vi: 'Trận đấu', label_en: 'Match', icon: Swords },
];

export default function ActivityHistory({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = sampleActivities.filter(a => {
    const matchType = activeFilter === 'all' || a.type === activeFilter;
    const text = language === 'vi' ? a.text_vi : a.text_en;
    const matchSearch = !search || text.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setPage(1);
  };

  const inputCls = `px-3 py-2 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500/50
    ${dm
      ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'}`;

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
          <History className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`rounded-2xl border p-4 mb-6 space-y-4
        ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => {
            const FIcon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-md'
                    : dm
                      ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
              >
                {FIcon && <FIcon className="w-3 h-3" />}
                {language === 'vi' ? f.label_vi : f.label_en}
              </button>
            );
          })}
        </div>

        {/* Search + Date Range */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              className={`${inputCls} w-full pl-9`}
              placeholder={t.search}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
            <input type="date" className={inputCls} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className={`text-sm ${dm ? 'text-slate-500' : 'text-slate-400'}`}>→</span>
            <input type="date" className={inputCls} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={`rounded-2xl border overflow-hidden mb-6
        ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Filter className={`w-10 h-10 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-sm font-medium ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{t.noResults}</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: dm ? 'rgb(51 65 85 / 0.5)' : 'rgb(241 245 249)' }}>
            {paginated.map((act, idx) => {
              const cfg = typeConfig[act.type] || typeConfig.login;
              const Icon = cfg.icon;
              const text = language === 'vi' ? act.text_vi : act.text_en;
              const colorCls = dm ? cfg.color_dm : cfg.color_light;
              return (
                <div key={act.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${dm ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${colorCls}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{text}</p>
                    <div className={`flex flex-wrap items-center gap-3 mt-1.5 text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {act.time}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {act.ip}</span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {act.device}
                      </span>
                    </div>
                  </div>

                  {/* Type Badge */}
                  <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${colorCls}`}>
                    {language === 'vi'
                      ? FILTERS.find(f => f.key === act.type)?.label_vi
                      : FILTERS.find(f => f.key === act.type)?.label_en
                    }
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.page} <span className="font-bold text-emerald-400">{page}</span> {t.of} {totalPages}
            {' '}({filtered.length} {language === 'vi' ? 'kết quả' : 'results'})
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border font-bold transition-all
                ${page === 1
                  ? dm ? 'border-slate-700 text-slate-600 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : dm ? 'border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
                  ${p === page
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-md'
                    : dm
                      ? 'border-slate-700 text-slate-400 hover:border-slate-500'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-xl border font-bold transition-all
                ${page === totalPages
                  ? dm ? 'border-slate-700 text-slate-600 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : dm ? 'border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
