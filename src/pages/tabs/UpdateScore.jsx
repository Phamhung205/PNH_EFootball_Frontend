import React, { useState } from 'react';
import { Swords, Save, Plus, Minus } from 'lucide-react';

const translations = {
  vi: {
    title: 'Cập Nhật Tỉ Số',
    selectMatch: 'Chọn trận đấu',
    vs: 'VS',
    confirm: 'Xác Nhận Tỉ Số',
    confirmed: 'Đã cập nhật tỉ số!',
    noMatch: 'Chọn một trận đấu để cập nhật tỉ số',
    matchLabel: 'Trận',
  },
  en: {
    title: 'Update Score',
    selectMatch: 'Select match',
    vs: 'VS',
    confirm: 'Confirm Score',
    confirmed: 'Score updated!',
    noMatch: 'Select a match to update scores',
    matchLabel: 'Match',
  },
};

const initialMatches = [
  { id: 1, team1: 'PNH Esports', team2: 'Dragon Warriors', score1: null, score2: null, time: '20:00 - 30/05', emoji1: '⚡', emoji2: '🐉' },
  { id: 2, team1: 'Shadow Wolves', team2: 'Thunder Hawks', score1: 2, score2: 1, time: '21:00 - 30/05', emoji1: '🐺', emoji2: '🦅' },
  { id: 3, team1: 'Cyber Phoenix', team2: 'Nova Stars', score1: null, score2: null, time: '19:00 - 31/05', emoji1: '🔥', emoji2: '⭐' },
];

export default function UpdateScore({ darkMode = true, language = 'vi' }) {
  const t = translations[language] || translations.vi;

  const [matches, setMatches] = useState(initialMatches);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  const updateScore = (team, delta) => {
    if (!selectedMatch) return;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== selectedMatchId) return m;
        const key = team === 1 ? 'score1' : 'score2';
        const current = m[key] ?? 0;
        const newVal = Math.max(0, current + delta);
        return { ...m, [key]: newVal };
      })
    );
    setConfirmed(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Swords className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
      </div>

      {/* Match Selector */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5">
        <label className="block text-sm font-semibold text-slate-300 mb-2">{t.selectMatch}</label>
        <select
          value={selectedMatchId || ''}
          onChange={(e) => {
            setSelectedMatchId(parseInt(e.target.value) || null);
            setConfirmed(false);
          }}
          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 cursor-pointer"
        >
          <option value="">{t.selectMatch}</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {t.matchLabel} {m.id}: {m.team1} vs {m.team2} — {m.time}
            </option>
          ))}
        </select>
      </div>

      {/* Score Display */}
      {selectedMatch ? (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          {/* Match Time */}
          <div className="text-center mb-6">
            <span className="text-sm text-slate-400 bg-slate-800/60 px-4 py-1.5 rounded-full">
              🕐 {selectedMatch.time}
            </span>
          </div>

          {/* Score Board */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Team 1 */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-3xl sm:text-4xl">
                {selectedMatch.emoji1}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white text-center">{selectedMatch.team1}</h3>

              {/* Score Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateScore(1, -1)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-300 active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-slate-950/60 border-2 border-emerald-500/30 rounded-2xl">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {selectedMatch.score1 ?? 0}
                  </span>
                </div>
                <button
                  onClick={() => updateScore(1, 1)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-300 active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <Swords className="w-8 h-8 text-cyan-400" />
              <span className="text-xl sm:text-2xl font-black text-slate-500">{t.vs}</span>
            </div>

            {/* Team 2 */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-3xl sm:text-4xl">
                {selectedMatch.emoji2}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white text-center">{selectedMatch.team2}</h3>

              {/* Score Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateScore(2, -1)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-300 active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-slate-950/60 border-2 border-emerald-500/30 rounded-2xl">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {selectedMatch.score2 ?? 0}
                  </span>
                </div>
                <button
                  onClick={() => updateScore(2, 1)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-300 active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {confirmed && (
              <span className="text-emerald-400 text-sm font-semibold animate-pulse">
                ✓ {t.confirmed}
              </span>
            )}
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              {t.confirm}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t.noMatch}</p>
        </div>
      )}
    </div>
  );
}
