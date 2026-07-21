import React, { useMemo, useState } from 'react';
import { Trophy, Download, LayoutGrid, ListOrdered } from 'lucide-react';
import { captureAndSave } from '../../utils/exportImage';

// Tính BXH fallback từ matches (khi không có standings từ backend)
const calcStandings = (teams, matches) => {
  return teams.map(t => {
    const id = t.id;
    const played = matches.filter(m => m.status === 'done' && (String(m.homeId) === String(id) || String(m.awayId) === String(id)));
    let W = 0, D = 0, L = 0, GF = 0, GA = 0;
    played.forEach(m => {
      const isHome = String(m.homeId) === String(id);
      const gs = Number(isHome ? m.homeScore : m.awayScore) || 0;
      const gc = Number(isHome ? m.awayScore : m.homeScore) || 0;
      GF += gs; GA += gc;
      if (gs > gc) W++;
      else if (gs === gc) D++;
      else L++;
    });
    return { id, name: t.name, logo: t.logo, P: played.length, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D };
  }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);
};

// Giai co chia bang khong (co doi nao mang ten bang)
const hasGroups = (teams) => teams.some(t => t.group != null && String(t.group).trim() !== '');

// Tinh BXH RIENG cho tung bang -> [{ groupName, rows: [...] }, ...]
const calcStandingsByGroup = (teams, matches) => {
  const byGroup = {};
  teams.forEach(t => {
    const g = (t.group != null && String(t.group).trim() !== '') ? String(t.group) : 'Khác';
    (byGroup[g] = byGroup[g] || []).push(t);
  });
  const keys = Object.keys(byGroup).sort((a, b) => {
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  return keys.map(gName => ({
    groupName: gName,
    rows: calcStandings(byGroup[gName], matches),
  }));
};

// Tính phong độ 5 trận gần nhất cho 1 đội từ matches
const calcForm = (teamId, matches) => {
  const done = matches
    .filter(m => {
      // Backend tra Status = 'Completed'. Truoc day chi loc 'done' nen
      // phong do LUON RONG. Nhan ca hai + dua vao ti so cho chac.
      const st = String(m.status ?? m.Status ?? '').toLowerCase();
      const daDa = st === 'completed' || st === 'done'
        || (m.homeScore != null && m.awayScore != null);
      if (!daDa) return false;
      return String(m.homeId) === String(teamId) || String(m.awayId) === String(teamId);
    })
    // Sap theo thu tu tran dien ra: ngay -> vong -> id
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      if (da !== db) return da - db;
      if ((a.round ?? 0) !== (b.round ?? 0)) return (a.round ?? 0) - (b.round ?? 0);
      return (a.id ?? 0) - (b.id ?? 0);
    });
  return done.slice(-5).map(m => {
    const isHome = String(m.homeId) === String(teamId);
    const gs = Number(isHome ? m.homeScore : m.awayScore) || 0;
    const gc = Number(isHome ? m.awayScore : m.homeScore) || 0;
    if (gs > gc) return 'W';
    if (gs === gc) return 'D';
    return 'L';
  });
};

