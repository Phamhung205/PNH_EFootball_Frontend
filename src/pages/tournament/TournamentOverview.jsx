import React, { useMemo, useState } from 'react';
import { tournamentApi } from '../../services/api';
import RegisterButton from './RegisterButton';
import TournamentChat from './TournamentChat';
import { Trophy, Users, Swords, BarChart3, ArrowRight, Star, Shield, Play, CheckCircle, X, MessageCircle } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function computeStandings(teams, matches) {
  const table = {};
  teams.forEach((t) => {
    table[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  });
  matches.forEach((m) => {
    if (m.status !== 'done') return;
    const home = table[m.homeId];
    const away = table[m.awayId];
    if (!home || !away) return;
    const hs = Number(m.homeScore ?? 0);
    const as_ = Number(m.awayScore ?? 0);
    home.played++; away.played++;
    home.gf += hs; home.ga += as_;
    away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; home.pts += 3; away.lost++; }
    else if (hs < as_) { away.won++; away.pts += 3; home.lost++; }
    else { home.drawn++; away.drawn++; home.pts += 1; away.pts += 1; }
  });
  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );
}

function renderTeamLogo(team, fallbackColor) {
  const logo = team?.logo || '';
  const isImage = logo.startsWith('http') || logo.startsWith('data:');
  if (isImage) {
    return <img src={logo} alt={team.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: fallbackColor }}>
      {logo || team?.name?.[0] || '?'}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, darkMode }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 border transition-all duration-300 hover:scale-105 ${
      darkMode ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-gray-200 shadow-md'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${color}`} />
    </div>
  );
}

