import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, Swords, Clock, CheckCircle2, Download, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getTeam(teams, id) {
  return teams?.find((t) => String(t.id ?? t.teamId ?? t.TeamId) === String(id)) ?? null;
}

function normalizeMatch(m) {
  const raw = m.status ?? m.Status;
  let status = 'pending';
  if (raw === 'Completed' || raw === 'finished' || raw === 'done') status = 'done';
  else if (raw === 'Ongoing' || raw === 'ongoing' || raw === 'live') status = 'live';
  return {
    id: m.matchId ?? m.MatchId ?? m.id,
    homeId: m.homeTeamId ?? m.HomeTeamId,
    awayId: m.awayTeamId ?? m.AwayTeamId,
    homeScore: (m.homeScore ?? m.HomeScore) ?? null,
    awayScore: (m.awayScore ?? m.AwayScore) ?? null,
    round: `Round ${m.round ?? m.Round ?? '?'}`,
    status,
  };
}

function normalizeTeam(t) {
  return {
    id: t.teamId ?? t.TeamId ?? t.id,
    name: t.name ?? t.Name,
    logo: t.logoUrl ?? t.LogoUrl ?? t.logo ?? '',
  };
}

function groupByRound(matches) {
  const map = {};
  matches.forEach((m) => {
    const key = m.round ?? 'Chưa xác định';
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  return map;
}

function getAllRounds(matches) {
  const rounds = [...new Set(matches.map((m) => m.round))].filter(Boolean);
  return rounds.sort((a, b) => {
    const na = parseInt(String(a).replace(/\D/g, '')) || 0;
    const nb = parseInt(String(b).replace(/\D/g, '')) || 0;
    return na - nb;
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, darkMode }) {
  if (status === 'live') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">
        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />LIVE
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/30">
        <CheckCircle2 size={9} />Xong
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
      darkMode ? 'bg-white/5 text-white/40 border-white/10' : 'bg-gray-100 text-gray-400 border-gray-200'
    }`}>
      <Clock size={9} />Chờ
    </span>
  );
}

// ─── Team Display ─────────────────────────────────────────────────────────────
function TeamDisplay({ team, side, darkMode }) {
  if (!team) return <span className={`text-sm ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>—</span>;
  const isRight = side === 'right';
  const logo = team.logo || '';
  const isImage = logo.startsWith('http') || logo.startsWith('data:'); // URL hoặc base64 upload
  const isEmoji = logo && !isImage;

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 ${isRight ? 'flex-row-reverse' : ''} min-w-0`}>
      {isImage ? (
        <img src={logo} crossOrigin="anonymous" alt={team.name}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 border border-white/10 shadow-sm bg-white" />
      ) : (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: isRight ? '#ef4444' : '#3b82f6' }}>
          {isEmoji ? logo : (team.name?.[0] || '?')}
        </div>
      )}
      <span className={`text-xs sm:text-sm font-semibold truncate leading-tight max-w-[140px] ${darkMode ? 'text-white' : 'text-gray-900'} ${isRight ? 'text-right' : ''}`}>
        {team.name}
      </span>
    </div>
  );
}

// ─── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, teams, darkMode, isAdmin, onSaveMatchScore, isExporting }) {
  const home = getTeam(teams, match.homeId);
  const away = getTeam(teams, match.awayId);
  const isLive = match.status === 'live';

  const [homeScore, setHomeScore] = useState(match.homeScore !== null ? String(match.homeScore) : '');
  const [awayScore, setAwayScore] = useState(match.awayScore !== null ? String(match.awayScore) : '');
  const [saving, setSaving] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const finalHome = homeScore !== '' ? homeScore : (match.homeScore !== null ? String(match.homeScore) : null);
  const finalAway = awayScore !== '' ? awayScore : (match.awayScore !== null ? String(match.awayScore) : null);

  useEffect(() => {
    setHomeScore(match.homeScore !== null ? String(match.homeScore) : '');
    setAwayScore(match.awayScore !== null ? String(match.awayScore) : '');
  }, [match.homeScore, match.awayScore]);

  const hasChanges = homeScore !== (match.homeScore !== null ? String(match.homeScore) : '') ||
                     awayScore !== (match.awayScore !== null ? String(match.awayScore) : '');

  const handleSaveScore = async () => {
    if (!hasChanges) return;
    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (isNaN(h) || isNaN(a)) return;
    setSaving(true);
    try {
      await onSaveMatchScore(match.id, h, a);
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inpBase = `w-12 h-10 rounded-xl text-center text-lg font-black outline-none transition-all duration-300 bg-white text-black border ${
    flashSuccess ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
  }`;

  return (
    <div className={`relative overflow-hidden flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${
      isLive ? darkMode ? 'bg-green-500/8 border-green-500/25' : 'bg-green-50 border-green-200'
        : darkMode ? 'bg-white/4 border-white/8 hover:bg-white/7' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
    }`}>
      {isLive && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none rounded-2xl" />}

      <div className={`flex-1 flex justify-end min-w-0 pr-2 ${isAdmin && !isExporting ? 'pl-10 sm:pl-16' : ''}`}>
        <TeamDisplay team={home} side="right" darkMode={darkMode} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0 z-10 mx-2">
        {isAdmin && !isExporting ? (
          <div className="flex items-center gap-1.5">
            <input type="number" min="0" max="99" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className={inpBase} placeholder="-" />
            <span className={`text-sm font-bold ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>-</span>
            <input type="number" min="0" max="99" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className={inpBase} placeholder="-" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 min-w-[72px]">
            {(finalHome !== null && finalAway !== null) ? (
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{finalHome}</span>
                <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>-</span>
                <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{finalAway}</span>
              </div>
            ) : (
              <span className={`text-sm font-black tracking-widest ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>VS</span>
            )}
            {!isExporting && <StatusBadge status={match.status} darkMode={darkMode} />}
          </div>
        )}
      </div>

      <div className={`flex-1 flex justify-start min-w-0 pl-2 ${isAdmin && !isExporting ? 'pr-10 sm:pr-16' : ''}`}>
        <TeamDisplay team={away} side="left" darkMode={darkMode} />
      </div>

      {isAdmin && !isExporting && (
        <button type="button" onClick={handleSaveScore} disabled={!hasChanges || saving}
          className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
            hasChanges ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
          {saving ? '...' : 'Lưu'}
        </button>
      )}
    </div>
  );
}

// ─── Round Section ────────────────────────────────────────────────────────────
function RoundSection({ round, matches, teams, darkMode, isAdmin, onSaveMatchScore, isExporting }) {
  const doneCount = matches.filter((m) => m.status === 'done').length;
  const roundNum = String(round).replace(/\D/g, '') || round;
  return (
    <div className="space-y-3 animate-[fadeUp_0.22s_ease-out]">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <Calendar size={12} className="text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">Vòng {roundNum}</span>
          <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{doneCount}/{matches.length}</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/40 to-transparent" />
      </div>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} darkMode={darkMode} isAdmin={isAdmin} onSaveMatchScore={onSaveMatchScore} isExporting={isExporting} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Schedule({ tournament, darkMode, language, isAdmin, onUpdate }) {
  const tournamentId = tournament?.id;
  const teams = useMemo(
    () => (tournament?.teams || []).map(normalizeTeam),
    [tournament?.teams]
  );

  // Chỉ cho nhập tỉ số / tạo lịch khi giải "Đang diễn ra"
  const tStatus = tournament?.status || '';
  const canEdit = tStatus === 'Đang diễn ra' || tStatus === 'ongoing' || tStatus === 'Ongoing';

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeRound, setActiveRound] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Load lịch từ backend ──
  const fetchMatches = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches`, { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const list = json.data || json || [];
        const normalized = (Array.isArray(list) ? list : []).map(normalizeMatch);
        setMatches(normalized);
        if (onUpdate) onUpdate({ ...tournament, matches: normalized });
      }
    } catch (err) {
      console.warn('Không tải được lịch:', err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { fetchMatches(); }, [tournamentId]);

  const allRounds = useMemo(() => getAllRounds(matches), [matches]);
  const filtered = useMemo(() => {
    if (activeRound === 'all') return matches;
    return matches.filter((m) => String(m.round) === String(activeRound));
  }, [matches, activeRound]);
  const grouped = useMemo(() => groupByRound(filtered), [filtered]);

  // ── Lưu kết quả ──
  const handleSaveMatchScore = async (matchId, h, a) => {
    try {
      const res = await fetch(`${API_BASE}/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ homeScore: h, awayScore: a }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast('Lỗi lưu: ' + (json.message || res.status));
        return;
      }
      const updated = matches.map(m =>
        String(m.id) === String(matchId) ? { ...m, homeScore: h, awayScore: a, status: 'done' } : m
      );
      setMatches(updated);
      if (onUpdate) onUpdate({ ...tournament, matches: updated });
      showToast('Đã lưu kết quả!');
    } catch (err) {
      console.error('Save score error:', err);
      showToast('Lỗi kết nối khi lưu kết quả.');
    }
  };

  // ── Tạo lịch tự động ──
  const handleAutoGenerate = async () => {
    if (!canEdit) { showToast('Giải chưa diễn ra, không thể tạo lịch. Hãy đổi trạng thái sang "Đang diễn ra".'); return; }
    if (!tournamentId) { showToast('Chưa có ID giải đấu.'); return; }
    if (teams.length < 2) { showToast('Cần ít nhất 2 đội.'); return; }
    if (matches.length > 0) {
      const ok = window.confirm('Hành động này sẽ xóa và tạo lại toàn bộ lịch thi đấu. Tiếp tục?');
      if (!ok) return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches/random`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'single' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast('Lỗi tạo lịch: ' + (json.message || res.status));
        return;
      }
      showToast('Đã tạo lịch thi đấu!');
      await fetchMatches();
    } catch (err) {
      console.error('Generate schedule error:', err);
      showToast('Lỗi kết nối khi tạo lịch.');
    } finally {
      setGenerating(false);
    }
  };

  // ── Xóa toàn bộ lịch ──
  const handleClearSchedule = async () => {
    if (!tournamentId) return;
    if (!window.confirm('Xóa toàn bộ lịch thi đấu? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        showToast('Lỗi xóa: ' + (j.message || res.status));
        return;
      }
      setMatches([]);
      if (onUpdate) onUpdate({ ...tournament, matches: [] });
      showToast('Đã xóa toàn bộ lịch!');
    } catch (err) {
      showToast('Lỗi kết nối khi xóa lịch.');
    }
  };

  // Đợi browser vẽ xong (2 animation frame) — quan trọng để chụp không bị hụt khi không mở F12
  const waitForRender = () =>
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const handleDownloadImage = async () => {
    const element = document.getElementById('active-round-schedule');
    if (!element) return;
    setExporting(true);
    setIsExporting(true);

    // Chờ React render lại (ẩn nút Lưu, layout export) + browser vẽ xong
    await waitForRender();
    await new Promise(resolve => setTimeout(resolve, 350));
    await waitForRender();

    const originalStyle = element.style.cssText;
    element.style.width = '800px';
    element.style.maxWidth = 'none';
    element.style.padding = '24px';
    element.style.background = '#111827';
    element.style.borderRadius = '16px';

    // Chờ thêm sau khi đổi style
    await waitForRender();

    // QUAN TRỌNG: đợi tất cả ảnh logo trong vùng chụp tải xong
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.onload = res;
        img.onerror = res; // ảnh lỗi cũng bỏ qua, không treo
        setTimeout(res, 3000); // tối đa chờ 3s mỗi ảnh
      });
    }));

    // Ẩn các ảnh hỏng (kích thước 0) để tránh lỗi createPattern của html2canvas
    const hiddenImgs = [];
    imgs.forEach(img => {
      if (!img.naturalWidth || !img.naturalHeight) {
        hiddenImgs.push([img, img.style.display]);
        img.style.display = 'none';
      }
    });
    const restoreImgs = () => hiddenImgs.forEach(([img, disp]) => { img.style.display = disp; });

    try {
      const canvas = await html2canvas(element, {
        useCORS: true, allowTaint: true, scale: 2, backgroundColor: '#111827', logging: false,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          const all = clonedDoc.querySelectorAll('*');
          all.forEach((node) => {
            const cs = window.getComputedStyle(node);
            node.style.color = cs.color;
            node.style.backgroundColor = cs.backgroundColor;
            node.style.borderColor = cs.borderColor;
            if (cs.backgroundImage && cs.backgroundImage.includes('oklch')) {
              node.style.backgroundImage = 'none';
            }
          });
        },
      });
      element.style.cssText = originalStyle;
      const link = document.createElement('a');
      const roundName = activeRound === 'all' ? 'Tat_Ca' : activeRound;
      link.download = `LichThiDau_${roundName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      element.style.cssText = originalStyle;
      console.error('Error generating image:', err);
      alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } finally {
      restoreImgs();
      setExporting(false);
      setIsExporting(false);
    }
  };

  const bg = darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-gray-100 text-gray-900';

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col items-center justify-center p-6 space-y-4`}>
        <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
        <p className={`text-sm font-semibold tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'} animate-pulse`}>
          Đang tải dữ liệu lịch thi đấu...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6 space-y-5`}>
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white text-sm font-black shadow-2xl animate-bounce">
          <CheckCircle2 size={16} />{toastMessage}
        </div>
      )}

      {isAdmin && !canEdit && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold flex items-center gap-2">
          ⚠️ Giải chưa diễn ra, không thể nhập tỉ số hoặc tạo lịch. Vào tab "Cài Đặt" đổi trạng thái sang <strong>"Đang diễn ra"</strong>.
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lịch Thi Đấu</h1>
            <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {matches.length} trận · {matches.filter((m) => m.status === 'done').length} hoàn thành
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && canEdit && teams.length >= 2 && (
            <button onClick={handleAutoGenerate} disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Calendar size={14} />
              <span>{generating ? 'Đang tạo...' : '⚡ Tạo Lịch Tự Động'}</span>
            </button>
          )}
          {isAdmin && matches.length > 0 && (
            <button onClick={handleClearSchedule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md active:scale-95">
              <Trash2 size={14} /> Xóa Lịch
            </button>
          )}
          {matches.length > 0 && (
            <button onClick={handleDownloadImage} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Download size={14} className={exporting ? 'animate-bounce' : ''} />
              {exporting ? 'Đang tạo ảnh...' : 'Tải Lịch (Ảnh)'}
            </button>
          )}
        </div>
      </div>

      {allRounds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveRound('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeRound === 'all' ? 'bg-violet-500 text-white border-violet-500'
                : darkMode ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}>
            Tất Cả
          </button>
          {allRounds.map((r) => {
            const num = String(r).replace(/\D/g, '') || r;
            return (
              <button key={r} onClick={() => setActiveRound(String(r))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeRound === String(r) ? 'bg-violet-500 text-white border-violet-500'
                    : darkMode ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}>
                Vòng {num}
              </button>
            );
          })}
        </div>
      )}

      <div id="schedule-container" className="rounded-3xl">
        {matches.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border text-center p-6 ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <Swords size={48} className={`mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={`text-base font-bold mb-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Chưa có lịch thi đấu</p>
            <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-gray-400'} max-w-sm mb-6`}>
              Hãy thêm đội bóng trước, sau đó nhấn nút dưới đây để tự động tạo lịch thi đấu vòng tròn (Round-Robin).
            </p>
            {isAdmin && canEdit && teams.length >= 2 ? (
              <button onClick={handleAutoGenerate} disabled={generating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                <Calendar size={16} />
                <span>{generating ? 'Đang tạo...' : '⚡ Tạo Lịch Đấu Tự Động'}</span>
              </button>
            ) : (
              <p className="text-xs text-amber-400 font-medium">Cần ít nhất 2 đội bóng tham dự để tự động tạo lịch.</p>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
            <p className="text-sm">Không có trận nào trong vòng này</p>
          </div>
        ) : (
          <div className={`space-y-6 ${isExporting ? 'p-6 bg-[#111827] rounded-2xl' : ''}`} id="active-round-schedule">
            {isExporting && (
              <div className="text-center pb-4 border-b border-slate-800">
                <h2 className="text-lg font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text uppercase tracking-widest">
                  LỊCH THI ĐẤU {activeRound === 'all' ? 'TOÀN BỘ GIẢI' : String(activeRound).toUpperCase()} - PNH FOOTBALL
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  HỆ THỐNG QUẢN LÝ GIẢI ĐẤU CHUYÊN NGHIỆP
                </p>
              </div>
            )}
            {Object.entries(grouped).map(([round, roundMatches]) => (
              <RoundSection key={round} round={round} matches={roundMatches} teams={teams}
                darkMode={darkMode} isAdmin={isAdmin && canEdit} onSaveMatchScore={handleSaveMatchScore} isExporting={isExporting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}