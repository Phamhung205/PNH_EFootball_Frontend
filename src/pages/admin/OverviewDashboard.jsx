import React, { useState, useEffect } from 'react';
import { Trophy, Users, Swords, TrendingUp, TrendingDown, Plus, ArrowUpRight, Activity, Zap, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

const T = {
  vi: {
    title: 'Tổng Quan Hệ Thống', sub: 'Chào mừng trở lại, Phạm Ngọc Hùng!',
    totalTournaments: 'Giải Đấu', totalTeams: 'Đội Tham Dự', matchesToday: 'Trận Hôm Nay', revenue: 'Doanh Thu',
    recentActivity: 'Hoạt Động Gần Đây', quickActions: 'Thao Tác Nhanh',
    activeTournaments: 'Giải Đang Diễn Ra',
    create: 'Tạo Giải Mới', addTeam: 'Thêm Đội', updateScore: 'Cập Nhật Tỉ Số', exportReport: 'Xuất Báo Cáo',
    ongoing: 'Đang diễn ra', upcoming: 'Sắp bắt đầu', completed: 'Hoàn thành',
    teams: 'đội', matches: 'trận',
    viewAll: 'Xem tất cả',
  },
  en: {
    title: 'System Overview', sub: 'Welcome back, Phạm Ngọc Hùng!',
    totalTournaments: 'Tournaments', totalTeams: 'Teams', matchesToday: "Today's Matches", revenue: 'Revenue',
    recentActivity: 'Recent Activity', quickActions: 'Quick Actions',
    activeTournaments: 'Active Tournaments',
    create: 'Create Tournament', addTeam: 'Add Team', updateScore: 'Update Score', exportReport: 'Export Report',
    ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed',
    teams: 'teams', matches: 'matches',
    viewAll: 'View all',
  },
};

const activities = [
  { id:1, icon:'🏆', text:'Giải đấu PNH Super League được tạo thành công',    time:'2 phút trước',  color:'text-emerald-400' },
  { id:2, icon:'👥', text:'8 đội mới đã được thêm vào giải League Mùa 3',       time:'15 phút trước', color:'text-cyan-400' },
  { id:3, icon:'⚽', text:'Kết quả trận PNH Esports 3-1 Dragon Warriors',       time:'1 giờ trước',   color:'text-orange-400' },
  { id:4, icon:'🔀', text:'Bốc thăm chia bảng giải Champions Cup hoàn tất',    time:'2 giờ trước',   color:'text-purple-400' },
  { id:5, icon:'📊', text:'Báo cáo tuần được xuất thành công (PDF, 2.1MB)',     time:'3 giờ trước',   color:'text-blue-400' },
  { id:6, icon:'👤', text:'Tài khoản mới được đăng ký: nguyen.van.a@gmail.com', time:'5 giờ trước',   color:'text-pink-400' },
  { id:7, icon:'💳', text:'Thanh toán gói Pro thành công - 199,000 VND',        time:'Hôm qua',       color:'text-amber-400' },
  { id:8, icon:'🏅', text:'Giải đấu La Liga Season 5 kết thúc',                time:'2 ngày trước',  color:'text-teal-400' },
];

const tournaments = [
  { id:1, name:'PNH Super League', format:'League', teams:20, matches:38, status:'ongoing' },
  { id:2, name:'Champions Cup',    format:'Knockout', teams:16, matches:15, status:'upcoming' },
  { id:3, name:'City League',      format:'Group+KO', teams:12, matches:22, status:'ongoing' },
];

const OverviewDashboard = ({ darkMode = true, language = 'vi' }) => {
  const t = T[language] || T.vi;
  const dm = darkMode;
  const [stats, setStats] = useState({ tournaments: 61381, teams: 341683, matchesToday: 12, revenue: 15200000 });

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl shadow-sm';

  const statusMap = {
    ongoing:   { label: t.ongoing,   cls: dm ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    upcoming:  { label: t.upcoming,  cls: dm ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'  : 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    completed: { label: t.completed, cls: dm ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'     : 'bg-slate-100 text-slate-600 border-slate-300' },
  };

  const statCards = [
    { label: t.totalTournaments, value: stats.tournaments.toLocaleString(), icon: Trophy,    grad:'from-emerald-500 to-cyan-500',  shadow:'shadow-emerald-500/20', change:'+12%' },
    { label: t.totalTeams,       value: stats.teams.toLocaleString(),       icon: Users,     grad:'from-cyan-500 to-blue-500',     shadow:'shadow-cyan-500/20',    change:'+8%'  },
    { label: t.matchesToday,     value: stats.matchesToday,                 icon: Swords,    grad:'from-purple-500 to-pink-500',   shadow:'shadow-purple-500/20',  change:'+3'   },
    { label: t.revenue,          value: '15.2M ₫',                         icon: TrendingUp,grad:'from-amber-500 to-orange-500',  shadow:'shadow-amber-500/20',   change:'+23%' },
  ];

  const quickActions = [
    { label: t.create,      icon: Plus,      grad:'from-emerald-500 to-cyan-500',  tab:'tournament-settings' },
    { label: t.addTeam,     icon: Users,     grad:'from-cyan-500 to-blue-500',     tab:'team-list' },
    { label: t.updateScore, icon: Swords,    grad:'from-orange-500 to-red-500',    tab:'score-input' },
    { label: t.exportReport,icon: BarChart3, grad:'from-purple-500 to-pink-500',   tab:'export-schedule' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.title}</h1>
        <p className={`mt-1 text-sm ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{t.sub}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${card} p-5 relative overflow-hidden group hover:scale-[1.02] transition-all`}>
              <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.grad} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3 shadow-lg ${s.shadow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ↑ {s.change}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className={`${card} p-6 lg:col-span-2`}>
          <h2 className={`text-base font-black mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
            <Activity size={18} className="text-emerald-400" />{t.recentActivity}
          </h2>
          <div className="space-y-3">
            {activities.map(a => (
              <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${dm ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                <span className="text-lg shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{a.text}</p>
                </div>
                <span className={`text-[11px] whitespace-nowrap shrink-0 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Active Tournaments */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={`${card} p-6`}>
            <h2 className={`text-base font-black mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
              <Zap size={18} className="text-yellow-400" />{t.quickActions}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <button key={i} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.03] active:scale-95 ${dm ? 'border-slate-700/50 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70' : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white shadow-sm'}`}>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className={`text-[11px] font-bold text-center leading-tight ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tournaments mini list */}
          <div className={`${card} p-6`}>
            <h2 className={`text-base font-black mb-4 flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
              <Trophy size={18} className="text-amber-400" />{t.activeTournaments}
            </h2>
            <div className="space-y-3">
              {tournaments.map(t2 => {
                const s = statusMap[t2.status];
                return (
                  <div key={t2.id} className={`p-3 rounded-xl border transition-colors ${dm ? 'border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className={`text-sm font-bold truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{t2.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className={`text-[11px] ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{t2.teams} {t.teams} · {t2.matches} {t.matches}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
