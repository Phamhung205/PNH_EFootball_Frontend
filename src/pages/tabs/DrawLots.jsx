import React, { useState } from 'react';
import { Shuffle, Trophy, Sparkles } from 'lucide-react';

const translations = {
  vi: {
    title: 'Bốc Thăm Chia Bảng',
    groups: 'Số Bảng',
    drawButton: 'Bốc Thăm',
    drawing: 'Đang bốc thăm...',
    group: 'Bảng',
    reset: 'Bốc Lại',
    done: 'Hoàn thành bốc thăm!',
    noTeams: 'Chưa có kết quả',
  },
  en: {
    title: 'Group Stage Draw',
    groups: 'Number of Groups',
    drawButton: 'Draw Lots',
    drawing: 'Drawing...',
    group: 'Group',
    reset: 'Redraw',
    done: 'Draw complete!',
    noTeams: 'No results yet',
  },
};

const sampleTeams = [
  { id: 1, name: 'PNH Esports', emoji: '⚡' },
  { id: 2, name: 'Dragon Warriors', emoji: '🐉' },
  { id: 3, name: 'Cyber Phoenix', emoji: '🔥' },
  { id: 4, name: 'Shadow Wolves', emoji: '🐺' },
  { id: 5, name: 'Thunder Hawks', emoji: '🦅' },
  { id: 6, name: 'Nova Stars', emoji: '⭐' },
  { id: 7, name: 'Iron Titans', emoji: '🛡️' },
  { id: 8, name: 'Blaze United', emoji: '💥' },
];

const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function DrawLots({ darkMode = true, language = 'vi' }) {
  const t = translations[language] || translations.vi;

  const [numGroups, setNumGroups] = useState(2);
  const [drawing, setDrawing] = useState(false);
  const [groups, setGroups] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleDraw = () => {
    setDrawing(true);
    setGroups(null);
    setShowConfetti(false);

    setTimeout(() => {
      const shuffled = shuffleArray(sampleTeams);
      const result = {};
      for (let i = 0; i < numGroups; i++) {
        result[groupLabels[i]] = [];
      }
      shuffled.forEach((team, idx) => {
        const groupIdx = idx % numGroups;
        result[groupLabels[groupIdx]].push(team);
      });

      setGroups(result);
      setDrawing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 2000);
  };

  const handleReset = () => {
    setGroups(null);
    setShowConfetti(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6 relative overflow-hidden">
      {/* Confetti CSS */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confettiPop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.3); }
        }
        @keyframes spinDraw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          animation: confettiFall 3s ease-in-out forwards;
        }
        .group-card-enter {
          animation: confettiPop 0.5s ease-out forwards;
        }
      `}</style>

      {/* Confetti Particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'][i % 6],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Shuffle className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
        {/* Group Count Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <label className="text-sm font-semibold text-slate-300">{t.groups}</label>
          <select
            value={numGroups}
            onChange={(e) => setNumGroups(parseInt(e.target.value))}
            disabled={drawing}
            className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 cursor-pointer"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
          </select>
        </div>

        {/* Draw Button */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={groups ? handleReset : handleDraw}
            disabled={drawing}
            className="relative group"
          >
            <div
              className={`flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-10 py-5 rounded-2xl text-lg shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] ${
                drawing ? 'opacity-80 cursor-not-allowed' : ''
              }`}
              style={!groups && !drawing ? { animation: 'pulseGlow 2s ease-in-out infinite' } : {}}
            >
              {drawing ? (
                <>
                  <Shuffle className="w-6 h-6" style={{ animation: 'spinDraw 0.6s linear infinite' }} />
                  {t.drawing}
                </>
              ) : groups ? (
                <>
                  <Shuffle className="w-6 h-6" />
                  {t.reset}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  {t.drawButton}
                </>
              )}
            </div>
          </button>

          {showConfetti && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold animate-bounce">
              <Trophy className="w-5 h-5" />
              {t.done}
            </div>
          )}
        </div>
      </div>

      {/* Group Results */}
      {groups && (
        <div className={`grid gap-4 ${
          numGroups <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
          numGroups <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {Object.entries(groups).map(([label, teamsList], idx) => (
            <div
              key={label}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 group-card-enter hover:border-emerald-500/30 transition-all duration-300"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  {t.group} {label}
                </h3>
              </div>

              <div className="space-y-2">
                {teamsList.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/50"
                  >
                    <span className="text-xl">{team.emoji}</span>
                    <span className="text-sm font-medium text-slate-300">{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!groups && !drawing && (
        <div className="text-center py-8 text-slate-500">
          <Shuffle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t.noTeams}</p>
        </div>
      )}
    </div>
  );
}
