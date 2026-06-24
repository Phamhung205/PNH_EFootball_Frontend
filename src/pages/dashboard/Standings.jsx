import React, { useMemo, useState } from 'react';
import { Trophy, Download, LayoutGrid, ListOrdered } from 'lucide-react';
import { snapdom } from '@zumer/snapdom';

// ─── Chuyển mọi ảnh base64/URL trong vùng chụp thành CANVAS ───
// snapdom không nhúng được <img src="data:..."> base64, nhưng chụp canvas thì chuẩn 100%.
// Hàm này thay tạm mỗi <img> bằng <canvas> đã vẽ sẵn ảnh, rồi trả về hàm khôi phục.
async function rasterizeImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores = [];
  await Promise.all(imgs.map(async (img) => {
    try {
      // Đảm bảo ảnh đã tải xong
      if (!(img.complete && img.naturalWidth > 0)) {
        await new Promise(res => { img.onload = res; img.onerror = res; setTimeout(res, 3000); });
      }
      if (!img.naturalWidth || !img.naturalHeight) return; // ảnh hỏng -> bỏ qua
      if (img.decode) { try { await img.decode(); } catch {} }

      const rect = img.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width || img.width || img.naturalWidth));
      const h = Math.max(1, Math.round(rect.height || img.height || img.naturalHeight));

      const canvas = document.createElement('canvas');
      canvas.width = w * 2; canvas.height = h * 2; // x2 cho nét
      canvas.style.cssText = img.style.cssText;
      canvas.className = img.className;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      const ctx = canvas.getContext('2d');
      // Vẽ ảnh phủ kín canvas theo kiểu object-cover
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (ir > cr) { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; }
      else { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const parent = img.parentNode;
      if (parent) {
        parent.replaceChild(canvas, img);
        restores.push(() => { try { parent.replaceChild(img, canvas); } catch {} });
      }
    } catch (e) { /* ảnh lỗi thì bỏ qua, không chặn export */ }
  }));
  return () => restores.forEach(fn => fn());
}

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
    .filter(m => m.status === 'done' && (String(m.homeId) === String(teamId) || String(m.awayId) === String(teamId)));
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

