import React, { useState, useEffect } from 'react';
import { Swords, CheckCircle2, Clock, RotateCcw, AlertTriangle, Filter } from 'lucide-react';

const ScoreInput = ({ darkMode, language, teams = [], matches = [], groups = {}, onMatchUpdate }) => {
  const dm = darkMode;
  const [filter, setFilter]       = useState('all');
  const [localScores, setLocalScores] = useState({});

  // Initialize local scores from matches
  useEffect(() => {
    const init = {};
    matches.forEach(m => { init[m.id] = { home: m.homeScore ?? '', away: m.awayScore ?? '' }; });
    setLocalScores(init);
  }, [matches]);

  const getTeam = id => teams.find(t => t.id === id);

  const filtered = matches.filter(m => {
    if (filter === 'all')     return true;
    if (filter === 'pending') return m.status === 'pending';
    if (filter === 'live')    return m.status === 'live';
    if (filter === 'done')    return m.status === 'done';
    return true;
  });

  const handleUpdate = (matchId) => {
    const s = localScores[matchId] || {};
    const h = parseInt(s.home, 10);
    const a = parseInt(s.away, 10);
    if (isNaN(h) || isNaN(a)) return;
    onMatchUpdate(matchId, h, a, 'done');
  };

  const handleReset = (matchId) => {
    setLocalScores(prev => ({ ...prev, [matchId]: { home: '', away: '' } }));
    onMatchUpdate(matchId, null, null, 'pending');
  };

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inp  = dm ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-100 border-slate-200 text-slate-900';
  const dim  = dm ? 'text-slate-400' : 'text-slate-500';

  const StatusBadge = ({ status }) => {
    const cfg = {
      pending: { label: 'Chưa Đấu',      cls: dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500' },
      live:    { label: 'Đang Diễn Ra',   cls: 'bg-emerald-500/20 text-emerald-400 animate-pulse' },
      done:    { label: 'Hoàn Thành',     cls: 'bg-blue-500/20 text-blue-400' },
    };
    const c = cfg[status] || cfg.pending;
    return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>;
  };

  const TeamDisplay = ({ teamId, side }) => {
    const team = getTeam(teamId);
    if (!team) return <div className={`text-sm ${dim}`}>Đội chưa xác định</div>;
    return (
      <div className={`flex items-center gap-2 ${side === 'away' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${team.color || '#10b981'}22` }}>
          {team.logo
            ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain rounded-xl" onError={e => { e.target.style.display='none'; }}/>
            : '⚽'}
        </div>
        <div>
          <p className={`text-sm font-black leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{team.name}</p>
          {team.abbr && <p className={`text-[10px] font-bold ${dim}`}>{team.abbr}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-5" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Swords size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Nhập Kết Quả</h1>
            <p className={`text-sm ${dim}`}>{matches.length} trận · {matches.filter(m=>m.status==='done').length} hoàn thành</p>
          </div>
        </div>
        {/* Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[{id:'all',label:'Tất Cả'},{id:'pending',label:'Chưa Đấu'},{id:'live',label:'Đang Diễn Ra'},{id:'done',label:'Hoàn Thành'}].map(f => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f.id
                ? 'bg-orange-500 text-white shadow'
                : dm ? 'bg-white/8 text-slate-400 hover:text-white hover:bg-white/12' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* No matches */}
      {matches.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center ${card}`}>
          <Swords size={48} className={`mx-auto mb-4 ${dim}`} />
          <p className={`text-lg font-black mb-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Chưa có lịch thi đấu</p>
          <p className={`text-sm ${dim}`}>Chia bảng và tạo lịch ở mục "Chia Bảng" trước.</p>
        </div>
      )}

      {/* Warning no teams */}
      {matches.length > 0 && teams.length === 0 && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className={`text-sm font-medium ${dm ? 'text-amber-300' : 'text-amber-700'}`}>Không tìm thấy thông tin đội bóng.</p>
        </div>
      )}

      {/* Match cards */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {/* Group by round/group */}
          {(() => {
            const rounds = [...new Set(filtered.map(m => m.round || 'Vòng 1'))];
            return rounds.map(round => {
              const roundMatches = filtered.filter(m => (m.round || 'Vòng 1') === round);
              return (
                <div key={round}>
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 px-1 ${dim}`}>{round}</p>
                  <div className="space-y-2">
                    {roundMatches.map(match => {
                      const score = localScores[match.id] || { home: '', away: '' };
                      const isDone = match.status === 'done';
                      return (
                        <div key={match.id} className={`rounded-2xl border p-4 transition-all ${isDone ? (dm ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50 border-blue-200') : card}`}>
                          <div className="flex items-center gap-3">
                            {/* Home team */}
                            <div className="flex-1 min-w-0">
                              <TeamDisplay teamId={match.homeId} side="home" />
                            </div>

                            {/* Score inputs */}
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="number" min={0} max={99} value={score.home}
                                onChange={e => setLocalScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
                                disabled={isDone}
                                className={`w-12 h-12 rounded-xl border text-center text-xl font-black outline-none transition-all disabled:opacity-60 ${inp}`}
                              />
                              <span className={`text-lg font-black ${dim}`}>–</span>
                              <input
                                type="number" min={0} max={99} value={score.away}
                                onChange={e => setLocalScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
                                disabled={isDone}
                                className={`w-12 h-12 rounded-xl border text-center text-xl font-black outline-none transition-all disabled:opacity-60 ${inp}`}
                              />
                            </div>

                            {/* Away team */}
                            <div className="flex-1 min-w-0 flex justify-end">
                              <TeamDisplay teamId={match.awayId} side="away" />
                            </div>
                          </div>

                          {/* Actions row */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={match.status} />
                              {match.group && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dm ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                  Bảng {match.group}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!isDone ? (
                                <button onClick={() => handleUpdate(match.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors">
                                  <CheckCircle2 size={13} /> Cập Nhật
                                </button>
                              ) : (
                                <button onClick={() => handleReset(match.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${dm ? 'bg-white/10 hover:bg-white/15 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                  <RotateCcw size={13} /> Reset
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {filtered.length === 0 && matches.length > 0 && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <Filter size={32} className={`mx-auto mb-3 ${dim}`} />
          <p className={`text-sm font-medium ${dim}`}>Không có trận nào với bộ lọc này.</p>
        </div>
      )}
    </div>
  );
};
export default ScoreInput;
