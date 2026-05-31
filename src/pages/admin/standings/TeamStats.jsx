import { useState } from 'react';
import {
  BarChart2, Target, Shield, Zap, AlertTriangle,
  TrendingUp, Users, ChevronDown, ArrowLeftRight, Star
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Thống Kê Đội Bóng',
    subtitle: 'Phân tích chi tiết hiệu suất các đội',
    selectTeam: 'Chọn đội bóng',
    compareMode: 'Chế độ so sánh',
    singleMode: 'Chế độ đơn',
    teamA: 'Đội A',
    teamB: 'Đội B',
    winRate: 'Tỷ lệ thắng',
    goalsScored: 'Bàn thắng ghi',
    goalsConceded: 'Bàn thua',
    cleanSheets: 'Không thủng lưới',
    yellowCards: 'Thẻ vàng',
    redCards: 'Thẻ đỏ',
    recentForm: 'Phong Độ Gần Đây',
    topScorers: 'Cầu Thủ Ghi Bàn Nhiều Nhất',
    player: 'Cầu thủ',
    goals: 'Bàn',
    assists: 'Kiến tạo',
    comparison: 'So Sánh Hai Đội',
    selectBoth: 'Chọn hai đội để so sánh',
  },
  en: {
    title: 'Team Statistics',
    subtitle: 'Detailed performance analysis for teams',
    selectTeam: 'Select a team',
    compareMode: 'Compare Mode',
    singleMode: 'Single Mode',
    teamA: 'Team A',
    teamB: 'Team B',
    winRate: 'Win Rate',
    goalsScored: 'Goals Scored',
    goalsConceded: 'Goals Conceded',
    cleanSheets: 'Clean Sheets',
    yellowCards: 'Yellow Cards',
    redCards: 'Red Cards',
    recentForm: 'Recent Form',
    topScorers: 'Top Scorers',
    player: 'Player',
    goals: 'Goals',
    assists: 'Assists',
    comparison: 'Team Comparison',
    selectBoth: 'Select two teams to compare',
  }
};

const teams = [
  {
    id: 1, name: 'Rồng Vàng FC', logo: '🐉',
    stats: { winRate: 80, goalsScored: 24, goalsConceded: 7, cleanSheets: 4, yellowCards: 12, redCards: 1 },
    form: [
      { result: 'W', score: '3-0', opponent: 'Sao Biển FC' },
      { result: 'W', score: '2-1', opponent: 'Hùm Xám FC' },
      { result: 'W', score: '4-0', opponent: 'Hải Long FC' },
      { result: 'D', score: '1-1', opponent: 'Đại Bàng FC' },
      { result: 'W', score: '2-0', opponent: 'Bão Lửa FC' },
    ],
    scorers: [
      { name: 'Nguyễn Văn A', goals: 9, assists: 3 },
      { name: 'Trần Văn B', goals: 7, assists: 5 },
      { name: 'Lê Văn C', goals: 5, assists: 2 },
      { name: 'Phạm Văn D', goals: 3, assists: 4 },
    ]
  },
  {
    id: 2, name: 'Hùm Xám FC', logo: '🐯',
    stats: { winRate: 70, goalsScored: 20, goalsConceded: 8, cleanSheets: 3, yellowCards: 15, redCards: 2 },
    form: [
      { result: 'W', score: '2-0', opponent: 'Núi Lửa FC' },
      { result: 'W', score: '3-1', opponent: 'Thần Sấm FC' },
      { result: 'D', score: '0-0', opponent: 'Rồng Vàng FC' },
      { result: 'W', score: '1-0', opponent: 'Sao Biển FC' },
      { result: 'L', score: '0-2', opponent: 'Đại Bàng FC' },
    ],
    scorers: [
      { name: 'Võ Văn E', goals: 8, assists: 2 },
      { name: 'Đinh Văn F', goals: 6, assists: 4 },
      { name: 'Bùi Văn G', goals: 4, assists: 3 },
    ]
  },
  {
    id: 3, name: 'Đại Bàng FC', logo: '🦅',
    stats: { winRate: 60, goalsScored: 18, goalsConceded: 9, cleanSheets: 3, yellowCards: 10, redCards: 0 },
    form: [
      { result: 'D', score: '1-1', opponent: 'Bão Lửa FC' },
      { result: 'W', score: '3-0', opponent: 'Hải Long FC' },
      { result: 'W', score: '2-0', opponent: 'Hùm Xám FC' },
      { result: 'W', score: '1-0', opponent: 'Thần Sấm FC' },
      { result: 'D', score: '0-0', opponent: 'Rồng Vàng FC' },
    ],
    scorers: [
      { name: 'Hoàng Văn H', goals: 7, assists: 5 },
      { name: 'Ngô Văn I', goals: 6, assists: 1 },
      { name: 'Vũ Văn J', goals: 5, assists: 3 },
    ]
  },
  {
    id: 4, name: 'Bão Lửa FC', logo: '🔥',
    stats: { winRate: 50, goalsScored: 17, goalsConceded: 11, cleanSheets: 2, yellowCards: 18, redCards: 3 },
    form: [
      { result: 'L', score: '1-2', opponent: 'Rồng Vàng FC' },
      { result: 'W', score: '3-1', opponent: 'Núi Lửa FC' },
      { result: 'W', score: '2-0', opponent: 'Hải Long FC' },
      { result: 'D', score: '1-1', opponent: 'Đại Bàng FC' },
      { result: 'W', score: '2-1', opponent: 'Sao Biển FC' },
    ],
    scorers: [
      { name: 'Đặng Văn K', goals: 6, assists: 2 },
      { name: 'Phan Văn L', goals: 5, assists: 3 },
    ]
  },
];