// Hiển thị chuỗi phong độ bằng các chấm màu
const FormBadges = ({ form }) => {
  if (!form || form.length === 0) {
    return <span className="text-slate-600 text-xs">—</span>;
  }
  const color = { W: 'bg-emerald-500', D: 'bg-yellow-500', L: 'bg-red-500' };
  return (
    <div className="flex items-center justify-center gap-0.5">
      {form.slice(0, 5).map((r, i) => (
        <span key={i} title={r}
          className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white ${color[r] || 'bg-slate-600'}`}>
          {r}
        </span>
      ))}
    </div>
  );
};

const renderLogo = (logo) => {
  if (!logo) return <span className="text-xs leading-none">⚽</span>;
  if (logo.startsWith('http') || logo.startsWith('data:')) {
    return <img src={logo} alt="" className="w-full h-full object-cover rounded-full" onError={e => { e.target.style.display = 'none'; }} />;
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      fontSize: '14px',
      lineHeight: 1,
    }}>{logo}</span>
  );
};

/**
 * Bang mau theo che do sang/toi.
 * Truoc day toan bo bang xep hang dung mau toi CUNG (#0f1729, #1e293b...),
 * nen bat che do sang thi bang van den — lac long voi phan con lai cua web.
 */
const getTheme = (dark) => dark ? {
  posterBg:  'linear-gradient(160deg, #0a0f1d 0%, #0d1426 60%, #0a1020 100%)',
  exportBg:  '#0a0f1d',
  cardBg:    '#0f1729',
  border:    '#1e293b',
  headBg:    'rgba(15,23,42,0.6)',
  rowHover:  'hover:bg-slate-800',
  divide:    'divide-slate-800/40',
  title:     '#ffffff',
  text:      '#e2e8f0',
  textDim:   '#94a3b8',
  textMuted: '#64748b',
  footNote:  '#475569',
  footBrand: '#cbd5e1',
  shadow:    '0 20px 50px rgba(0,0,0,0.5)',
} : {
  posterBg:  'linear-gradient(160deg, #f8fafc 0%, #eef2f7 60%, #e8eef6 100%)',
  exportBg:  '#f8fafc',
  cardBg:    '#ffffff',
  border:    '#e2e8f0',
  headBg:    'rgba(241,245,249,0.9)',
  rowHover:  'hover:bg-slate-100',
  divide:    'divide-slate-200',
  title:     '#0f172a',
  text:      '#1e293b',
  textDim:   '#64748b',
  textMuted: '#94a3b8',
  footNote:  '#94a3b8',
  footBrand: '#475569',
  shadow:    '0 12px 32px rgba(15,23,42,0.10)',
};

const Standings = ({ darkMode, teams = [], matches = [], tournamentInfo, standings, language = 'vi' }) => {
  const T = getTheme(darkMode);
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const activeName = tournamentInfo?.name || tr('Giải đấu PNH Football', 'PNH Football Tournament');
  const activeLogo = tournamentInfo?.logo || tournamentInfo?.logoUrl || '';

  const rows = useMemo(() => {
    let base;
    if (standings && standings.length > 0) {
      base = standings.map(s => ({
        id: s.id,
        name: s.name || tr('Đội bóng', 'Team'),
        logo: s.logo || '',
        P: s.P ?? 0, W: s.W ?? 0, D: s.D ?? 0, L: s.L ?? 0,
        GF: s.GF ?? 0, GA: s.GA ?? 0, GD: s.GD ?? 0, Pts: s.Pts ?? 0,
      }));
    } else {
      base = calcStandings(teams, matches);
    }
    // Uu tien phong do do BACKEND tinh (chinh xac hon vi co day du du lieu tran).
    // Chi tu tinh o frontend khi backend chua tra ve (ban cu).
    return base.map(r => {
      const src = Array.isArray(standings) ? standings.find(s => String(s.id) === String(r.id)) : null;
      const formBE = src?.form;
      return {
        ...r,
        form: (Array.isArray(formBE) && formBE.length > 0) ? formBE : calcForm(r.id, matches),
      };
    });
  }, [standings, teams, matches]);

  const [exporting, setExporting] = useState(false);
  // Giai co bang khong + che do xem (points = bang diem, list = danh sach doi)
  const isGrouped = useMemo(() => hasGroups(teams), [teams]);
  const groupStandings = useMemo(() => calcStandingsByGroup(teams, matches), [teams, matches]);
  const [viewMode, setViewMode] = useState('points'); // 'points' | 'list'

  const handleDownloadImage = async () => {
    const el = document.getElementById('standings-capture');
    if (!el) return;
    setExporting(true);

    // TAM doi layout de anh DEP + DU CAC COT (chi khi xuat anh). Xem web giu nguyen.
    const grid = document.getElementById('standings-groups-grid');
    let prevGridStyle = '';
    let widened = false;
    if (grid) {
      // TRUONG HOP CHIA BANG: nhieu cot
      const groupCount = groupStandings ? groupStandings.length : 0;
      let cols = 1;
      if (groupCount >= 9) cols = 3;       // 12 bang World Cup -> 3 cot (3x4 dep)
      else if (groupCount >= 5) cols = 2;  // 5-8 bang -> 2 cot
      if (cols > 1) {
        prevGridStyle = grid.getAttribute('style') || '';
        // 420px/bang: tru ~254px cac cot so + padding thi cot ten con ~130px,
        // du hien ten day du. De 340px thi cot ten bi bop con vai chuc px -> mat ten.
        el.style.width = `${cols * 420}px`;
        el.style.maxWidth = 'none';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        widened = true;
        await new Promise(r => setTimeout(r, 80));
      }
    } else {
      // TRUONG HOP LEAGUE (1 bang, khong chia bang): noi rong de du COT TEN + PHONG DO
      // Tren mobile bang bi ep -> mat ten doi + cat cot phong do. Ep rong 640px.
      // 820px: 720px nhu cu + 92px cho cot PHONG DO moi them
      el.style.width = '820px';
      el.style.maxWidth = 'none';
      widened = true;
      await new Promise(r => setTimeout(r, 80));
    }

    try {
      const safeName = (activeName || 'BangXepHang').replace(/[^a-zA-Z0-9]/g, '_');
      // captureAndSave tu lo: nhan dien iPad/iPhone/Android/PC, tu giam do phan giai
      // theo gioi han canvas cua may, va chon cach luu phu hop.
      const ok = await captureAndSave(el, {
        filename: `BXH_${safeName}`,
        background: T.exportBg,
        language,
      });
      if (!ok) alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } catch (err) {
      console.error('Export BXH error:', err);
      alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } finally {
      // Tra lai layout nhu cu (ca chia bang lan league)
      if (grid) grid.setAttribute('style', prevGridStyle);
      if (widened) { el.style.width = ''; el.style.maxWidth = ''; }
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Nút chế độ + tải ảnh */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        {/* Nút chuyển chế độ (chỉ hiện khi giải có chia bảng) */}
        {isGrouped ? (
          <div className="inline-flex rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <button onClick={() => setViewMode('points')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all"
              style={viewMode === 'points'
                ? { background: '#06b6d4', color: '#ffffff' }
                : { color: T.textDim }}>
              <ListOrdered size={14} /> {tr('Bảng điểm', 'Points table')}
            </button>
            <button onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all"
              style={viewMode === 'list'
                ? { background: '#06b6d4', color: '#ffffff' }
                : { color: T.textDim }}>
              <LayoutGrid size={14} /> {tr('Danh sách đội', 'Team list')}
            </button>
          </div>
        ) : <div />}
        <button onClick={handleDownloadImage} disabled={exporting || rows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
          <Download size={14} className={exporting ? 'animate-bounce' : ''} />
          {exporting ? tr('Đang tạo ảnh...', 'Creating image...') : tr('Tải Ảnh BXH', 'Download standings')}
        </button>
      </div>

      <div id="standings-capture" className="space-y-5 rounded-3xl p-4 sm:p-8" style={{ background: T.posterBg }}>
        {/* ── HEADER sang trọng (màu đặc, render chuẩn khi xuất ảnh) ── */}
        <div style={{ position: 'relative', textAlign: 'center', paddingBottom: '20px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', marginBottom: '14px' }}>
            {activeLogo && (activeLogo.startsWith('http') || activeLogo.startsWith('data:')) ? (
              <div style={{ width: '60px', height: '60px', borderRadius: '17px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)', border: '2px solid rgba(56,189,248,0.25)', flexShrink: 0 }}>
                <img src={activeLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : activeLogo ? (
              <div style={{ width: '60px', height: '60px', borderRadius: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)', border: '2px solid rgba(56,189,248,0.25)', flexShrink: 0, fontSize: '30px' }}>{activeLogo}</div>
            ) : null}
            <div style={{ textAlign: activeLogo ? 'left' : 'center' }}>
              <h1 style={{ fontSize: '30px', fontWeight: 900, color: T.title, letterSpacing: '0.5px', lineHeight: 1.15, margin: 0, textShadow: darkMode ? '0 2px 12px rgba(56,189,248,0.3)' : 'none' }}>
                {activeName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', justifyContent: activeLogo ? 'flex-start' : 'center' }}>
                <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #38bdf8, #06b6d4)' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: '#38bdf8', textTransform: 'uppercase' }}>{tr('Bảng Xếp Hạng', 'Standings')}</span>
                {!activeLogo && <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #06b6d4, #38bdf8)' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* ── BANG XEP HANG: theo tung bang (neu co) hoac chung ── */}
        {isGrouped ? (
          <div id="standings-groups-grid" className={viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6' : 'grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-6'}>
            {groupStandings.map(({ groupName, rows: gRows }) => (
              <div key={groupName}>
                {/* Tieu de bang */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #0e7490)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(56,189,248,0.35)' }}>
                    <Trophy size={17} color="#ffffff" />
                  </span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: T.title }}>{tr('Bảng', 'Group')} {groupName}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px' }}>{gRows.length} {tr('đội', 'teams')}</span>
                </div>
                {viewMode === 'points'
                  ? <StandingsTable rows={gRows} language={language} T={T} />
                  : <TeamListTable rows={gRows} language={language} T={T} />}
              </div>
            ))}
          </div>
        ) : (
          <StandingsTable rows={rows} language={language} showForm T={T} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg, #38bdf8, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={12} color="#0a0f1d" />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: T.footBrand, letterSpacing: '1px' }}>PNH FOOTBALL</span>
          </div>
          <span style={{ fontSize: '11px', color: T.footNote, fontStyle: 'italic' }}>{tr('Hệ thống quản lý giải đấu chuyên nghiệp', 'Professional tournament management system')}</span>
        </div>
      </div>{/* end standings-capture */}
    </div>
  );
};

// ─── Bảng điểm (chế độ points) ───
// showForm: hien cot PHONG DO 5 tran gan nhat.
// Chi bat cho giai League (dau vong tron, nhieu tran) — giai chia bang
// moi doi chi da 3 tran nen 5 o phong do khong co y nghia.
function StandingsTable({ rows, language = 'vi', showForm = false, T = getTheme(true) }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, background: T.cardBg, boxShadow: T.shadow }}>
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          {/* table-fixed KHONG ton trong minWidth tren <col>, chi doc width.
              De cot ten la auto -> no an het chieu rong con du sau cac cot so. */}
          <col style={{ width: '24px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '28px' }} />
          <col style={{ width: '24px' }} />
          <col style={{ width: '24px' }} />
          <col style={{ width: '24px' }} />
          <col style={{ width: '44px' }} />
          <col style={{ width: '30px' }} />
          {showForm && <col style={{ width: '92px' }} />}
          <col style={{ width: '38px' }} />
        </colgroup>
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-wide border-b"
            style={{ color: T.textDim, background: T.headBg, borderColor: T.border }}>
            <th className="px-1 py-3 text-center">#</th>
            <th className="px-2 py-3 text-left">{tr('ĐỘI BÓNG', 'TEAM')}</th>
            <th className="px-1 py-3 text-center">{tr('TR', 'P')}</th>
            <th className="px-1 py-3 text-center">{tr('T', 'W')}</th>
            <th className="px-1 py-3 text-center">{tr('H', 'D')}</th>
            <th className="px-1 py-3 text-center">{tr('B', 'L')}</th>
            <th className="px-1 py-3 text-center">{tr('BT/BB', 'GF/GA')}</th>
            <th className="px-1 py-3 text-center">{tr('HS', 'GD')}</th>
            {showForm && <th className="px-1 py-3 text-center">{tr('PHONG ĐỘ', 'FORM')}</th>}
            <th className="px-1 py-3 text-center text-yellow-400">{tr('Đ', 'Pts')}</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${T.divide}`}>
          {rows.map((row, idx) => {
            let borderColor = 'border-l-transparent', bgHighlight = '';
            if (idx === 0)      { borderColor = 'border-l-yellow-500 border-l-4'; bgHighlight = 'bg-yellow-500/5'; }
            else if (idx === 1) { borderColor = 'border-l-slate-400 border-l-4';  bgHighlight = 'bg-slate-400/5'; }
            else if (idx === 2) { borderColor = 'border-l-amber-700 border-l-4';  bgHighlight = 'bg-amber-700/5'; }
            else if (idx >= rows.length - 1 && rows.length >= 4) { borderColor = 'border-l-red-500 border-l-4'; bgHighlight = 'bg-red-500/5'; }
            return (
              <tr key={row.id} className={`transition-colors duration-150 ${borderColor} ${bgHighlight} ${T.rowHover}`}>
                <td className="px-1 py-3.5 text-center font-black text-xs" style={{ color: T.textMuted }}>{idx + 1}</td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                      style={{ border: `1px solid ${T.border}`, background: T.headBg }}>
                      {renderLogo(row.logo)}
                    </div>
                    <span
                      className="text-[12px] font-bold leading-tight"
                      title={row.name}
                      style={{
                        // Mau chu doi theo che do sang/toi
                        color: T.title,
                        // Cho xuong toi da 2 dong thay vi cat cut bang truncate.
                        // Ten dai nhu 'Bosnia and Herzegovina' van doc duoc du.
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >{row.name}</span>
                  </div>
                </td>
                <td className="px-1 py-3.5 text-center font-bold text-xs" style={{ color: T.text }}>{row.P}</td>
                <td className="px-1 py-3.5 text-center font-black text-emerald-500 text-xs">{row.W}</td>
                <td className="px-1 py-3.5 text-center font-semibold text-xs" style={{ color: T.textDim }}>{row.D}</td>
                <td className="px-1 py-3.5 text-center font-black text-red-500 text-xs">{row.L}</td>
                <td className="px-1 py-3.5 text-center text-xs font-medium whitespace-nowrap" style={{ color: T.textDim }}>{row.GF}-{row.GA}</td>
                <td className={`px-1 py-3.5 text-center font-bold text-xs ${row.GD > 0 ? 'text-emerald-400' : row.GD < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {row.GD > 0 ? '+' : ''}{row.GD}
                </td>
                {showForm && (
                  <td className="px-1 py-3.5">
                    <FormBadges form={row.form} language={language} />
                  </td>
                )}
                <td className="px-1 py-3.5 text-center">
                  <span className="inline-block px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 font-black text-[13px] border border-yellow-500/30">{row.Pts}</span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={showForm ? 10 : 9} className="px-4 py-12 text-center italic" style={{ color: T.textMuted }}>{tr('Chưa có kết quả trận đấu nào.', 'No match results yet.')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Danh sách đội (chế độ list - giống Group Draw) ───
function TeamListTable({ rows, language = 'vi', T = getTheme(true) }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, background: T.cardBg }}>
      {rows.map((row, idx) => (
        <div key={row.id} className="flex items-center gap-3 px-4 py-3"
          style={idx > 0 ? { borderTop: `1px solid ${T.border}` } : undefined}>
          <span className="w-6 text-center font-black text-sm" style={{ color: T.textMuted }}>{idx + 1}</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ border: `1px solid ${T.border}`, background: T.headBg }}>
            {renderLogo(row.logo)}
          </div>
          <span className="text-sm font-bold tracking-wide truncate flex-1" style={{ color: T.title }}>{row.name}</span>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-4 py-10 text-center italic text-sm" style={{ color: T.textMuted }}>
          {tr('Chưa có đội nào.', 'No teams yet.')}
        </div>
      )}
    </div>
  );
}

export default Standings;