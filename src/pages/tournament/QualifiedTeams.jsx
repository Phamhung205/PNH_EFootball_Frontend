import React, { useState, useEffect, useMemo } from 'react';
import { knockoutApi } from '../../services/api';
import { Download, Image as ImageIcon, Loader2, Trophy } from 'lucide-react';
import { snapdom } from '@zumer/snapdom';

// ──────────────────────────────────────────────────────────────
// ẢNH CÁC ĐỘI LỌT VÀO VÒNG TRONG (phong cách Champions League "ROUND OF 16")
// - Lấy đội tự động từ knockout đã tạo
// - Tiêu đề tự đổi theo vòng (Vòng 1/16, Tứ Kết, Bán Kết, Chung Kết...)
// - Có nút tải ảnh (hỗ trợ iOS Safari)
// Props: tournament, tournamentName, isAdmin (không bắt buộc)
// ──────────────────────────────────────────────────────────────

const KNOCKOUT_BASE = 100;
const THIRD_PLACE_ROUND = 999;

// Tên vòng tiếng Việt + tiếng Anh theo số đội
function roundLabels(teamsInRound) {
  if (teamsInRound === 2) return { vi: 'CHUNG KẾT', en: 'FINAL' };
  if (teamsInRound === 4) return { vi: 'BÁN KẾT', en: 'SEMI-FINALS' };
  if (teamsInRound === 8) return { vi: 'TỨ KẾT', en: 'QUARTER-FINALS' };
  if (teamsInRound === 16) return { vi: 'VÒNG 1/8', en: 'ROUND OF 16' };
  if (teamsInRound === 32) return { vi: 'VÒNG 1/16', en: 'ROUND OF 32' };
  return { vi: `VÒNG 1/${teamsInRound / 2}`, en: `ROUND OF ${teamsInRound}` };
}

// Hiện ảnh full màn hình để NHẤN GIỮ lưu (iOS Safari)
function showImageOverlay(dataUrl, language = 'vi') {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow:auto;padding:16px;box-sizing:border-box;';
  const hint = document.createElement('p');
  hint.textContent = tr('Nhấn giữ vào ảnh → "Thêm vào Ảnh" để lưu', 'Press and hold the image → "Add to Photos" to save');
  hint.style.cssText = 'color:#fff;font-family:sans-serif;font-size:14px;text-align:center;margin:8px 0 14px;font-weight:bold;';
  const img = document.createElement('img');
  img.src = dataUrl;
  img.style.cssText = 'max-width:100%;height:auto;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.5);';
  const btn = document.createElement('button');
  btn.textContent = tr('Đóng', 'Close');
  btn.style.cssText = 'margin:16px 0;padding:10px 28px;border:none;border-radius:10px;background:#1e63d0;color:#fff;font-size:15px;font-weight:bold;cursor:pointer;';
  btn.onclick = () => document.body.removeChild(overlay);
  overlay.appendChild(hint); overlay.appendChild(img); overlay.appendChild(btn);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
  document.body.appendChild(overlay);
}

// Chuyển ảnh base64 -> canvas để snapdom chụp được logo
async function rasterizeImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores = [];
  await Promise.all(imgs.map((img) => new Promise((resolve) => {
    try {
      const src = img.getAttribute('src') || '';
      if (!src) return resolve();
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = tmp.naturalWidth || 100; cv.height = tmp.naturalHeight || 100;
          cv.getContext('2d').drawImage(tmp, 0, 0);
          const dataUrl = cv.toDataURL('image/png');
          const prev = img.getAttribute('src');
          img.setAttribute('src', dataUrl);
          restores.push(() => img.setAttribute('src', prev));
        } catch {}
        resolve();
      };
      tmp.onerror = () => resolve();
      tmp.src = src;
    } catch { resolve(); }
  })));
  return () => restores.forEach(fn => fn());
}

