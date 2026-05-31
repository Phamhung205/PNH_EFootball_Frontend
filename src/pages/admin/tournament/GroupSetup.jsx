import React, { useState } from 'react';
import { Layers, Shuffle, Users, CheckCircle2, X, ArrowRight } from 'lucide-react';

const SAMPLE_TEAMS = [
  { id:1, name:'PNH Esports',       emoji:'🦅' },
  { id:2, name:'Dragon Warriors',   emoji:'🐉' },
  { id:3, name:'Phoenix FC',        emoji:'🔥' },
  { id:4, name:'Thunder Bolts',     emoji:'⚡' },
  { id:5, name:'Iron Wolves',       emoji:'🐺' },
  { id:6, name:'Star Raiders',      emoji:'⭐' },
  { id:7, name:'Blue Sharks',       emoji:'🦈' },
  { id:8, name:'Gold Lions',        emoji:'🦁' },
];

const GROUP_COLORS = {
  A: 'from-emerald-500 to-cyan-500',
  B: 'from-blue-500 to-indigo-500',
  C: 'from-purple-500 to-pink-500',
  D: 'from-amber-500 to-orange-500',
  E: 'from-rose-500 to-red-500',
  F: 'from-teal-500 to-green-500',
  G: 'from-violet-500 to-purple-500',
  H: 'from-cyan-500 to-blue-500',
};

const T = {
  vi: {
    title: 'Phân Nhóm Bảng Đấu', numGroups: 'Số Nhóm Bảng',
    unassigned: 'Đội Chưa Phân Bảng', autoAssign: 'Bốc Thăm Tự Động', reset: 'Đặt Lại',
    clickToAdd: 'Nhấn đội để thêm vào bảng', group: 'Bảng', teams: 'đội',
    save: 'Lưu Phân Bảng', selectGroup: 'Chọn bảng đích:',
  },
  en: {
    title: 'Group Stage Setup', numGroups: 'Number of Groups',
    unassigned: 'Unassigned Teams', autoAssign: 'Random Draw', reset: 'Reset',
    clickToAdd: 'Click a team to add to group', group: 'Group', teams: 'teams',
    save: 'Save Groups', selectGroup: 'Select target group:',
  },
};

const GroupSetup = ({ darkMode = true, language = 'vi' }) => {
  const t = T[language] || T.vi;
  const dm = darkMode;

  const [numGroups, setNumGroups] = useState(4);
  const [groups, setGroups] = useState({ A:[], B:[], C:[], D:[] });
  const [unassigned, setUnassigned] = useState([...SAMPLE_TEAMS]);
  const [selected, setSelected] = useState(null); // selected unassigned team

  const card = `rounded-2xl border ${dm ? 'bg-slate-900/70 backdrop-blur-sm border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;

  const changeNumGroups = (n) => {
    const letters = 'ABCDEFGH'.slice(0, n);
    const newGroups = {};
    letters.split('').forEach(l => { newGroups[l] = groups[l] || []; });
    // move teams from removed groups back to unassigned
    const removedTeams = [];
    Object.keys(groups).forEach(k => {
      if (!letters.includes(k)) removedTeams.push(...groups[k]);
    });
    setGroups(newGroups);
    setUnassigned(prev => [...prev, ...removedTeams]);
    setNumGroups(n);
  };

  const assignTeam = (team, groupKey) => {
    setUnassigned(prev => prev.filter(t2 => t2.id !== team.id));
    setGroups(prev => ({ ...prev, [groupKey]: [...prev[groupKey], team] }));
    setSelected(null);
  };

  const removeTeam = (team, groupKey) => {
    setGroups(prev => ({ ...prev, [groupKey]: prev[groupKey].filter(t2 => t2.id !== team.id) }));
    setUnassigned(prev => [...prev, team]);
  };

  const autoAssign = () => {
    const all = [...SAMPLE_TEAMS];
    const shuffled = all.sort(() => Math.random() - 0.5);
    const letters = Object.keys(groups);
    const newGroups = {};
    letters.forEach(l => { newGroups[l] = []; });
    shuffled.forEach((team, i) => { newGroups[letters[i % letters.length]].push(team); });
    setGroups(newGroups);
    setUnassigned([]);
    setSelected(null);
  };

  const reset = () => {
    const letters = 'ABCDEFGH'.slice(0, numGroups);
    const newGroups = {};
    letters.split('').forEach(l => { newGroups[l] = []; });
    setGroups(newGroups);
    setUnassigned([...SAMPLE_TEAMS]);
    setSelected(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.title}</h1>
      </div>

      {/* Controls */}
      <div className={`${card} p-5 flex flex-wrap items-center gap-4`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{t.numGroups}:</span>
          {[2,4,8].map(n => (
            <button key={n} onClick={() => changeNumGroups(n)}
              className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${numGroups === n ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              {n}
            </button>
          ))}
        </div>
        <div className="flex gap-3 ml-auto">
          <button onClick={reset}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
            {t.reset}
          </button>
          <button onClick={autoAssign}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]">
            <Shuffle size={15} />{t.autoAssign}
          </button>
        </div>
      </div>

      {/* Unassigned pool */}
      {unassigned.length > 0 && (
        <div className={`${card} p-5`}>
          <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
            <Users size={15} className="text-slate-400" />{t.unassigned} ({unassigned.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {unassigned.map(team => (
              <button key={team.id}
                onClick={() => setSelected(selected?.id === team.id ? null : team)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  selected?.id === team.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/15'
                    : dm ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                }`}>
                <span>{team.emoji}</span>{team.name}
                {selected?.id === team.id && <ArrowRight size={13} />}
              </button>
            ))}
          </div>
          {selected && (
            <div className={`mt-3 pt-3 border-t flex flex-wrap gap-2 items-center ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`text-xs font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t.selectGroup}</span>
              {Object.keys(groups).map(k => (
                <button key={k} onClick={() => assignTeam(selected, k)}
                  className={`w-10 h-10 rounded-xl font-black text-sm text-white bg-gradient-to-br ${GROUP_COLORS[k]} hover:scale-110 transition-all shadow-sm`}>
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Group cards grid */}
      <div className={`grid gap-4 ${numGroups <= 2 ? 'grid-cols-1 sm:grid-cols-2' : numGroups <= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {Object.keys(groups).map(k => (
          <div key={k} className={`${card} p-4`}>
            {/* Group header */}
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${dm ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-br ${GROUP_COLORS[k]}`}>{k}</div>
              <span className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{groups[k].length} {t.teams}</span>
            </div>
            {/* Teams in group */}
            {groups[k].length === 0 ? (
              <p className={`text-xs text-center py-4 ${dm ? 'text-slate-600' : 'text-slate-400'}`}>{t.clickToAdd}</p>
            ) : (
              <div className="space-y-1.5">
                {groups[k].map(team => (
                  <div key={team.id} className={`flex items-center justify-between px-3 py-2 rounded-xl ${dm ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
                    <span className={`text-xs font-semibold flex items-center gap-2 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      {team.emoji} {team.name}
                    </span>
                    <button onClick={() => removeTeam(team, k)} className="text-red-400 hover:text-red-300 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save */}
      <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
        {t.save}
      </button>
    </div>
  );
};

export default GroupSetup;
