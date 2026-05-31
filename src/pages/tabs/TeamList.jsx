import React, { useState } from 'react';
import { Users, Search, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';

const translations = {
  vi: {
    title: 'Danh Sách Đội',
    search: 'Tìm kiếm đội...',
    all: 'Tất cả',
    approved: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Từ chối',
    approve: 'Duyệt',
    reject: 'Từ chối',
    noTeams: 'Không tìm thấy đội nào.',
    teamCount: 'đội',
  },
  en: {
    title: 'Team List',
    search: 'Search teams...',
    all: 'All',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    noTeams: 'No teams found.',
    teamCount: 'teams',
  },
};

const initialTeams = [
  { id: 1, name: 'PNH Esports', emoji: '⚡', status: 'approved' },
  { id: 2, name: 'Dragon Warriors', emoji: '🐉', status: 'approved' },
  { id: 3, name: 'Cyber Phoenix', emoji: '🔥', status: 'pending' },
  { id: 4, name: 'Shadow Wolves', emoji: '🐺', status: 'approved' },
  { id: 5, name: 'Thunder Hawks', emoji: '🦅', status: 'rejected' },
  { id: 6, name: 'Nova Stars', emoji: '⭐', status: 'approved' },
];

const statusConfig = {
  approved: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle2,
  },
  pending: {
    badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    icon: Clock,
  },
  rejected: {
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    icon: XCircle,
  },
};

export default function TeamList({ darkMode = true, language = 'vi' }) {
  const t = translations[language] || translations.vi;

  const [teams, setTeams] = useState(initialTeams);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTeams = teams.filter((team) => {
    const matchSearch = team.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || team.status === filter;
    return matchSearch && matchFilter;
  });

  const handleApprove = (id) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const handleReject = (id) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t)));
  };

  const filterButtons = [
    { key: 'all', label: t.all },
    { key: 'approved', label: t.approved },
    { key: 'pending', label: t.pending },
    { key: 'rejected', label: t.rejected },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Users className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <span className="ml-auto text-sm text-slate-400">
          {teams.length} {t.teamCount}
        </span>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 placeholder-slate-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                filter === btn.key
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t.noTeams}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => {
            const config = statusConfig[team.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={team.id}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 group"
              >
                {/* Team Logo */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-4xl group-hover:border-emerald-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                    {team.emoji}
                  </div>

                  <h3 className="text-lg font-bold text-white">{team.name}</h3>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {t[team.status]}
                  </div>

                  {/* Actions for pending */}
                  {team.status === 'pending' && (
                    <div className="flex gap-2 mt-2 w-full">
                      <button
                        onClick={() => handleApprove(team.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-semibold hover:bg-emerald-500/30 transition-all duration-300"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t.approve}
                      </button>
                      <button
                        onClick={() => handleReject(team.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all duration-300"
                      >
                        <XCircle className="w-4 h-4" />
                        {t.reject}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
