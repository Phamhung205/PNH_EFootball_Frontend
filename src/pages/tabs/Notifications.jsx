import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Thông Báo Lịch Thi Đấu',
    all: 'Tất Cả',
    upcoming: 'Sắp Diễn Ra',
    completed: 'Đã Hoàn Thành',
    announcements: 'Thông Báo',
    vs: 'vs',
    venue: 'Sân',
    statusUpcoming: 'Sắp diễn ra',
    statusCompleted: 'Đã kết thúc',
    statusInfo: 'Thông báo',
    score: 'Tỉ số',
    noNotifications: 'Không có thông báo nào.',
  },
  en: {
    title: 'Match Schedule Notifications',
    all: 'All',
    upcoming: 'Upcoming',
    completed: 'Completed',
    announcements: 'Announcements',
    vs: 'vs',
    venue: 'Venue',
    statusUpcoming: 'Upcoming',
    statusCompleted: 'Completed',
    statusInfo: 'Info',
    score: 'Score',
    noNotifications: 'No notifications found.',
  },
};

const sampleNotifications = [
  {
    id: 1,
    type: 'match',
    team1: 'PNH Esports',
    team2: 'Dragon Warriors',
    date: '30/05/2026',
    time: '20:00',
    venue: 'Arena A',
    status: 'upcoming',
  },
  {
    id: 2,
    type: 'match',
    team1: 'Shadow Wolves',
    team2: 'Cyber Phoenix',
    date: '31/05/2026',
    time: '21:00',
    venue: 'Arena B',
    status: 'upcoming',
  },
  {
    id: 3,
    type: 'result',
    team1: 'Thunder Hawks',
    team2: 'Nova Stars',
    date: '29/05/2026',
    time: '19:00',
    score: '3-1',
    venue: 'Arena A',
    status: 'completed',
  },
  {
    id: 4,
    type: 'announcement',
    title: 'Thay đổi lịch thi đấu',
    message: 'Trận PNH vs Dragon được dời sang 20:30',
    date: '28/05/2026',
    status: 'info',
  },
];

const filterTabs = (t) => [
  { key: 'all', label: t.all },
  { key: 'upcoming', label: t.upcoming },
  { key: 'completed', label: t.completed },
  { key: 'announcements', label: t.announcements },
];

function StatusBadge({ status, t }) {
  const config = {
    upcoming: {
      bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: t.statusUpcoming,
    },
    completed: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: t.statusCompleted,
    },
    info: {
      bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: <Info className="w-3.5 h-3.5" />,
      label: t.statusInfo,
    },
  };
  const c = config[status] || config.info;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${c.bg}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function TimelineDot({ status }) {
  const colors = {
    upcoming: 'bg-cyan-500 shadow-cyan-500/50',
    completed: 'bg-emerald-500 shadow-emerald-500/50',
    info: 'bg-purple-500 shadow-purple-500/50',
  };
  return (
    <div className="flex flex-col items-center mr-4 md:mr-6">
      <div
        className={`w-4 h-4 rounded-full shadow-lg ${colors[status] || colors.info} ring-4 ring-slate-900`}
      />
      <div className="w-0.5 flex-1 bg-slate-700/50 mt-2" />
    </div>
  );
}

function NotificationCard({ notification, t }) {
  const n = notification;

  if (n.type === 'announcement') {
    return (
      <div className="flex">
        <TimelineDot status={n.status} />
        <div className="flex-1 pb-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold text-base">{n.title}</h3>
              </div>
              <StatusBadge status={n.status} t={t} />
            </div>
            <p className="text-slate-400 text-sm mb-3">{n.message}</p>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{n.date}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <TimelineDot status={n.status} />
      <div className="flex-1 pb-8">
        <div
          className={`bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 transition-all duration-300 group ${
            n.status === 'upcoming'
              ? 'hover:border-cyan-500/40'
              : 'hover:border-emerald-500/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-white font-bold text-lg">{n.team1}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                  {t.vs}
                </span>
                <span className="text-white font-bold text-lg">{n.team2}</span>
              </div>
              {n.score && (
                <div className="mt-2">
                  <span className="text-emerald-400 font-black text-xl">
                    {n.score}
                  </span>
                </div>
              )}
            </div>
            <StatusBadge status={n.status} t={t} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{n.date}</span>
            </div>
            {n.time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{n.time}</span>
              </div>
            )}
            {n.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>
                  {t.venue}: {n.venue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications({ darkMode = true, language = 'vi' }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const t = translations[language] || translations.vi;

  const filtered = sampleNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return n.status === 'upcoming';
    if (activeFilter === 'completed') return n.status === 'completed';
    if (activeFilter === 'announcements') return n.type === 'announcement';
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} p-4 md:p-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Bell className="w-8 h-8 text-emerald-400 animate-[ring_2s_ease-in-out_infinite]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterTabs(t).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeFilter === tab.key
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700/50 hover:border-emerald-500/30 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationCard key={n.id} notification={n} t={t} />
            ))
          )}
        </div>
      </div>

      {/* Bell ring animation */}
      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(6deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(2deg); }
          60% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
