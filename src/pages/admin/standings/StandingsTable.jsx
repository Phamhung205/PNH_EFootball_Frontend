import { useState, useEffect } from 'react';
import {
  Trophy, ChevronDown, Info, TrendingUp, Shield,
  Star, Medal, Award, RefreshCw, AlertCircle
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Bảng Xếp Hạng',
    subtitle: 'Xếp hạng các đội bóng trong giải đấu',
    all: 'Tất cả',
    round: 'Vòng đấu',
    allRounds: 'Tất cả vòng',
    pos: '#',
    team: 'Đội',
    played: 'P',
    wins: 'T',
    draws: 'H',
    losses: 'B',
    goalsFor: 'BT',
    goalsAgainst: 'BB',
    goalDiff: 'HS',
    points: 'Đ',
    form: 'Phong Độ',
    tiebreaker: 'Quy tắc phân hạng',
    tiebreakerDesc: 'Nếu bằng điểm: 1. Hiệu số bàn thắng, 2. Số bàn thắng ghi được, 3. Đối đầu trực tiếp',
    loading: 'Đang tải...',
    error: 'Lỗi tải dữ liệu',
    retry: 'Thử lại',
    groups: ['Tất cả', 'Bảng A', 'Bảng B', 'Bảng C'],
  },
  en: {
    title: 'Standings',
    subtitle: 'Tournament team standings',
    all: 'All',
    round: 'Round',
    allRounds: 'All Rounds',
    pos: '#',
    team: 'Team',
    played: 'P',
    wins: 'W',
    draws: 'D',
    losses: 'L',
    goalsFor: 'GF',
    goalsAgainst: 'GA',
    goalDiff: 'GD',
    points: 'PTS',
    form: 'Form',
    tiebreaker: 'Tiebreaker Rules',
    tiebreakerDesc: 'If equal points: 1. Goal difference, 2. Goals scored, 3. Head-to-head',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    groups: ['All', 'Group A', 'Group B', 'Group C'],
  }
};

const sampleTeams = [
  { id: 1, name: 'Rồng Vàng FC', logo: '🐉', group: 'A', P: 10, W: 8, D: 1, L: 1, GF: 24, GA: 7, PTS: 25, form: ['W','W','W','D','W'] },
  { id: 2, name: 'Hùm Xám FC', logo: '🐯', group: 'A', P: 10, W: 7, D: 2, L: 1, GF: 20, GA: 8, PTS: 23, form: ['W','W','D','W','L'] },
  { id: 3, name: 'Đại Bàng FC', logo: '🦅', group: 'B', P: 10, W: 6, D: 3, L: 1, GF: 18, GA: 9, PTS: 21, form: ['D','W','W','W','D'] },
  { id: 4, name: 'Bão Lửa FC', logo: '🔥', group: 'B', P: 10, W: 5, D: 3, L: 2, GF: 17, GA: 11, PTS: 18, form: ['L','W','W','D','W'] },
  { id: 5, name: 'Sao Biển FC', logo: '⭐', group: 'A', P: 10, W: 4, D: 4, L: 2, GF: 15, GA: 13, PTS: 16, form: ['D','D','W','L','W'] },
  { id: 6, name: 'Thần Sấm FC', logo: '⚡', group: 'C', P: 10, W: 4, D: 2, L: 4, GF: 14, GA: 16, PTS: 14, form: ['L','W','D','L','W'] },
  { id: 7, name: 'Núi Lửa FC', logo: '🌋', group: 'C', P: 10, W: 2, D: 3, L: 5, GF: 10, GA: 20, PTS: 9, form: ['L','L','D','W','L'] },
  { id: 8, name: 'Hải Long FC', logo: '🌊', group: 'C', P: 10, W: 1, D: 2, L: 7, GF: 7, GA: 26, PTS: 5, form: ['L','L','L','D','L'] },
];

const formDotColor = (result) => {
  if (result === 'W') return 'bg-emerald-500 text-white';
  if (result === 'D') return 'bg-yellow-500 text-white';
  return 'bg-red-500 text-white';
};

const positionStyle = (pos) => {
  if (pos === 1) return 'border-l-4 border-yellow-500';
  if (pos === 2) return 'border-l-4 border-slate-400';
  if (pos === 3) return 'border-l-4 border-amber-700';
  return '';
};

