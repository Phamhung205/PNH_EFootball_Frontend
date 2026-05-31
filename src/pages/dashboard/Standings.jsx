import React, { useMemo, useState } from 'react';
import { Trophy, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

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

// Tính phong độ 5 trận gần nhất cho 1 đội từ matches
const calcForm = (teamId, matches) => {
  const done = matches
    .filter(m => m.status === 'done' && (String(m.homeId) === String(teamId) || String(m.awayId) === String(teamId)));
  // Lấy 5 trận gần nhất (cuối mảng)
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
    <div className="flex items-center justify-center gap-1">
      {form.map((r, i) => (
        <span key={i} title={r}
          className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black text-white ${color[r] || 'bg-slate-600'}`}>
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
  // Emoji: dùng inline-flex để căn chính giữa cả ngang lẫn dọc khi html2canvas chụp
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

  // Ưu tiên dùng standings từ backend (prop). Nếu không có thì tự tính từ matches.
  const rows = useMemo(() => {
    let base;
    if (standings && standings.length > 0) {
      // standings từ backend đã chuẩn hóa qua api.js (P,W,D,L,GF,GA,GD,Pts,name,logo)
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
    // Gắn phong độ 5 trận gần nhất (tính từ matches)
    return base.map(r => ({ ...r, form: calcForm(r.id, matches) }));
  }, [standings, teams, matches]);

  const [exporting, setExporting] = useState(false);

  const handleDownloadImage = async () => {
    const el = document.getElementById('standings-capture');
    if (!el) return;
    setExporting(true);
    // Chờ render + browser vẽ xong (tránh lỗi chỉ tải được khi mở F12)
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 350));

    // Đợi tất cả ảnh logo tải xong trước khi chụp
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.onload = res;
        img.onerror = res;
        setTimeout(res, 3000);
      });
    }));

    // Ẩn ảnh hỏng (kích thước 0) để tránh lỗi createPattern
    const hiddenImgs = [];
    imgs.forEach(img => {
      if (!img.naturalWidth || !img.naturalHeight) {
        hiddenImgs.push([img, img.style.display]);
        img.style.display = 'none';
      }
    });
    const restoreImgs = () => hiddenImgs.forEach(([img, disp]) => { img.style.display = disp; });

    try {
      const canvas = await html2canvas(el, {
        useCORS: true, allowTaint: true, scale: 2, backgroundColor: '#0a0f1a', logging: false,
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
      const link = document.createElement('a');
      const safeName = (activeName || 'BangXepHang').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `BXH_${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export BXH error:', err);
      alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } finally {
      restoreImgs();
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Nút tải ảnh */}
      <div className="flex justify-end">
        <button onClick={handleDownloadImage} disabled={exporting || rows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
          <Download size={14} className={exporting ? 'animate-bounce' : ''} />
          {exporting ? 'Đang tạo ảnh...' : 'Tải Ảnh BXH'}
        </button>
      </div>

      <div id="standings-capture" className="space-y-6 p-4 rounded-2xl" style={{ background: '#0a0f1a' }}>
      <div className="flex flex-col items-center justify-center text-center space-y-2 mb-6">
        <div className="flex items-center gap-3">
          {activeLogo ? (
            <img src={activeLogo} alt="" className="w-10 h-10 rounded-xl object-contain shadow-lg border border-slate-700/30" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy size={20} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            {activeName}
          </h1>
        </div>
        <p className="text-xs font-black tracking-widest text-slate-400 uppercase">BẢNG XẾP HẠNG - PNH FOOTBALL</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <th className="px-4 py-3.5 text-center w-12">STT</th>
                <th className="px-4 py-3.5 text-left">ĐỘI BÓNG</th>
                <th className="px-3 py-3.5 text-center w-16">TRẬN</th>
                <th className="px-3 py-3.5 text-center w-16">T</th>
                <th className="px-3 py-3.5 text-center w-16">H</th>
                <th className="px-3 py-3.5 text-center w-16">B</th>
                <th className="px-3 py-3.5 text-center w-24">BT/BB</th>
                <th className="px-3 py-3.5 text-center w-16">HS</th>
                <th className="px-3 py-3.5 text-center w-24 text-yellow-400 font-bold">ĐIỂM</th>
                <th className="px-3 py-3.5 text-center w-40">PHONG ĐỘ</th>
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
                    <td className="px-4 py-4 text-center font-black text-slate-500 text-sm">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 bg-slate-800">
                          {renderLogo(row.logo)}
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center font-bold text-slate-300 text-sm">{row.P}</td>
                    <td className="px-3 py-4 text-center font-black text-emerald-500 text-sm">{row.W}</td>
                    <td className="px-3 py-4 text-center font-semibold text-slate-400 text-sm">{row.D}</td>
                    <td className="px-3 py-4 text-center font-black text-red-500 text-sm">{row.L}</td>
                    <td className="px-3 py-4 text-center text-slate-400 text-sm font-medium">{row.GF}-{row.GA}</td>
                    <td className={`px-3 py-4 text-center font-bold text-sm ${row.GD > 0 ? 'text-emerald-400' : row.GD < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {row.GD > 0 ? '+' : ''}{row.GD}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-black/45 text-yellow-400 font-black text-sm tracking-wide shadow-inner border border-yellow-500/10">{row.Pts}</span>
                    </td>
                    <td className="px-3 py-4"><FormBadges form={row.form} /></td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500 italic">
                    Chưa có kết quả trận đấu nào để cập nhật bảng xếp hạng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        <div className="flex items-center justify-end gap-4 mt-4 text-xs">
          <div className="text-slate-600 font-medium italic text-[11px]">Được tạo bởi PNH FOOTBALL</div>
        </div>
      </div>{/* end standings-capture */}
    </div>
  );
};

export default Standings;