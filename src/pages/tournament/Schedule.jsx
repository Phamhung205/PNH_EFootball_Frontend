import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Calendar, Swords, Clock, CheckCircle2, Download, Trash2, ChevronDown } from 'lucide-react';
import { captureAndSave } from '../../utils/exportImage';

import { matchApi } from '../../services/api';

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

// Giai co chia bang khong (co tran nao mang thong tin bang)
function hasGroupInfo(matches) {
  return matches.some((m) => m.group != null && String(m.group).trim() !== '');
}

// Nhom theo BANG -> roi trong moi bang nhom theo VONG
// Tra ve: [ { groupName, rounds: { 'Vong 1': [...], 'Vong 2': [...] } }, ... ]
function groupByGroupThenRound(matches) {
  const byGroup = {};
  matches.forEach((m) => {
    const g = (m.group != null && String(m.group).trim() !== '') ? String(m.group) : 'Khác';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(m);
  });
  // Sap xep ten bang: A, B, C... (Khac xuong cuoi)
  const groupKeys = Object.keys(byGroup).sort((a, b) => {
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  return groupKeys.map((gName) => {
    const groupMatches = byGroup[gName];
    // Lay cac roundNumber duy nhat trong bang nay, sap xep tang dan
    const uniqueRoundNumbers = [...new Set(
      groupMatches.map((m) => (m.roundNumber ?? parseInt(String(m.round ?? '').replace(/\D/g, ''))) || 0)
    )].sort((a, b) => a - b);
    // Map roundNumber goc -> so thu tu trong bang (1, 2, 3...)
    const roundMap = {};
    uniqueRoundNumbers.forEach((rn, idx) => { roundMap[rn] = idx + 1; });
    // Gan lai round theo so thu tu trong bang
    const remapped = groupMatches.map((m) => {
      const origRN = (m.roundNumber ?? parseInt(String(m.round ?? '').replace(/\D/g, ''))) || 0;
      const localRound = roundMap[origRN] ?? origRN;
      return { ...m, round: `Vong ${localRound}`, roundNumber: localRound };
    });
    return {
      groupName: gName,
      rounds: groupByRound(remapped),
    };
  });
}

function getAllRounds(matches) {
  // Neu giai CHIA BANG: so vong tinh theo TUNG BANG (max cac bang), khong phai round toan giai.
  // Vi du 8 bang moi bang 3 vong -> chi hien "Vong 1,2,3" thay vi "Vong 1..24".
  if (hasGroupInfo(matches)) {
    const grouped = groupByGroupThenRound(matches); // da remap round theo bang
    const roundSet = new Set();
    grouped.forEach((g) => {
      Object.keys(g.rounds).forEach((r) => roundSet.add(r));
    });
    return [...roundSet].sort((a, b) => {
      const na = parseInt(String(a).replace(/\D/g, '')) || 0;
      const nb = parseInt(String(b).replace(/\D/g, '')) || 0;
      return na - nb;
    });
  }
  // Giai khong chia bang (League/Knockout): giu nguyen
  const rounds = [...new Set(matches.map((m) => m.round))].filter(Boolean);
  return rounds.sort((a, b) => {
    const na = parseInt(String(a).replace(/\D/g, '')) || 0;
    const nb = parseInt(String(b).replace(/\D/g, '')) || 0;
    return na - nb;
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, darkMode, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
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
        <CheckCircle2 size={9} />{tr('Xong','Done')}
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
      darkMode ? 'bg-white/5 text-white/40 border-white/10' : 'bg-gray-100 text-gray-400 border-gray-200'
    }`}>
      <Clock size={9} />{tr('Chờ','Pending')}
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
function MatchCard({ match, teams, darkMode, isAdmin, onSaveMatchScore, isExporting, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
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
            <input type="number" min="0" max="99" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className={"score-input " + inpBase} placeholder="-" />
            <span className={`text-sm font-bold ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>-</span>
            <input type="number" min="0" max="99" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className={"score-input " + inpBase} placeholder="-" />
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
            {!isExporting && <StatusBadge status={match.status} darkMode={darkMode} language={language} />}
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
          {saving ? '...' : tr('Lưu','Save')}
        </button>
      )}
    </div>
  );
}

