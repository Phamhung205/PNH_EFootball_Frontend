import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Settings, Users, Calendar, Trophy, Plus, Image as ImageIcon,
  CheckCircle2, Save, ArrowLeft, Loader2, Trash2, RefreshCw
} from 'lucide-react';
import Schedule from './Schedule.jsx';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
  return data;
}

// Normalize từ C# PascalCase
function normalizeTeam(t) {
  return {
    id: t.teamId ?? t.TeamId ?? t.id,
    name: t.name ?? t.Name,
    logo: t.logoUrl ?? t.LogoUrl ?? '',
  };
}
function normalizeStanding(s) {
  return {
    id: s.teamId ?? s.TeamId,
    rank: s.rank ?? s.Rank,
    name: s.teamName ?? s.TeamName ?? '',
    logo: s.logoUrl ?? s.LogoUrl ?? '',
    P: s.played ?? s.Played ?? 0,
    W: s.won ?? s.Won ?? 0,
    D: s.drawn ?? s.Drawn ?? 0,
    L: s.lost ?? s.Lost ?? 0,
    GF: s.goalsFor ?? s.GoalsFor ?? 0,
    GA: s.goalsAgainst ?? s.GoalsAgainst ?? 0,
    GD: s.goalDiff ?? s.GoalDiff ?? 0,
    Pts: s.points ?? s.Points ?? 0,
  };
}

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  vi: {
    title: 'Bảng Điều Khiển Giải Đấu', editTournament: 'Chỉnh Sửa Giải',
    teams: 'Đội Thi Đấu', schedule: 'Lịch Thi Đấu', standings: 'Bảng Xếp Hạng',
    generalInfo: 'Thông Tin Chung',
    tName: 'Tên Giải Đấu', format: 'Thể Thức', status: 'Trạng Thái', desc: 'Mô Tả',
    saveChanges: 'Lưu Thay Đổi', manageTeams: 'Quản Lý Đội Bóng',
    addNewTeam: 'Thêm Đội Mới', teamName: 'Tên Đội', logo: 'Link Logo (URL)',
    addTeam: 'Thêm Vào Giải', approved: 'Đã duyệt', noTeams: 'Chưa có đội nào.',
    back: 'Quay lại', saving: 'Đang lưu...', noMatches: 'Chưa có kết quả trận đấu nào.',
    deleteTeam: 'Xóa đội', refresh: 'Làm mới', saved: 'Đã lưu!', deleted: 'Đã xóa!',
    tournamentId: 'ID Giải Đấu (để trống = tạo mới)',
  },
  en: {
    title: 'Tournament Dashboard', editTournament: 'Edit Tournament',
    teams: 'Teams', schedule: 'Schedule', standings: 'Standings',
    generalInfo: 'General Information',
    tName: 'Tournament Name', format: 'Format', status: 'Status', desc: 'Description',
    saveChanges: 'Save Changes', manageTeams: 'Manage Teams',
    addNewTeam: 'Add New Team', teamName: 'Team Name', logo: 'Logo URL',
    addTeam: 'Add to Tournament', approved: 'Approved', noTeams: 'No teams yet.',
    back: 'Back', saving: 'Saving...', noMatches: 'No match results yet.',
    deleteTeam: 'Delete team', refresh: 'Refresh', saved: 'Saved!', deleted: 'Deleted!',
    tournamentId: 'Tournament ID (empty = create new)',
  },
};

const SIDEBAR_TABS = [
  { id: 'info', label: 'editTournament', Icon: Settings },
  { id: 'teams', label: 'teams', Icon: Users },
  { id: 'schedule', label: 'schedule', Icon: Calendar },
  { id: 'standings', label: 'standings', Icon: Trophy },
];