const formBoxColor = (r) => {
  if (r === 'W') return 'bg-emerald-500 text-white border-emerald-600';
  if (r === 'D') return 'bg-yellow-500 text-white border-yellow-600';
  return 'bg-red-500 text-white border-red-600';
};

const StatCard = ({ icon: Icon, label, value, unit, color, dm }) => (
  <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all ${dm ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
      {value}{unit}
    </div>
    <div className={`text-xs font-medium mt-1 text-center ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
  </div>
);

const CompareBar = ({ label, valA, valB, maxVal, colorA, colorB, dm }) => {
  const pctA = maxVal > 0 ? (valA / maxVal) * 100 : 0;
  const pctB = maxVal > 0 ? (valB / maxVal) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold ${colorA}`}>{valA}</span>
        <span className={`text-xs font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        <span className={`text-sm font-bold ${colorB}`}>{valB}</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        <div className="flex-1 flex justify-end">
          <div className="h-full rounded-l-full bg-emerald-500 transition-all duration-500" style={{ width: `${pctA}%` }} />
        </div>
        <div className="flex-1">
          <div className="h-full rounded-r-full bg-cyan-500 transition-all duration-500" style={{ width: `${pctB}%` }} />
        </div>
      </div>
    </div>
  );
};

export default function TeamStats({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [compareMode, setCompareMode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [teamA, setTeamA] = useState(teams[0]);
  const [teamB, setTeamB] = useState(teams[1]);

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const tblHead = dm ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500';
  const tblRow = dm ? 'border-slate-700/40 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50';

  const statsConfig = [
    { key: 'winRate', label: t.winRate, unit: '%', icon: TrendingUp, color: 'bg-gradient-to-br from-emerald-500 to-green-600' },
    { key: 'goalsScored', label: t.goalsScored, unit: '', icon: Target, color: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
    { key: 'goalsConceded', label: t.goalsConceded, unit: '', icon: Shield, color: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { key: 'cleanSheets', label: t.cleanSheets, unit: '', icon: Zap, color: 'bg-gradient-to-br from-purple-500 to-violet-600' },
    { key: 'yellowCards', label: t.yellowCards, unit: '', icon: AlertTriangle, color: 'bg-gradient-to-br from-yellow-500 to-amber-600' },
    { key: 'redCards', label: t.redCards, unit: '', icon: AlertTriangle, color: 'bg-gradient-to-br from-red-500 to-rose-700' },
  ];

  const TeamDropdown = ({ value, onChange, label }) => (
    <div className="relative">
      <label className={`text-xs font-semibold ${sub} mb-1 block`}>{label}</label>
      <select
        value={value?.id || ''}
        onChange={e => onChange(teams.find(t => t.id === +e.target.value))}
        className={`w-full px-4 py-3 rounded-xl border text-sm appearance-none pr-10 ${dm ? 'bg-slate-950/70 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
      >
        {teams.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}
      </select>
      <ChevronDown className={`w-4 h-4 absolute right-3 bottom-3 pointer-events-none ${sub}`} />
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className={sub}>{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${compareMode
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
            : dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          {compareMode ? t.singleMode : t.compareMode}
        </button>
      </div>

      {/* Single Mode */}
      {!compareMode && (
        <>
          {/* Team Select */}
          <div className={`${card} p-5 mb-6`}>
            <div className="max-w-sm">
              <TeamDropdown value={selectedTeam} onChange={setSelectedTeam} label={t.selectTeam} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-4xl">{selectedTeam.logo}</span>
              <div>
                <div className={`text-xl font-black ${text}`}>{selectedTeam.name}</div>
                <div className={`text-sm ${sub}`}>{language === 'vi' ? 'Thống kê tổng quan' : 'Overall statistics'}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {statsConfig.map(s => (
              <StatCard
                key={s.key}
                icon={s.icon}
                label={s.label}
                value={selectedTeam.stats[s.key]}
                unit={s.unit}
                color={s.color}
                dm={dm}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Form */}
            <div className={`${card} p-5`}>
              <h2 className={`font-bold text-sm uppercase tracking-wider ${sub} mb-4 flex items-center gap-2`}>
                <TrendingUp className="w-4 h-4" />{t.recentForm}
              </h2>
              <div className="flex flex-col gap-3">
                {selectedTeam.form.map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${dm ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg border font-bold text-sm flex items-center justify-center flex-shrink-0 ${formBoxColor(f.result)}`}>
                      {f.result}
                    </div>
                    <div className={`font-semibold text-sm ${text}`}>{f.score}</div>
                    <div className={`text-sm ${sub} flex-1`}>vs {f.opponent}</div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      f.result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                      f.result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {language === 'vi'
                        ? (f.result === 'W' ? 'Thắng' : f.result === 'D' ? 'Hòa' : 'Thua')
                        : (f.result === 'W' ? 'Win' : f.result === 'D' ? 'Draw' : 'Loss')
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div className={`${card} p-5`}>
              <h2 className={`font-bold text-sm uppercase tracking-wider ${sub} mb-4 flex items-center gap-2`}>
                <Star className="w-4 h-4" />{t.topScorers}
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className={tblHead}>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">{t.player}</th>
                    <th className="px-3 py-2 text-center">{t.goals}</th>
                    <th className="px-3 py-2 text-center">{t.assists}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeam.scorers.map((s, i) => (
                    <tr key={i} className={`border-t ${tblRow}`}>
                      <td className={`px-3 py-3 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : sub}`}>
                        {i + 1}
                      </td>
                      <td className={`px-3 py-3 font-medium ${text}`}>{s.name}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">{s.goals}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold">{s.assists}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Compare Mode */}
      {compareMode && (
        <>
          <div className={`${card} p-5 mb-6`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TeamDropdown value={teamA} onChange={setTeamA} label={t.teamA} />
              <TeamDropdown value={teamB} onChange={setTeamB} label={t.teamB} />
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{teamA.logo}</span>
                <div>
                  <div className={`font-black ${text}`}>{teamA.name}</div>
                  <div className="w-4 h-1 bg-emerald-500 rounded mt-1" />
                </div>
              </div>
              <ArrowLeftRight className={`w-6 h-6 ${sub}`} />
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className={`font-black ${text}`}>{teamB.name}</div>
                  <div className="w-4 h-1 bg-cyan-500 rounded mt-1 ml-auto" />
                </div>
                <span className="text-3xl">{teamB.logo}</span>
              </div>
            </div>
            {statsConfig.map(s => (
              <CompareBar
                key={s.key}
                label={s.label}
                valA={teamA.stats[s.key]}
                valB={teamB.stats[s.key]}
                maxVal={Math.max(teamA.stats[s.key], teamB.stats[s.key]) * 1.2}
                colorA="text-emerald-400"
                colorB="text-cyan-400"
                dm={dm}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