export default function StandingsTable({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [activeGroup, setActiveGroup] = useState(0);
  const [selectedRound, setSelectedRound] = useState('all');
  const [showTooltip, setShowTooltip] = useState(false);
  const [standings, setStandings] = useState(sampleTeams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://localhost:7051/api/standings');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setStandings(data);
    } catch {
      // Use sample data on error
      setStandings(sampleTeams);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStandings(); }, []);

  const filteredTeams = activeGroup === 0
    ? standings
    : standings.filter(t => t.group === ['A','B','C'][activeGroup - 1]);

  const sorted = [...filteredTeams].sort((a, b) => b.PTS - a.PTS || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF);

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const tblHead = dm ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500';
  const tblRow = dm ? 'border-slate-700/40 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50';
  const pillActive = 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/25';
  const pillInactive = dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className={sub}>{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={fetchStandings}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.loading : t.retry}
        </button>
      </div>

      <div className={`${card} p-6`}>
        {/* Group + Round filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {t.groups.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveGroup(i)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${activeGroup === i ? pillActive : pillInactive}`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={selectedRound}
              onChange={e => setSelectedRound(e.target.value)}
              className={`px-4 py-2 rounded-xl border text-sm appearance-none pr-10 ${dm ? 'bg-slate-950/70 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            >
              <option value="all">{t.allRounds}</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{t.round} {r}</option>)}
            </select>
            <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${sub}`} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${tblHead} rounded-t-xl`}>
                <th className="px-3 py-3 text-left w-10">{t.pos}</th>
                <th className="px-3 py-3 text-left min-w-[180px]">{t.team}</th>
                <th className="px-3 py-3 text-center">{t.played}</th>
                <th className="px-3 py-3 text-center">{t.wins}</th>
                <th className="px-3 py-3 text-center">{t.draws}</th>
                <th className="px-3 py-3 text-center">{t.losses}</th>
                <th className="px-3 py-3 text-center">{t.goalsFor}</th>
                <th className="px-3 py-3 text-center">{t.goalsAgainst}</th>
                <th className="px-3 py-3 text-center">{t.goalDiff}</th>
                <th className="px-3 py-3 text-center font-black text-emerald-400">{t.points}</th>
                <th className="px-3 py-3 text-center min-w-[120px]">{t.form}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, idx) => {
                const pos = idx + 1;
                const gd = team.GF - team.GA;
                return (
                  <tr key={team.id} className={`border-t ${tblRow} transition-colors ${positionStyle(pos)}`}>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg">
                        {pos === 1 && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                        {pos === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                        {pos === 3 && <Award className="w-5 h-5 text-amber-700" />}
                        {pos > 3 && <span className={`text-sm font-bold ${sub}`}>{pos}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.logo}</span>
                        <div>
                          <div className={`font-bold text-sm ${text}`}>{team.name}</div>
                          <div className={`text-xs ${sub}`}>
                            {language === 'vi' ? 'Bảng' : 'Group'} {team.group}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 py-4 text-center font-medium ${sub}`}>{team.P}</td>
                    <td className="px-3 py-4 text-center font-bold text-emerald-400">{team.W}</td>
                    <td className="px-3 py-4 text-center font-bold text-yellow-400">{team.D}</td>
                    <td className="px-3 py-4 text-center font-bold text-red-400">{team.L}</td>
                    <td className={`px-3 py-4 text-center font-medium ${text}`}>{team.GF}</td>
                    <td className={`px-3 py-4 text-center font-medium ${text}`}>{team.GA}</td>
                    <td className={`px-3 py-4 text-center font-bold ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : sub}`}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-sm min-w-[40px] text-center">
                        {team.PTS}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1 justify-center">
                        {team.form.map((r, fi) => (
                          <div key={fi} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${formDotColor(r)}`}>
                            {r}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tiebreaker tooltip */}
        <div className="mt-4 flex justify-end">
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${dm ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'}`}
            >
              <Info className="w-3.5 h-3.5" />
              {t.tiebreaker}
            </button>
            {showTooltip && (
              <div className={`absolute bottom-full right-0 mb-2 p-3 rounded-xl text-xs max-w-xs z-10 shadow-2xl ${dm ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'}`}>
                {t.tiebreakerDesc}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border-l-4 border-yellow-500"></div>
            <span className={`text-xs ${sub}`}>{language === 'vi' ? 'Vô địch' : 'Champion'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border-l-4 border-slate-400"></div>
            <span className={`text-xs ${sub}`}>{language === 'vi' ? 'Hạng nhì' : '2nd Place'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border-l-4 border-amber-700"></div>
            <span className={`text-xs ${sub}`}>{language === 'vi' ? 'Hạng ba' : '3rd Place'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