const inp = 'w-full rounded-xl px-4 py-3 bg-slate-950/70 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition-all text-sm';
const sel = `${inp} appearance-none`;

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white text-sm font-black shadow-2xl animate-bounce">
      <CheckCircle2 size={16} />{msg}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ManageTournament({ onNavigate, darkMode = true, language = 'vi', tournamentId: propTournamentId }) {
  const t = T[language] || T.vi;
  const [activeTab, setActiveTab] = useState('info');
  const [toast, setToast] = useState('');
  const [globalError, setGlobalError] = useState('');

  const [tournamentId, setTournamentId] = useState(
  (propTournamentId && /^\d+$/.test(String(propTournamentId))) ? String(propTournamentId) : ''
  );
  const [info, setInfo] = useState({ name: '', format: 'League', status: 'Sắp khởi tranh', description: '' });
  const [infoLoading, setInfoLoading] = useState(false);

  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLogo, setNewLogo] = useState('');
  const [addingTeam, setAddingTeam] = useState(false);

  const [matches, setMatches] = useState([]);
  const [apiStandings, setApiStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const loadTournament = useCallback(async () => {
    if (!tournamentId) return;
    setInfoLoading(true); setGlobalError('');
    try {
      const data = await apiFetch(`/api/tournaments/${tournamentId}`);
      const d = data.data || data;
      setInfo({
        name: d.name ?? d.Name ?? '',
        format: d.format ?? d.Format ?? 'League',
        status: d.status ?? d.Status ?? 'Sắp khởi tranh',
        description: d.description ?? d.Description ?? '',
      });
    } catch (e) { setGlobalError(e.message); }
    finally { setInfoLoading(false); }
  }, [tournamentId]);

  const loadTeams = useCallback(async () => {
    if (!tournamentId) return;
    setTeamsLoading(true);
    try {
      const data = await apiFetch(`/api/tournaments/${tournamentId}/teams`);
      const list = data.data || data || [];
      setTeams(list.map(normalizeTeam));
    } catch (e) { setGlobalError(e.message); }
    finally { setTeamsLoading(false); }
  }, [tournamentId]);

  const loadMatches = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const data = await apiFetch(`/api/tournaments/${tournamentId}/matches`);
      const list = data.data || data || [];
      setMatches(list.map(m => ({
        id: m.matchId ?? m.MatchId,
        homeId: m.homeTeamId ?? m.HomeTeamId,
        awayId: m.awayTeamId ?? m.AwayTeamId,
        homeScore: (m.homeScore ?? m.HomeScore) ?? null,
        awayScore: (m.awayScore ?? m.AwayScore) ?? null,
        status: (m.status ?? m.Status) === 'Completed' ? 'done' : 'pending',
      })));
    } catch (e) { console.warn('Load matches:', e.message); }
  }, [tournamentId]);

  const loadStandings = useCallback(async () => {
    if (!tournamentId) return;
    setStandingsLoading(true);
    try {
      const data = await apiFetch(`/api/tournaments/${tournamentId}/standings`);
      const list = data.data || data || [];
      setApiStandings(list.map(normalizeStanding));
    } catch (e) { console.warn('Standings:', e.message); setApiStandings([]); }
    finally { setStandingsLoading(false); }
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) { loadTournament(); loadTeams(); loadMatches(); }
  }, [tournamentId]);

  useEffect(() => {
    if (activeTab === 'standings' && tournamentId) loadStandings();
  }, [activeTab, tournamentId]);

  const handleSaveInfo = async () => {
    setInfoLoading(true);
    try {
      if (tournamentId) {
        await apiFetch(`/api/tournaments/${tournamentId}`, { method: 'PUT', body: JSON.stringify(info) });
      } else {
        const res = await apiFetch('/api/tournaments', { method: 'POST', body: JSON.stringify(info) });
        const d = res.data || res;
        const newId = d.tournamentId ?? d.TournamentId ?? d.id;
        if (newId) setTournamentId(String(newId));
      }
      showToast(t.saved);
    } catch (e) { setGlobalError(e.message); }
    finally { setInfoLoading(false); }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newName || !tournamentId) return;
    setAddingTeam(true);
    try {
      await apiFetch(`/api/tournaments/${tournamentId}/teams`, {
        method: 'POST',
        body: JSON.stringify({ name: newName, logoUrl: newLogo }),
      });
      setNewName(''); setNewLogo('');
      await loadTeams();
      showToast(t.saved);
    } catch (e) { setGlobalError(e.message); }
    finally { setAddingTeam(false); }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Xóa đội này?')) return;
    try {
      await apiFetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      await loadTeams();
      showToast(t.deleted);
    } catch (e) { setGlobalError(e.message); }
  };

  const handleTournamentUpdate = useCallback((updated) => {
    if (updated?.matches) {
      setMatches(updated.matches);
      loadStandings();
    }
  }, [loadStandings]);

  const tournament = useMemo(() => ({
    id: tournamentId, name: info.name, teams, matches,
  }), [tournamentId, info.name, teams, matches]);

  const standings = apiStandings;
  const cardCls = 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl';

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <Toast msg={toast} />

      <button onClick={() => onNavigate?.('home')}
        className="flex items-center gap-2 mb-6 text-slate-400 hover:text-emerald-400 font-semibold text-sm transition-colors group">
        <span className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 transition-colors">
          <ArrowLeft size={16} />
        </span>{t.back}
      </button>

      {globalError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {globalError}</span>
          <button onClick={() => setGlobalError('')} className="text-red-400 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
          <Settings size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">{t.title}</h1>
          <p className="text-emerald-400 text-sm font-semibold">{info.name || '—'}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl">
        <aside className="flex md:flex-col gap-2 md:w-52 shrink-0 overflow-x-auto md:overflow-visible">
          {SIDEBAR_TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}>
                <Icon size={17} className={active ? 'text-emerald-400' : 'text-slate-500'} />{t[label]}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0" key={activeTab} style={{ animation: 'fadeInUp .25s ease-out both' }}>

          {/* INFO */}
          {activeTab === 'info' && (
            <div className={`${cardCls} max-w-2xl`}>
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Settings size={20} className="text-emerald-400" />{t.generalInfo}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.tournamentId}</label>
                  <input value={tournamentId} onChange={e => setTournamentId(e.target.value)} placeholder="1" className={inp} onBlur={loadTournament} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.tName}</label>
                  <input value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="PNH Super League" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.format}</label>
                    <select value={info.format} onChange={e => setInfo(p => ({ ...p, format: e.target.value }))} className={sel}>
                      <option value="League">League</option>
                      <option value="Knockout">Knockout</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.status}</label>
                    <select value={info.status} onChange={e => setInfo(p => ({ ...p, status: e.target.value }))} className={sel}>
                      <option>Sắp khởi tranh</option>
                      <option>Đang diễn ra</option>
                      <option>Hoàn thành</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.desc}</label>
                  <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} rows={3} className={`${inp} resize-none`} placeholder="Mô tả giải đấu..." />
                </div>
                <button onClick={handleSaveInfo} disabled={infoLoading}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 disabled:opacity-60">
                  {infoLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {infoLoading ? t.saving : t.saveChanges}
                </button>
              </div>
            </div>
          )}

          {/* TEAMS */}
          {activeTab === 'teams' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users size={20} className="text-cyan-400" />{t.manageTeams} ({teams.length})
                </h2>
                <button onClick={loadTeams} disabled={teamsLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                  <RefreshCw size={13} className={teamsLoading ? 'animate-spin' : ''} />{t.refresh}
                </button>
              </div>

              {!tournamentId && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                  ⚠️ Nhập ID giải đấu ở tab "Chỉnh Sửa Giải" trước khi thêm đội.
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${cardCls} h-max`}>
                  <h3 className="font-bold text-white mb-4">{t.addNewTeam}</h3>
                  <form onSubmit={handleAddTeam} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.teamName}</label>
                      <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="PNH Esports" className={inp} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.logo}</label>
                      <input value={newLogo} onChange={e => setNewLogo(e.target.value)} placeholder="https://..." className={inp} />
                    </div>
                    <button type="submit" disabled={addingTeam || !tournamentId}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                      {addingTeam ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}{t.addTeam}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                  {teamsLoading ? (
                    <div className="col-span-2 flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-emerald-400" /></div>
                  ) : teams.length === 0 ? (
                    <p className="text-slate-500 italic col-span-2">{t.noTeams}</p>
                  ) : teams.map(team => (
                    <div key={team.id} className="bg-slate-900/70 border border-slate-700/50 hover:border-emerald-500/40 rounded-2xl p-4 flex items-center gap-4 transition-all group">
                      <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-2xl">
                        {team.logo ? (team.logo.startsWith('http') ? <img src={team.logo} alt="logo" className="w-full h-full object-contain" /> : team.logo) : <ImageIcon size={22} className="text-slate-500" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-white truncate">{team.name}</h4>
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5"><CheckCircle2 size={11} />{t.approved}</p>
                      </div>
                      <button onClick={() => handleDeleteTeam(team.id)} title={t.deleteTeam}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            !tournamentId ? (
              <div className={`${cardCls} text-center py-12`}>
                <p className="text-amber-400 font-semibold">⚠️ Nhập ID giải đấu ở tab "Chỉnh Sửa Giải" trước.</p>
              </div>
            ) : (
              <Schedule tournament={tournament} darkMode={darkMode} language={language} isAdmin={true} onUpdate={handleTournamentUpdate} />
            )
          )}

          {/* STANDINGS */}
          {activeTab === 'standings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy size={20} className="text-amber-400" />{t.standings}
                </h2>
                <button onClick={loadStandings} disabled={standingsLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                  <RefreshCw size={13} className={standingsLoading ? 'animate-spin' : ''} />{t.refresh}
                </button>
              </div>

              {standingsLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-emerald-400" /></div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm border-collapse">
                      <thead>
                        <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                          <th className="px-4 py-3.5 text-center w-10">#</th>
                          <th className="px-4 py-3.5 text-left">Đội Bóng</th>
                          <th className="px-3 py-3.5 text-center">Trận</th>
                          <th className="px-3 py-3.5 text-center">T</th>
                          <th className="px-3 py-3.5 text-center">H</th>
                          <th className="px-3 py-3.5 text-center">B</th>
                          <th className="px-3 py-3.5 text-center">BT/BB</th>
                          <th className="px-3 py-3.5 text-center">HS</th>
                          <th className="px-3 py-3.5 text-center text-yellow-400">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {standings.length === 0 ? (
                          <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500 italic">{t.noMatches}</td></tr>
                        ) : standings.map((row, idx) => {
                          let borderCls = '', bgCls = '';
                          if (idx === 0)      { borderCls = 'border-l-4 border-l-yellow-500'; bgCls = 'bg-yellow-500/5'; }
                          else if (idx === 1) { borderCls = 'border-l-4 border-l-slate-400';  bgCls = 'bg-slate-400/5'; }
                          else if (idx === 2) { borderCls = 'border-l-4 border-l-amber-700';  bgCls = 'bg-amber-700/5'; }
                          else if (idx >= standings.length - 3 && standings.length >= 6) { borderCls = 'border-l-4 border-l-red-500'; bgCls = 'bg-red-500/5'; }
                          return (
                            <tr key={row.id} className={`transition-colors hover:bg-slate-800/50 ${borderCls} ${bgCls}`}>
                              <td className="px-4 py-4 text-center font-black text-slate-400 text-sm">{idx + 1}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-lg">
                                    {row.logo ? (row.logo.startsWith('http') ? <img src={row.logo} alt="" className="w-full h-full object-contain" /> : row.logo) : '⚽'}
                                  </div>
                                  <span className="font-bold text-white text-sm">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-slate-300">{row.P}</td>
                              <td className="px-3 py-4 text-center font-black text-emerald-400">{row.W}</td>
                              <td className="px-3 py-4 text-center font-semibold text-yellow-400">{row.D}</td>
                              <td className="px-3 py-4 text-center font-black text-red-400">{row.L}</td>
                              <td className="px-3 py-4 text-center text-slate-400">{row.GF}-{row.GA}</td>
                              <td className={`px-3 py-4 text-center font-bold ${row.GD > 0 ? 'text-emerald-400' : row.GD < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                {row.GD > 0 ? '+' : ''}{row.GD}
                              </td>
                              <td className="px-3 py-4 text-center">
                                <span className="inline-block px-3 py-1 rounded-lg bg-black/40 text-yellow-400 font-black text-sm border border-yellow-500/15">{row.Pts}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}