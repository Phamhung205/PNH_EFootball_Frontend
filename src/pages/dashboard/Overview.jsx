import React from 'react';
import { Trophy, Users, Swords, BarChart3, Plus, ChevronRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient, darkMode }) => (
  <div
    className={`relative rounded-2xl p-5 flex flex-col gap-2 overflow-hidden border transition-all duration-200 hover:scale-[1.02] ${
      darkMode
        ? 'bg-white/5 border-white/10 text-white'
        : 'bg-white border-slate-200 shadow-md text-slate-800'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-3xl font-bold mt-1">{value}</div>
    <div className={`text-sm font-medium ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>{label}</div>
    <div
      className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold ${
        darkMode ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-400'
      }`}
    >
      --
    </div>
  </div>
);

const statusMap = {
  active: { label: 'Đang Diễn Ra', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  pending: { label: 'Chờ Khởi Động', cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  finished: { label: 'Kết Thúc', cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
};

const formatMap = {
  'group-stage': 'Đấu Bảng',
  'knockout': 'Loại Trực Tiếp',
  'league': 'Giải Đường Dài',
  'hybrid': 'Hỗn Hợp',
};

const TournamentCard = ({ tournament, darkMode, onTab }) => {
  const st = statusMap[tournament.status] || statusMap['pending'];
  const fmtLabel = formatMap[tournament.format] || tournament.format;

  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${
        darkMode
          ? 'bg-white/5 border-white/10 text-white'
          : 'bg-white border-slate-200 shadow text-slate-800'
      }`}
    >
      {/* Logo / Emoji */}
      <div className="flex items-center gap-3">
        {tournament.logo ? (
          <img
            src={tournament.logo}
            alt="logo"
            className="w-12 h-12 rounded-xl object-cover border border-white/20"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center ${tournament.logo ? 'hidden' : 'flex'}`}
        >
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{tournament.name}</h3>
          {fmtLabel && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                darkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {fmtLabel}
            </span>
          )}
        </div>
      </div>

      {/* Teams count */}
      <div className={`flex items-center gap-1.5 text-sm ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>
        <Users className="w-4 h-4" />
        <span>{tournament.teamCount ?? 0} đội</span>
      </div>

      {/* Status + button */}
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${st.cls}`}>
          {st.label}
        </span>
        <button
          onClick={() => onTab('teams')}
          className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Xem Chi Tiết <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Overview = ({ darkMode, language, tournaments = [], onCreateNew, onTab }) => {
  const totalTeams = tournaments.reduce((sum, t) => sum + (t.teamCount || 0), 0);
  const activeCount = tournaments.filter((t) => t.status === 'active').length;

  const stats = [
    { icon: Trophy, label: 'Tổng Giải Đấu', value: tournaments.length, gradient: 'from-emerald-500 to-teal-400' },
    { icon: Users, label: 'Tổng Đội', value: totalTeams, gradient: 'from-blue-500 to-indigo-500' },
    { icon: Swords, label: 'Trận Hôm Nay', value: 0, gradient: 'from-orange-500 to-amber-400' },
    { icon: BarChart3, label: 'Đang Diễn Ra', value: activeCount, gradient: 'from-teal-500 to-cyan-400' },
  ];

  return (
    <div className={`min-h-full p-4 md:p-6 flex flex-col gap-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} darkMode={darkMode} />
        ))}
      </div>

      {/* Tournament Grid */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Danh Sách Giải Đấu
        </h2>
        {tournaments.length === 0 ? (
          <div
            className={`rounded-2xl border p-12 flex flex-col items-center gap-4 ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <p className={`text-base font-semibold ${darkMode ? 'text-white/70' : 'text-slate-500'}`}>
              Chưa có giải đấu nào
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Tạo Giải Đấu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} darkMode={darkMode} onTab={onTab} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Thao Tác Nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onCreateNew}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Trophy className="w-7 h-7" />
            <span>Tạo Giải Mới</span>
          </button>
          <button
            onClick={() => onTab('teams')}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl font-semibold border hover:opacity-90 active:scale-95 transition-all ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-700 shadow hover:bg-slate-50'
            }`}
          >
            <Users className="w-7 h-7 text-blue-400" />
            <span>Thêm Đội</span>
          </button>
          <button
            onClick={() => onTab('scores')}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl font-semibold border hover:opacity-90 active:scale-95 transition-all ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-700 shadow hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-7 h-7 text-orange-400" />
            <span>Xem Kết Quả</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