export default function QualifiedTeams({ tournament, tournamentName = 'GIẢI ĐẤU', language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const tournamentId = tournament?.id;
  const [matches, setMatches] = useState([]);
  // Danh sach doi SE vao knockout — hien khi CHUA tao so do
  const [qualified, setQualified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tournamentId) return;
      setLoading(true);
      try {
        const data = await knockoutApi.get(tournamentId);
        // Chua co so do -> lay danh sach doi du dieu kien de hien truoc
        if (!data || data.length === 0) {
          try { setQualified(await knockoutApi.getQualified(tournamentId)); }
          catch { setQualified(null); }
        }
        if (alive) setMatches(Array.isArray(data) ? data : []);
      } catch { if (alive) setMatches([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [tournamentId]);

  // Gom các vòng (bỏ trận tranh hạng 3), tính số đội mỗi vòng + danh sách đội
  const rounds = useMemo(() => {
    const bracket = matches.filter(m => !m.isThirdPlace && m.round !== THIRD_PLACE_ROUND);
    const byRound = {};
    bracket.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });
    const roundNums = Object.keys(byRound).map(Number).sort((a, b) => a - b);

    return roundNums.map(rNum => {
      const ms = byRound[rNum];
      // Lấy các đội tham gia vòng này (cả 2 đội mỗi trận), loại trùng + loại ô trống
      const teamMap = new Map();
      ms.forEach(m => {
        // Backend tra field 'homeId'/'awayId' (KnockoutController), doc them 'homeTeamId' de tuong thich
        const hId = m.homeTeamId ?? m.homeId;
        const aId = m.awayTeamId ?? m.awayId;
        if (hId && m.homeName) teamMap.set(hId, { id: hId, name: m.homeName, logo: m.homeLogo });
        if (aId && m.awayName) teamMap.set(aId, { id: aId, name: m.awayName, logo: m.awayLogo });
      });
      const teams = Array.from(teamMap.values());
      const teamsInRound = ms.length * 2; // số đội dự kiến của vòng
      return { round: rNum, teamsInRound, teams, labels: roundLabels(teamsInRound) };
    }).slice(0, 1); // CHI hien vong dau tien (danh sach doi vao vong trong), khong hien 1/8, tu ket...
  }, [matches]);

  // Vòng đang chọn (mặc định vòng đầu tiên)
  const activeRound = useMemo(() => {
    if (rounds.length === 0) return null;
    if (selectedRound == null) return rounds[0];
    return rounds.find(r => r.round === selectedRound) || rounds[0];
  }, [rounds, selectedRound]);

  const handleExport = async () => {
    const el = document.getElementById('qualified-poster');
    if (!el) return;
    setExporting(true);
    let restore = () => {};
    try {
      restore = await rasterizeImages(el);
      await new Promise(r => setTimeout(r, 120));
      const safe = (tournamentName || 'Giai').replace(/[^a-zA-Z0-9]/g, '_');
      const result = await snapdom(el, { scale: 2, backgroundColor: '#0a1a52' });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        let dataUrl = '';
        try { const cv = await result.toCanvas(); dataUrl = cv.toDataURL('image/png'); }
        catch { try { const img = await result.toPng(); dataUrl = img.src; } catch {} }
        if (dataUrl) showImageOverlay(dataUrl, language);
        else await result.download({ format: 'png', filename: `DoiVaoVong_${safe}` });
      } else {
        await result.download({ format: 'png', filename: `DoiVaoVong_${safe}` });
      }
    } catch (e) {
      alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } finally {
      restore();
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-blue-300"><Loader2 className="animate-spin mr-2" size={20} />{tr('Đang tải...', 'Loading...')}</div>;
  }

  if (rounds.length === 0) {
    const qTeams = qualified?.teams || [];
    const qPairs = qualified?.pairs || [];

    return (
      <div className="space-y-4">
        {/* Chua tao so do -> cho xem TRUOC danh sach doi se vao vong trong */}
        {qTeams.length > 0 ? (
          <>
            {/* Nut tai anh — nam NGOAI vung chup de khong lot vao anh */}
            <div className="flex justify-end">
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold transition-all">
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {exporting ? tr('Đang tạo ảnh...', 'Creating image...') : tr('Tải Ảnh', 'Download Image')}
              </button>
            </div>

            {/* Vung duoc chup thanh anh */}
            <div id="qualified-poster" className="space-y-4 p-4 rounded-3xl" style={{ background: '#0a1a52' }}>
              {/* Tieu de trong anh */}
              <div className="text-center pb-1">
                <h2 className="text-xl font-black text-white tracking-wide">{tournamentName}</h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300/70 mt-1">
                  {tr('Các Đội Lọt Vào Vòng Trong', 'Teams Advancing to Knockout')}
                </p>
              </div>

            <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} className="text-amber-400" />
                <h3 className="font-black text-blue-100">
                  {tr('Các Đội Lọt Vào Vòng Trong', 'Teams Advancing to Knockout')}
                </h3>
              </div>
              <p className="text-xs text-blue-300/70 mb-4">
                {tr(`${qTeams.length} đội · lấy ${qualified?.perGroup ?? 2} đội mỗi bảng · xem trước khi tạo sơ đồ`,
                    `${qTeams.length} teams · top ${qualified?.perGroup ?? 2} per group · preview before creating the bracket`)}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {qTeams.map((t) => (
                  <div key={t.teamId}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20">
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-blue-500/25 text-blue-200 text-[11px] font-black flex items-center justify-center">
                      {t.seed}
                    </span>
                    {t.logo
                      ? <img src={t.logo} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      : <div className="w-7 h-7 rounded-lg bg-blue-500/20 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-50 truncate">{t.name}</p>
                      {t.groupName && (
                        <p className="text-[10px] text-blue-300/60">{tr('Bảng', 'Group')} {t.groupName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cap dau du kien */}
            {qPairs.length > 0 && (
              <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                <h3 className="font-black text-blue-100 mb-3 text-sm">
                  {tr('Cặp Đấu Dự Kiến', 'Projected Matchups')}
                </h3>
                <div className="space-y-2">
                  {qPairs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-blue-300/50 font-bold">{i + 1}</span>
                      <span className="flex-1 text-right font-bold text-blue-50 truncate">{p.home?.name}</span>
                      <span className="px-2 text-blue-300/50 font-black">vs</span>
                      <span className="flex-1 font-bold text-blue-50 truncate">{p.away?.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-blue-300/60 mt-3">
                  {tr('Cặp đấu chốt lại khi bạn bấm tạo sơ đồ ở tab Sơ Đồ Loại.',
                      'Matchups are finalised when you create the bracket in the Knockout tab.')}
                </p>
              </div>
            )}
            </div>{/* het vung chup */}
          </>
        ) : (
          <div className="text-center py-16 rounded-3xl border border-dashed border-blue-400/20 text-blue-300/60">
            <Trophy size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold mb-1">{tr('Chưa có sơ đồ knockout', 'No knockout bracket yet')}</p>
            <p className="text-sm">
              {tr('Cần hoàn thành vòng bảng để biết đội nào đi tiếp, hoặc tạo sơ đồ ở tab Sơ Đồ Loại.',
                  'Finish the group stage to see who advances, or create the bracket in the Knockout tab.')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Số cột lưới logo theo số đội (cho cân đối)
  const n = activeRound.teams.length;
  // Giong mau Champions League: 4 cot co dinh (logo to, deu). <=4:2 | <=9:3 | con lai:4
  const cols = n <= 4 ? 2 : (n <= 9 ? 3 : 4);

  return (
    <div className="space-y-5">
      {/* Tiêu đề + nút tải */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-black text-white">{tr('Đội Vào Vòng Trong', 'Qualified Teams')}</div>
          <div className="text-xs text-blue-300/60 font-medium">{tr('Các đội lọt vào vòng knockout', 'Teams advancing to the knockout stage')}</div>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/25 disabled:opacity-60 transition-all">
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {tr('Tải Ảnh', 'Download')}
        </button>
      </div>

      {/* POSTER - vùng chụp ảnh */}
      <div id="qualified-poster" className="relative rounded-3xl overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 20% 30%, #1a3a8f 0%, #0a1a52 60%, #060f38 100%)', minHeight: '340px' }}>
        {/* Hiệu ứng đường cong nền */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 40%, rgba(80,140,255,0.08) 50%, transparent 60%)' }} />

        <div className="relative h-full flex items-center p-5 md:p-8 gap-4">
          {/* BÊN TRÁI: tiêu đề lớn (thu nhỏ khi nhiều đội để nhường chỗ lưới) */}
          <div className="flex flex-col justify-center min-w-0" style={{ flex: '0 0 38%' }}>
            {/* Logo bóng UCL-style */}
            <div className="mb-4">
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={26} className="text-white" />
              </div>
            </div>
            <div className="text-white font-black leading-[0.95]" style={{ fontSize: 'clamp(30px, 6.5vw, 68px)', textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
              ROUND OF {n}
            </div>
            <div className="text-blue-200/80 font-bold mt-2 tracking-wide" style={{ fontSize: 'clamp(12px, 2vw, 18px)' }}>
              {tournamentName}
            </div>
          </div>

          {/* BÊN PHẢI: lưới logo các đội */}
          <div className="flex items-center justify-center min-w-0" style={{ flex: '1 1 62%' }}>
            <div className="rounded-2xl p-2.5 sm:p-4 md:p-5 w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '100%' }}>
              <div className="grid gap-2 sm:gap-3 md:gap-4 mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, width: '100%', maxWidth: '100%' }}>
                {activeRound.teams.map(t => (
                  <div key={t.id} className="flex flex-col items-center gap-1.5">
                    <div style={{ width: '100%', aspectRatio: '1 / 1', maxWidth: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '5px' }}>
                      {t.logo
                        ? <img src={t.logo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <Trophy size={22} className="text-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-3 left-5 flex items-center gap-1.5 text-white/40 text-[10px] font-bold tracking-widest">
          <Trophy size={12} /> PNH FOOTBALL
        </div>
      </div>

      {/* Danh sách tên đội (dưới poster, để xem rõ) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {activeRound.teams.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
            {t.logo ? <img src={t.logo} alt="" className="w-6 h-6 rounded-full object-cover bg-white" /> : <Trophy size={14} className="text-blue-400" />}
            <span className="text-xs font-bold text-white/80 truncate">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}