function QuickAction({ icon: Icon, label, tab, onNavigate, darkMode }) {
  return (
    <button onClick={() => onNavigate(tab)}
      className={`group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ArrowRight size={16} className={`transition-transform duration-200 group-hover:translate-x-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
    </button>
  );
}

function MatchRow({ match, teams, darkMode }) {
  const home = teams.find((t) => String(t.id) === String(match.homeId));
  const away = teams.find((t) => String(t.id) === String(match.awayId));
  if (!home || !away) return null;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${darkMode ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 w-5/12 justify-end">
        <span className={`text-sm font-semibold text-right ${darkMode ? 'text-white' : 'text-gray-800'}`}>{home.name}</span>
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">{renderTeamLogo(home, '#3b82f6')}</div>
      </div>
      <div className="flex items-center gap-1 mx-2">
        <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{match.homeScore ?? 0}</span>
        <span className={`text-xs font-bold px-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>-</span>
        <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{match.awayScore ?? 0}</span>
      </div>
      <div className="flex items-center gap-2 w-5/12">
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">{renderTeamLogo(away, '#ef4444')}</div>
        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{away.name}</span>
      </div>
    </div>
  );
}

function TopTeamCard({ rank, entry, darkMode }) {
  const medals = ['🥇', '🥈', '🥉'];
  const gradients = [
    'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    'from-gray-400/20 to-slate-400/10 border-gray-400/30',
    'from-orange-500/20 to-amber-600/10 border-orange-500/30',
  ];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${gradients[rank]} transition-all`}>
      <span className="text-xl">{medals[rank]}</span>
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">{renderTeamLogo(entry.team, '#6366f1')}</div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.team.name}</p>
        <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {entry.played} trận · {entry.won}W {entry.drawn}D {entry.lost}L
        </p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.pts}</p>
        <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>điểm</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TournamentOverview({ tournament, user, darkMode, language, onNavigate, onUpdate }) {
  const teams = tournament?.teams || [];
  const matches = tournament?.matches || [];

  // Chi Admin/BTC moi thay nut "Bat Dau Giai"
  const roleRaw = (user?.role || '').toLowerCase();
  const isAdminBtc = roleRaw === 'admin' || roleRaw === 'btc';

  // Mo/dong box chat
  const [showChat, setShowChat] = useState(false);

  // Giai chia bang (GroupStage) -> moi hien nut "Chia Bang"
  const isGroupStage = (tournament?.format || '').toString().toLowerCase().includes('group');

  const [activating, setActivating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleActivateTournament = async () => {
    if (!tournament?.id) return;
    setActivating(true);
    try {
      await tournamentApi.updateStatus(tournament.id, 'Đang diễn ra');
      showToast('Giải đấu đã được kích hoạt!');
      if (onUpdate) onUpdate({ ...tournament, status: 'Đang diễn ra' });
    } catch (error) {
      console.error('Lỗi kích hoạt giải đấu:', error);
      showToast('Lỗi kích hoạt: ' + error.message);
    } finally {
      setActivating(false);
    }
  };

  const totalMatches = matches.length;
  const doneMatches = matches.filter((m) => m.status === 'done').length;
  const pendingMatches = totalMatches - doneMatches;

  const recentMatches = useMemo(
    () => [...matches].filter((m) => m.status === 'done').slice(-3).reverse(),
    [matches]
  );

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);
  const top3 = standings.slice(0, 3);

  const statusColors = {
    'Đang diễn ra': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Sắp khởi tranh': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Hoàn thành': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  const formatLabels = {
    'League': 'Giải Đường Dài',
    'Knockout': 'Loại Trực Tiếp',
    'GroupStage_Knockout': 'Vòng Bảng + Knockout',
    'group': 'Đấu Bảng', 'knockout': 'Loại Trực Tiếp', 'league': 'Giải Đường Dài', 'hybrid': 'Hỗn Hợp',
  };

  const curStatus = tournament?.status || 'Sắp khởi tranh';
  const bg = darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-gray-100 text-gray-900';
  const cardBg = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6 space-y-6`}>
      <div className="relative overflow-hidden rounded-3xl border p-6 md:p-8"
        style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(99,102,241,0.15) 100%)'
            : 'linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 100%)',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        }}>
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              {tournament?.logo ? (
                <img src={tournament.logo} alt={tournament?.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <Trophy size={36} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl md:text-3xl font-black truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tournament?.name || 'Giải Đấu'}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${darkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border-cyan-200'}`}>
                  {formatLabels[tournament?.format] || tournament?.format || 'Giải Đấu'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[curStatus] || statusColors['Sắp khởi tranh']}`}>
                  {curStatus}
                </span>
              </div>
            </div>
          </div>

          {curStatus === 'Sắp khởi tranh' && isAdminBtc && (
            <button onClick={handleActivateTournament} disabled={activating}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all">
              {activating ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Play size={14} className="fill-current" />}
              Bắt Đầu Giải
            </button>
          )}

          {/* NUT DANG KY THAM DU (chi hien khi giai mo dang ky) */}
          <RegisterButton tournament={tournament} user={user} darkMode={darkMode} language={language} onOpenChat={() => setShowChat(true)} chatEnabled={tournament?.chatEnabled === true} />

          {/* Admin/BTC: nut vao chat rieng (ho khong dang ky giai nhung van vao chat de gui link/thong bao) */}
          {isAdminBtc && tournament?.chatEnabled === true && (
            <button onClick={() => setShowChat(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all">
              <MessageCircle className="w-4 h-4" />
              Vào Box Chat (Quản trị)
            </button>
          )}
        </div>
      </div>

      {/* Box chat giai dau - chi hien khi admin da BAT chat (chatEnabled) va user bam vao */}
      {showChat && tournament?.chatEnabled === true && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>💬 Chat Giải Đấu</span>
            <button onClick={() => setShowChat(false)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${darkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <X size={13} /> Đóng
            </button>
          </div>
          <TournamentChat tournamentId={tournament?.id} currentUser={user} darkMode={darkMode} />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Số Đội" value={teams.length} color="from-cyan-500 to-blue-600" darkMode={darkMode} />
        <StatCard icon={Swords} label="Số Trận" value={totalMatches} color="from-violet-500 to-purple-600" darkMode={darkMode} />
        <StatCard icon={Trophy} label="Hoàn Thành" value={doneMatches} color="from-emerald-500 to-green-600" darkMode={darkMode} />
        <StatCard icon={BarChart3} label="Còn Lại" value={pendingMatches} color="from-orange-500 to-amber-600" darkMode={darkMode} />
      </div>

      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Thao Tác Nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction icon={Users} label="Thêm Đội" tab="teams" onNavigate={onNavigate} darkMode={darkMode} />
          {/* Chia Bang: chi hien voi giai chia bang (GroupStage), an voi League */}
          {isGroupStage && (
            <QuickAction icon={Shield} label="Chia Bảng" tab="groups" onNavigate={onNavigate} darkMode={darkMode} />
          )}
          <QuickAction icon={Swords} label="Lịch & Nhập KQ" tab="schedule" onNavigate={onNavigate} darkMode={darkMode} />
          <QuickAction icon={BarChart3} label="Xem BXH" tab="standings" onNavigate={onNavigate} darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Trận Gần Đây</h2>
          {recentMatches.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
              <Swords size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có trận nào hoàn thành</p>
            </div>
          ) : (
            <div className="space-y-2">{recentMatches.map((m) => <MatchRow key={m.id} match={m} teams={teams} darkMode={darkMode} />)}</div>
          )}
        </div>

        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
            <Star size={14} className="inline mr-1 text-yellow-400" />Top 3 Đội
          </h2>
          {top3.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
              <Trophy size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có dữ liệu xếp hạng</p>
            </div>
          ) : (
            <div className="space-y-2">{top3.map((entry, i) => <TopTeamCard key={entry.team.id} rank={i} entry={entry} darkMode={darkMode} />)}</div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-emerald-500/20 border border-emerald-400 animate-bounce">
          <CheckCircle size={14} />{toastMessage}
        </div>
      )}
    </div>
  );
}