// ─── Round Section ────────────────────────────────────────────────────────────
function RoundSection({ round, matches, teams, darkMode, isAdmin, onSaveMatchScore, isExporting, defaultOpen = false, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const doneCount = matches.filter((m) => m.status === 'done').length;
  const roundNum = String(round).replace(/\D/g, '') || round;
  const [open, setOpen] = useState(defaultOpen);
  // Khi defaultOpen doi (vd chon vong cu the tu dropdown) -> tu mo
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  // Khi xuat anh -> luon mo het de anh day du
  const isOpen = isExporting || open;
  const allDone = doneCount === matches.length && matches.length > 0;

  return (
    <div className="space-y-3 animate-[fadeUp_0.22s_ease-out]">
      {/* Thanh tieu de vong - bam de mo/gap */}
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 group ${isExporting ? 'cursor-default' : 'cursor-pointer'}`}>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${
          isOpen ? 'bg-cyan-500/15 border-cyan-500/30' : 'bg-cyan-500/8 border-cyan-500/15 group-hover:bg-cyan-500/15'}`}>
          <Calendar size={12} className="text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">{tr('Vòng','Round')} {roundNum}</span>
          <span className={`text-xs font-bold ${allDone ? 'text-emerald-400' : (darkMode ? 'text-white/40' : 'text-gray-400')}`}>
            {doneCount}/{matches.length}
          </span>
          {!isExporting && (
            <ChevronDown size={14} className={`text-cyan-400/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/40 to-transparent" />
      </button>
      {/* Danh sach tran - chi hien khi mo */}
      {isOpen && (
        <div className="space-y-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} teams={teams} darkMode={darkMode} isAdmin={isAdmin} onSaveMatchScore={onSaveMatchScore} isExporting={isExporting} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Schedule({ tournament, darkMode, language, isAdmin, onUpdate }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const tournamentId = tournament?.id;
  const exportName = tournament?.name || tr('Giải đấu PNH Football','PNH Football Tournament');
  const exportLogo = tournament?.logo || tournament?.logoUrl || tournament?.LogoUrl || '';
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
  // Ref phan than lich (danh sach bang/vong) - de ep thanh luoi nhieu cot khi xuat anh
  const scheduleBodyRef = useRef(null);
  const [legType, setLegType] = useState('single'); // 'single' = 1 lượt, 'double' = 2 lượt (đi/về)
  const [roundDropdownOpen, setRoundDropdownOpen] = useState(false); // dropdown chọn vòng

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Load lịch từ backend (qua matchApi, có fallback mock) ──
  const fetchMatches = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const list = await matchApi.getByTournament(tournamentId);
      // matchApi đã normalize sẵn, không cần normalizeMatch nữa
      // LOC BO cac tran KNOCKOUT (roundNumber >= 100) - chung hien o trang So Do Knockout rieng,
      // khong hien trong lich vong bang (tranh loi "Vong 100").
      const groupStageMatches = (Array.isArray(list) ? list : []).filter(
        (m) => (m.roundNumber ?? 0) < 100
      );
      setMatches(groupStageMatches);
      const list2 = groupStageMatches;
      // TU DONG phat hien lich la 1 hay 2 luot (de nut hien dung sau khi tai lai).
      // 2 luot = co cap doi gap nhau >= 2 lan (san nha + san khach).
      if (Array.isArray(list2) && list2.length > 0) {
        const seen = new Set();
        let isDouble = false;
        for (const m of list2) {
          const h = m.homeTeamId ?? m.HomeTeamId, a = m.awayTeamId ?? m.AwayTeamId;
          if (h == null || a == null) continue;
          // Khoa theo cap co thu tu (A vs B khac B vs A). Neu thay ca 2 chieu -> 2 luot.
          const keyReverse = `${a}-${h}`;
          if (seen.has(keyReverse)) { isDouble = true; break; }
          seen.add(`${h}-${a}`);
        }
        setLegType(isDouble ? 'double' : 'single');
      }
      if (onUpdate) onUpdate({ ...tournament, matches: list });
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
  // Giai co chia bang khong + du lieu nhom theo bang (cho hien thi tach bang)
  const showByGroup = useMemo(() => hasGroupInfo(matches), [matches]);
  const groupedByGroup = useMemo(() => groupByGroupThenRound(filtered), [filtered]);

  // ── Lưu kết quả (qua matchApi) ──
  const handleSaveMatchScore = async (matchId, h, a) => {
    try {
      await matchApi.updateScore(matchId, h, a);
      const updated = matches.map(m =>
        String(m.id) === String(matchId) ? { ...m, homeScore: h, awayScore: a, status: 'done' } : m
      );
      setMatches(updated);
      if (onUpdate) onUpdate({ ...tournament, matches: updated });
      showToast(tr('Đã lưu kết quả!','Result saved!'));
    } catch (err) {
      console.error('Save score error:', err);
      showToast(tr('Lỗi: ','Error: ') + err.message);
    }
  };

  // ── Tạo lịch tự động ──
  const handleAutoGenerate = async () => {
    if (!canEdit) { showToast(tr('Giải chưa diễn ra, không thể tạo lịch. Hãy đổi trạng thái sang "Đang diễn ra".','The tournament has not started, so a schedule cannot be created. Change the status to "Đang diễn ra" (Ongoing).')); return; }
    if (!tournamentId) { showToast(tr('Chưa có ID giải đấu.','No tournament ID yet.')); return; }
    if (teams.length < 2) { showToast('Cần ít nhất 2 đội.'); return; }
    if (matches.length > 0) {
      const ok = window.confirm(tr('Hành động này sẽ xóa và tạo lại toàn bộ lịch thi đấu. Tiếp tục?','This will delete and rebuild the entire schedule. Continue?'));
      if (!ok) return;
    }
    setGenerating(true);
    try {
      await matchApi.generateRandom(tournamentId, legType);
      showToast(tr('Đã tạo lịch thi đấu!','Schedule created!'));
      await fetchMatches();
    } catch (err) {
      console.error('Generate schedule error:', err);
      showToast(tr('Lỗi: ','Error: ') + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Xóa toàn bộ lịch ──
  const handleClearSchedule = async () => {
    if (!tournamentId) return;
    if (!window.confirm(tr('Xóa toàn bộ lịch thi đấu? Hành động này không thể hoàn tác.','Delete the entire schedule? This cannot be undone.'))) return;
    try {
      await matchApi.clearSchedule(tournamentId);
      setMatches([]);
      if (onUpdate) onUpdate({ ...tournament, matches: [] });
      showToast(tr('Đã xóa toàn bộ lịch!','Schedule cleared!'));
    } catch (err) {
      showToast(tr('Lỗi: ','Error: ') + err.message);
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

    // Chờ React render lại (bật layout export) + browser vẽ xong
    await waitForRender();
    await new Promise(resolve => setTimeout(resolve, 300));
    await waitForRender();

    // Ep than lich thanh LUOI NHIEU COT khi xuat "Toan Giai" (anh nam ngang, khong doc dai).
    //
    // TRUOC DAY: dung CSS Grid (`repeat(cols, 360px)`) de trinh duyet TU XEP theo
    // hang-cot. Nhung Grid chuan KHONG can bang chieu cao cot — no xep tuan tu
    // theo thu tu DOM, nen neu 1 bang dai (nhieu vong) se day lech cac bang sau,
    // dan den chong lan khi ket hop voi doi style luc xuat anh (isExporting).
    //
    // GIO: do CHIEU CAO THAT tung bang (offsetHeight) roi CHU DONG chia vao cot
    // bang thuat toan tham lam — luon bo bang tiep theo vao cot dang THAP NHAT.
    // Dam bao cac cot can bang thuc su, khong con phu thuoc CSS Grid tu xep.
    const body = scheduleBodyRef.current;
    let restoreBody = () => {};
    if (body && activeRound === 'all') {
      const prevClass = body.className;
      const prevBodyStyle = body.getAttribute('style') || '';

      const blocks = Array.from(body.children); // moi block = 1 bang (hoac 1 vong neu khong chia bang)
      if (blocks.length >= 2) {
        // 2 bang tro xuong: 1 cot du dep, khong can chia
        const cols = blocks.length >= 9 ? 4 : (blocks.length >= 5 ? 3 : 2);
        const COL_WIDTH = 420; // du rong cho ten doi dai + 2 logo, khong bi cat canh

        // LOI DA GAP TRUOC DAY: moi block von KHONG co width rieng (thiet ke de
        // full-width trong the hien thi doc binh thuong). Khi dat vao cot flex
        // ma khong ep width, block GIU NGUYEN chieu rong goc rat lon (~800-900px),
        // 3 cot nhu vay cong lai vuot xa khung anh -> anh bi CAT NGANG mat logo/ten
        // ben phai (dung nhu anh nguoi dung gui). Gio EP width co dinh cho tung
        // block TRUOC khi do offsetHeight, de chieu cao do duoc dung voi chieu
        // rong se hien thi that (chieu cao phu thuoc chieu rong vi chu tu xuong dong).
        const prevBlockWidths = blocks.map(b => b.style.width);
        blocks.forEach(b => { b.style.width = `${COL_WIDTH}px`; });

        const colHeights = Array(cols).fill(0);
        const colEls = Array.from({ length: cols }, () => {
          const d = document.createElement('div');
          d.style.display = 'flex';
          d.style.flexDirection = 'column';
          d.style.gap = '24px';
          d.style.width = `${COL_WIDTH}px`; // ep luon chieu rong COT, khong de tu co gian
          d.style.flexShrink = '0';         // khong cho flex bop nho khi tong vuot khung
          return d;
        });

        // ── SUA LOI QUAN TRONG ──
        // TRUOC DAY: goi appendChild(block) vao colEls RỒI MOI doc offsetHeight,
        // nhung luc do colEls CHUA duoc gan vao body (chua nam trong cay DOM
        // that cua trang) -> trinh duyet KHONG tinh layout cho no -> offsetHeight
        // LUON = 0 cho MOI block. Khi moi block "cao" = 0, thuat toan "chon cot
        // thap nhat" chi con la chon THEO VONG TRON co dinh (0,1,2,0,1,2,...)
        // -> voi 8 bang A-H, cot 1 luon nhan dung A,D,G (chinh xac giong loi
        // trong anh nguoi dung gui). GIO: gan colEls vao body TRUOC, de node
        // da nam trong DOM that -> offsetHeight do duoc gia tri THAT.
        //
        // QUAN TRONG: dat WIDTH TUONG MINH cho body (chinh la #active-round-schedule,
        // phan tu duoc snapdom chup). Truoc day de trinh duyet TU SUY chieu rong qua
        // scrollWidth — voi flex-row + flexShrink:0, ve mat ly thuyet scrollWidth
        // phai dung, nhung tren thuc te van thay anh xuat ra bi CAT CANH PHAI (cot 3).
        // De chac chan khong con phu thuoc cach doc scrollWidth cua tung trinh
        // duyet/thu vien chup anh, EP THANG width = dung tong 3 cot + padding.
        body.style.boxSizing = 'border-box'; // width tinh CA padding, khong can cong tay
        body.style.width = `${cols * COL_WIDTH + (cols - 1) * 24 + 64}px`; // +64 = 32px*2 (padding trai/phai co san)
        body.className = '';
        body.style.display = 'flex';
        body.style.flexDirection = 'row';
        body.style.gap = '24px';
        body.style.alignItems = 'flex-start';
        colEls.forEach(col => body.appendChild(col));

        blocks.forEach((block) => {
          // Chon cot dang THAP NHAT de bo block vao (thuat toan tham lam)
          let minIdx = 0;
          for (let i = 1; i < cols; i++) if (colHeights[i] < colHeights[minIdx]) minIdx = i;
          colEls[minIdx].appendChild(block); // di chuyen NODE THAT (khong copy) -> giu nguyen event handler cua React
          colHeights[minIdx] += block.offsetHeight + 24; // +gap
        });

        // KHOI PHUC: dua tung block THAT ve lai body theo dung THU TU GOC.
        // KHONG dung innerHTML (se tao node DOM moi, lam mat het React event
        // handler nhu onClick nhap ty so — nut se het tac dung sau khi tai anh).
        restoreBody = () => {
          blocks.forEach((block, i) => {
            body.appendChild(block); // appendChild tren node da co = DI CHUYEN, dung thu tu blocks[]
            block.style.width = prevBlockWidths[i]; // tra lai width goc (thuong la '')
          });
          colEls.forEach(col => col.remove()); // don cac cot rong (da het block) con sot lai trong body
          body.className = prevClass;
          body.setAttribute('style', prevBodyStyle);
        };
      } else {
        restoreBody = () => {
          body.className = prevClass;
          body.setAttribute('style', prevBodyStyle);
        };
      }
    }

    try {
      const roundName = activeRound === 'all' ? 'Tat_Ca' : String(activeRound).replace(/[^a-zA-Z0-9]/g, '_');
      // captureAndSave tu lo: chuyen anh base64, nhan dien may (iPad/iPhone/Android/PC),
      // tu giam do phan giai theo gioi han canvas, va chon cach luu phu hop.
      const ok = await captureAndSave(element, {
        filename: `LichThiDau_${roundName}`,
        background: '#0a0f1d',
      });
      if (!ok) alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } finally {
      restoreBody();
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
          {tr('Đang tải dữ liệu lịch thi đấu...','Loading schedule data...')}
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
          ⚠️ {tr('Giải chưa diễn ra, không thể nhập tỉ số hoặc tạo lịch. Vào tab "Cài Đặt" đổi trạng thái sang','The tournament has not started, so you cannot enter scores or create a schedule. Open the "Settings" tab and change the status to')} <strong>{tr('"Đang diễn ra"','"Ongoing"')}</strong>.
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tr('Lịch Thi Đấu','Match Schedule')}</h1>
            <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {matches.length} {tr('trận','matches')} · {matches.filter((m) => m.status === 'done').length} {tr('hoàn thành','completed')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && canEdit && teams.length >= 2 && (
            <>
              {/* Chọn số lượt: 1 lượt hoặc 2 lượt (đi/về) */}
              <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                <button type="button" onClick={() => setLegType('single')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${legType === 'single' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/40 scale-105' : (darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400')}`}>
                  {tr('1 Lượt','Single')}
                </button>
                <button type="button" onClick={() => setLegType('double')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${legType === 'double' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/40 scale-105' : (darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400')}`}>
                  {tr('2 Lượt (đi/về)','Double (home/away)')}
                </button>
              </div>
              <button onClick={handleAutoGenerate} disabled={generating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
                <Calendar size={14} />
                <span>{generating ? tr('Đang tạo...','Creating...') : tr('⚡ Tạo Lịch Tự Động','⚡ Auto Schedule')}</span>
              </button>
            </>
          )}
          {isAdmin && matches.length > 0 && (
            <button onClick={handleClearSchedule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md active:scale-95">
              <Trash2 size={14} /> {tr('Xóa Lịch','Clear Schedule')}
            </button>
          )}
          {matches.length > 0 && (
            <button onClick={handleDownloadImage} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Download size={14} className={exporting ? 'animate-bounce' : ''} />
              {exporting ? tr('Đang tạo ảnh...','Creating image...') : tr('Tải Lịch (Ảnh)','Download Schedule (Image)')}
            </button>
          )}
        </div>
      </div>

      {allRounds.length > 0 && (
        <div className="relative" style={{ zIndex: 30 }}>
          {/* Nut chinh: hien vong dang chon, bam de xo danh sach */}
          <button onClick={() => setRoundDropdownOpen(o => !o)}
            className={`flex items-center justify-between gap-2 w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              darkMode ? 'bg-white/8 text-white border-white/15 hover:bg-white/12' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}>
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-violet-400" />
              {activeRound === 'all' ? tr('Tất Cả Các Vòng','All Rounds') : `${tr('Vòng','Round')} ${String(activeRound).replace(/\D/g, '') || activeRound}`}
            </span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${roundDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Danh sach cac vong (xo xuong) */}
          {roundDropdownOpen && (
            <>
              {/* Lop phu de bam ra ngoai dong dropdown */}
              <div className="fixed inset-0" style={{ zIndex: 20 }} onClick={() => setRoundDropdownOpen(false)} />
              <div className={`absolute left-0 mt-2 w-full sm:w-64 max-h-72 overflow-y-auto rounded-xl border shadow-2xl p-1.5 ${
                darkMode ? 'bg-[#0f1629] border-white/15' : 'bg-white border-gray-200'
              }`} style={{ zIndex: 40 }}>
                <button onClick={() => { setActiveRound('all'); setRoundDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all mb-0.5 ${
                    activeRound === 'all' ? 'bg-violet-500 text-white' : (darkMode ? 'text-white/70 hover:bg-white/8' : 'text-gray-600 hover:bg-gray-100')
                  }`}>
                  {tr('Tất Cả Các Vòng','All Rounds')}
                </button>
                {allRounds.map((r) => {
                  const num = String(r).replace(/\D/g, '') || r;
                  return (
                    <button key={r} onClick={() => { setActiveRound(String(r)); setRoundDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeRound === String(r) ? 'bg-violet-500 text-white' : (darkMode ? 'text-white/70 hover:bg-white/8' : 'text-gray-600 hover:bg-gray-100')
                      }`}>
                      {tr('Vòng','Round')} {num}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div id="schedule-container" className="rounded-3xl">
        {matches.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border text-center p-6 ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <Swords size={48} className={`mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={`text-base font-bold mb-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tr('Chưa có lịch thi đấu','No schedule yet')}</p>
            <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-gray-400'} max-w-sm mb-6`}>
              {tr('Hãy thêm đội bóng trước, sau đó nhấn nút dưới đây để tự động tạo lịch thi đấu vòng tròn (Round-Robin).','Add teams first, then press the button below to auto-generate a round-robin schedule.')}
            </p>
            {isAdmin && canEdit && teams.length >= 2 ? (
              <div className="flex flex-col items-center gap-3">
                {/* Chọn số lượt */}
                <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                  <button type="button" onClick={() => setLegType('single')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${legType === 'single' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/40 scale-105' : (darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400')}`}>
                    {tr('1 Lượt','Single')}
                  </button>
                  <button type="button" onClick={() => setLegType('double')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${legType === 'double' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/40 scale-105' : (darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400')}`}>
                    {tr('2 Lượt (đi/về)','Double (home/away)')}
                  </button>
                </div>
                <button onClick={handleAutoGenerate} disabled={generating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  <Calendar size={16} />
                  <span>{generating ? tr('Đang tạo...','Creating...') : tr('⚡ Tạo Lịch Đấu Tự Động','⚡ Auto-Generate Schedule')}</span>
                </button>
                <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  {legType === 'double' ? tr('Mỗi cặp đá 2 trận (sân nhà + sân khách)','Each pair plays twice (home + away)') : tr('Mỗi cặp đá 1 trận','Each pair plays once')}
                  {' · '}{tr('Giải có chia bảng sẽ đá theo từng bảng','Tournaments with groups play within each group')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium">{tr('Cần ít nhất 2 đội bóng tham dự để tự động tạo lịch.','You need at least 2 teams to auto-generate a schedule.')}</p>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
            <p className="text-sm">{tr('Không có trận nào trong vòng này','No matches in this round')}</p>
          </div>
        ) : (
          <div className={`space-y-6 ${isExporting ? 'rounded-3xl' : ''}`} id="active-round-schedule"
            style={isExporting ? { background: 'linear-gradient(160deg, #0a0f1d 0%, #0d1426 60%, #0a1020 100%)', padding: '32px' } : undefined}>
            {isExporting && (
              <div style={{ textAlign: 'center', paddingBottom: '20px', marginBottom: '4px', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
                  {exportLogo && (exportLogo.startsWith('http') || exportLogo.startsWith('data:')) ? (
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)', border: '2px solid rgba(56,189,248,0.25)', flexShrink: 0 }}>
                      <img src={exportLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : exportLogo ? (
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)', border: '2px solid rgba(56,189,248,0.25)', flexShrink: 0, fontSize: '28px' }}>{exportLogo}</div>
                  ) : null}
                  <div style={{ textAlign: exportLogo ? 'left' : 'center' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px', lineHeight: 1.15, margin: 0, textShadow: '0 2px 12px rgba(56,189,248,0.3)' }}>
                      {exportName}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', justifyContent: exportLogo ? 'flex-start' : 'center' }}>
                      <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #38bdf8, #06b6d4)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: '#38bdf8', textTransform: 'uppercase' }}>
                        Lịch Thi Đấu {activeRound === 'all' ? ('· ' + tr('Toàn Giải','Whole Tournament')) : '· ' + String(activeRound)}
                      </span>
                      {!exportLogo && <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #06b6d4, #38bdf8)' }} />}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={scheduleBodyRef} className="space-y-6">
            {showByGroup ? (
              // ── CO CHIA BANG: hien theo tung BANG, trong moi bang la cac VONG ──
              groupedByGroup.map(({ groupName, rounds }) => (
                <div key={groupName} style={{ marginBottom: '28px' }}>
                  {/* Tieu de bang */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '10px', borderBottom: isExporting ? '2px solid rgba(56,189,248,0.3)' : undefined }}
                    className={isExporting ? '' : (darkMode ? 'border-b-2 border-cyan-500/30' : 'border-b-2 border-cyan-500/40')}>
                    <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #0e7490)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(56,189,248,0.35)' }}>
                      <Calendar size={18} color="#ffffff" />
                    </span>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: 900 }} className={isExporting ? '' : (darkMode ? 'text-white' : 'text-slate-900')}>
                        <span style={isExporting ? { color: '#ffffff' } : {}}>Bảng {groupName}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }} className={isExporting ? '' : 'text-cyan-400'}>
                        <span style={isExporting ? { color: '#38bdf8' } : {}}>
                          {Object.values(rounds).reduce((s, arr) => s + arr.length, 0)} trận
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Cac vong trong bang */}
                  {Object.entries(rounds).map(([round, roundMatches]) => (
                    <RoundSection key={groupName + '-' + round} round={round} matches={roundMatches} teams={teams}
                      darkMode={darkMode} isAdmin={isAdmin && canEdit} onSaveMatchScore={handleSaveMatchScore} isExporting={isExporting} language={language}
                      defaultOpen={activeRound !== 'all'} />
                  ))}
                </div>
              ))
            ) : (
              // ── KHONG CHIA BANG: hien theo vong nhu cu ──
              Object.entries(grouped).map(([round, roundMatches]) => (
                <RoundSection key={round} round={round} matches={roundMatches} teams={teams}
                  darkMode={darkMode} isAdmin={isAdmin && canEdit} onSaveMatchScore={handleSaveMatchScore} isExporting={isExporting} language={language}
                  defaultOpen={activeRound !== 'all'} />
              ))
            )}
            </div>
            {isExporting && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg, #38bdf8, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={12} color="#0a0f1d" />
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#cbd5e1', letterSpacing: '1px' }}>PNH FOOTBALL</span>
                </div>
                <span style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>{tr('Hệ thống quản lý giải đấu chuyên nghiệp','Professional tournament management system')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}