const Standings = ({ darkMode, teams = [], matches = [], tournamentInfo, standings }) => {
  const activeName = tournamentInfo?.name || 'Giải đấu PNH Football';
  const activeLogo = tournamentInfo?.logo || tournamentInfo?.logoUrl || '';

  const rows = useMemo(() => {
    let base;
    if (standings && standings.length > 0) {
      base = standings.map(s => ({
        id: s.id,
        name: s.name || 'Đội bóng',
        logo: s.logo || '',
        P: s.P ?? 0, W: s.W ?? 0, D: s.D ?? 0, L: s.L ?? 0,
        GF: s.GF ?? 0, GA: s.GA ?? 0, GD: s.GD ?? 0, Pts: s.Pts ?? 0,
      }));
    } else {
      base = calcStandings(teams, matches);
    }
    return base.map(r => ({ ...r, form: calcForm(r.id, matches) }));
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

    // Chuyển ảnh base64 -> canvas (snapdom mới chụp được logo đội)
    let restore = () => {};
    try {
      restore = await rasterizeImages(el);
      await new Promise(r => setTimeout(r, 100));

      const safeName = (activeName || 'BangXepHang').replace(/[^a-zA-Z0-9]/g, '_');
      const result = await snapdom(el, { scale: 2, backgroundColor: '#0a0f1d' });

      // Phat hien dien thoai (mobile)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Tren mobile: download() tu dong thuong bi chan -> mo anh ra tab moi
        // de nguoi dung NHAN GIU anh va luu vao thu vien.
        let dataUrl = '';
        try {
          const canvas = await result.toCanvas();   // snapdom tra ve canvas
          dataUrl = canvas.toDataURL('image/png');
        } catch {
          // Du phong: thu toPng (mot so phien ban snapdom)
          try { const img = await result.toPng(); dataUrl = img.src; } catch {}
        }

        if (dataUrl) {
          const w = window.open('');
          if (w) {
            w.document.write(
              `<html><head><title>BXH ${safeName}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
              `<body style="margin:0;background:#0a0f1d;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif">` +
              `<p style="color:#fff;padding:12px;text-align:center">Nhấn giữ vào ảnh để Lưu ảnh về máy</p>` +
              `<img src="${dataUrl}" style="max-width:100%;height:auto"/></body></html>`
            );
          } else {
            await result.download({ format: 'png', filename: `BXH_${safeName}` });
          }
        } else {
          await result.download({ format: 'png', filename: `BXH_${safeName}` });
        }
      } else {
        // Laptop: tai binh thuong
        await result.download({ format: 'png', filename: `BXH_${safeName}` });
      }
    } catch (err) {
      console.error('Export BXH error:', err);
      alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } finally {
      restore();
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Nút chế độ + tải ảnh */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        {/* Nút chuyển chế độ (chỉ hiện khi giải có chia bảng) */}
        {isGrouped ? (
          <div className="inline-flex rounded-xl border border-slate-700 overflow-hidden">
            <button onClick={() => setViewMode('points')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${viewMode === 'points' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              <ListOrdered size={14} /> Bảng điểm
            </button>
            <button onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              <LayoutGrid size={14} /> Danh sách đội
            </button>
          </div>
        ) : <div />}
        <button onClick={handleDownloadImage} disabled={exporting || rows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
          <Download size={14} className={exporting ? 'animate-bounce' : ''} />
          {exporting ? 'Đang tạo ảnh...' : 'Tải Ảnh BXH'}
        </button>
      </div>

      <div id="standings-capture" className="space-y-5 rounded-3xl p-4 sm:p-8" style={{ background: 'linear-gradient(160deg, #0a0f1d 0%, #0d1426 60%, #0a1020 100%)' }}>
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
              <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px', lineHeight: 1.15, margin: 0, textShadow: '0 2px 12px rgba(56,189,248,0.3)' }}>
                {activeName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', justifyContent: activeLogo ? 'flex-start' : 'center' }}>
                <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #38bdf8, #06b6d4)' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: '#38bdf8', textTransform: 'uppercase' }}>Bảng Xếp Hạng</span>
                {!activeLogo && <span style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #06b6d4, #38bdf8)' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* ── BANG XEP HANG: theo tung bang (neu co) hoac chung ── */}
        {isGrouped ? (
          <div className={viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6' : 'grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-6'}>
            {groupStandings.map(({ groupName, rows: gRows }) => (
              <div key={groupName}>
                {/* Tieu de bang */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #0e7490)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(56,189,248,0.35)' }}>
                    <Trophy size={17} color="#ffffff" />
                  </span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff' }}>Bảng {groupName}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px' }}>{gRows.length} đội</span>
                </div>
                {viewMode === 'points'
                  ? <StandingsTable rows={gRows} />
                  : <TeamListTable rows={gRows} />}
              </div>
            ))}
          </div>
        ) : (
          <StandingsTable rows={rows} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg, #38bdf8, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={12} color="#0a0f1d" />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#cbd5e1', letterSpacing: '1px' }}>PNH FOOTBALL</span>
          </div>
          <span style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>Hệ thống quản lý giải đấu chuyên nghiệp</span>
        </div>
      </div>{/* end standings-capture */}
    </div>
  );
};

// ─── Bảng điểm (chế độ points) ───
function StandingsTable({ rows }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e293b', background: '#0f1729', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '36px' }} />
          <col />
          <col style={{ width: '40px' }} />
          <col style={{ width: '32px' }} />
          <col style={{ width: '32px' }} />
          <col style={{ width: '32px' }} />
          <col style={{ width: '56px' }} />
          <col style={{ width: '44px' }} />
          <col style={{ width: '48px' }} />
          <col style={{ width: '92px' }} />
        </colgroup>
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-wide text-slate-400 bg-slate-900/60 border-b border-slate-800">
            <th className="px-1 py-3 text-center">#</th>
            <th className="px-2 py-3 text-left">ĐỘI BÓNG</th>
            <th className="px-1 py-3 text-center">TR</th>
            <th className="px-1 py-3 text-center">T</th>
            <th className="px-1 py-3 text-center">H</th>
            <th className="px-1 py-3 text-center">B</th>
            <th className="px-1 py-3 text-center">BT/BB</th>
            <th className="px-1 py-3 text-center">HS</th>
            <th className="px-1 py-3 text-center text-yellow-400">Đ</th>
            <th className="px-1 py-3 text-center">PHONG ĐỘ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {rows.map((row, idx) => {
            let borderColor = 'border-l-transparent', bgHighlight = '';
            if (idx === 0)      { borderColor = 'border-l-yellow-500 border-l-4'; bgHighlight = 'bg-yellow-500/5'; }
            else if (idx === 1) { borderColor = 'border-l-slate-400 border-l-4';  bgHighlight = 'bg-slate-400/5'; }
            else if (idx === 2) { borderColor = 'border-l-amber-700 border-l-4';  bgHighlight = 'bg-amber-700/5'; }
            else if (idx >= rows.length - 1 && rows.length >= 4) { borderColor = 'border-l-red-500 border-l-4'; bgHighlight = 'bg-red-500/5'; }
            return (
              <tr key={row.id} className={`transition-colors duration-150 ${borderColor} ${bgHighlight} hover:bg-slate-800`}>
                <td className="px-1 py-3.5 text-center font-black text-slate-500 text-xs">{idx + 1}</td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 bg-slate-800">
                      {renderLogo(row.logo)}
                    </div>
                    <span className="text-[13px] font-bold text-white tracking-wide truncate">{row.name}</span>
                  </div>
                </td>
                <td className="px-1 py-3.5 text-center font-bold text-slate-300 text-xs">{row.P}</td>
                <td className="px-1 py-3.5 text-center font-black text-emerald-500 text-xs">{row.W}</td>
                <td className="px-1 py-3.5 text-center font-semibold text-slate-400 text-xs">{row.D}</td>
                <td className="px-1 py-3.5 text-center font-black text-red-500 text-xs">{row.L}</td>
                <td className="px-1 py-3.5 text-center text-slate-400 text-xs font-medium whitespace-nowrap">{row.GF}-{row.GA}</td>
                <td className={`px-1 py-3.5 text-center font-bold text-xs ${row.GD > 0 ? 'text-emerald-400' : row.GD < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {row.GD > 0 ? '+' : ''}{row.GD}
                </td>
                <td className="px-1 py-3.5 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-black/45 text-yellow-400 font-black text-xs shadow-inner border border-yellow-500/10">{row.Pts}</span>
                </td>
                <td className="px-1 py-3.5"><FormBadges form={row.form} /></td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500 italic">Chưa có kết quả trận đấu nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Danh sách đội (chế độ list - giống Group Draw) ───
function TeamListTable({ rows }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e293b', background: '#0f1729' }}>
      {rows.map((row, idx) => (
        <div key={row.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-slate-800/50' : ''}`}>
          <span className="w-6 text-center font-black text-slate-600 text-sm">{idx + 1}</span>
          <div className="w-9 h-9 rounded-full border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 bg-slate-800">
            {renderLogo(row.logo)}
          </div>
          <span className="text-sm font-bold text-white tracking-wide truncate flex-1">{row.name}</span>
        </div>
      ))}
      {rows.length === 0 && <div className="px-4 py-10 text-center text-slate-500 italic text-sm">Chưa có đội nào.</div>}
    </div>
  );
}

export default Standings;