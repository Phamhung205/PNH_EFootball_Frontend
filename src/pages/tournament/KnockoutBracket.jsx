import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Crown, GitMerge, Loader2, Download, Image as ImageIcon, ListChecks, RefreshCw, AlertTriangle } from 'lucide-react';
import { snapdom } from '@zumer/snapdom';
import { knockoutApi } from '../../services/api';

const KNOCKOUT_BASE = 100;

// Nhan vong theo so doi tham gia vong do
const roundName = (teamsInRound) => {
  if (teamsInRound === 2) return 'Chung Kết';
  if (teamsInRound === 4) return 'Bán Kết';
  if (teamsInRound === 8) return 'Tứ Kết';
  if (teamsInRound === 16) return 'Vòng 1/8';
  if (teamsInRound === 32) return 'Vòng 1/16';
  return `Vòng 1/${teamsInRound / 2}`;
};

// Hien anh full man hinh bang overlay (de NHAN GIU luu tren iOS Safari).
// Khong dung window.open vi Safari chan popup.
function showImageOverlay(dataUrl) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;' +
    'overflow:auto;padding:16px;box-sizing:border-box;';
  const hint = document.createElement('p');
  hint.textContent = 'Nhấn giữ vào ảnh → "Thêm vào Ảnh" để lưu';
  hint.style.cssText = 'color:#fff;font-family:sans-serif;font-size:14px;text-align:center;margin:8px 0 14px;font-weight:bold;';
  const img = document.createElement('img');
  img.src = dataUrl;
  img.style.cssText = 'max-width:100%;height:auto;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.5);';
  const btn = document.createElement('button');
  btn.textContent = 'Đóng';
  btn.style.cssText = 'margin:16px 0;padding:10px 28px;border:none;border-radius:10px;' +
    'background:#06b6d4;color:#fff;font-size:15px;font-weight:bold;cursor:pointer;';
  btn.onclick = () => document.body.removeChild(overlay);
  overlay.appendChild(hint);
  overlay.appendChild(img);
  overlay.appendChild(btn);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
  document.body.appendChild(overlay);
}

// Chuyen ảnh base64 -> canvas de snapdom chup duoc
async function rasterizeImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores = [];
  await Promise.all(imgs.map(async (img) => {
    try {
      if (!(img.complete && img.naturalWidth > 0)) {
        await new Promise(res => { img.onload = res; img.onerror = res; setTimeout(res, 3000); });
      }
      if (!img.naturalWidth) return;
      if (img.decode) { try { await img.decode(); } catch {} }
      const rect = img.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width || 24)), h = Math.max(1, Math.round(rect.height || 24));
      const canvas = document.createElement('canvas');
      canvas.width = w * 2; canvas.height = h * 2;
      canvas.style.cssText = img.style.cssText; canvas.className = img.className;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (ir > cr) { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; }
      else { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const parent = img.parentNode;
      if (parent) { parent.replaceChild(canvas, img); restores.push(() => { try { parent.replaceChild(img, canvas); } catch {} }); }
    } catch {}
  }));
  return () => restores.forEach(fn => fn());
}

export default function KnockoutBracket({ tournament, teams = [], tournamentName = 'GIẢI ĐẤU', isAdmin = false }) {
  const tournamentId = tournament?.id;
  const [matches, setMatches] = useState([]);   // các trận knockout từ backend
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState('');

  // ─── Tải sơ đồ từ backend ───
  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const data = await knockoutApi.get(tournamentId);
      setMatches(data);
    } catch (e) {
      setErr(e.message || 'Lỗi tải sơ đồ');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  // ─── Tạo sơ đồ tự động ───
  // Backend TỰ ĐỘNG quyết định: nếu 2 đội/bảng ra số đẹp (16, 32...) thì dùng;
  // nếu không (vd 12 bảng x 2 = 24) thì tự lấy thêm hạng ba tốt nhất cho đủ (32).
  const handleGenerate = async () => {
    if (!isAdmin) return;
    if (matches.length > 0 && !window.confirm('Tạo lại sơ đồ sẽ XÓA kết quả knockout hiện tại. Tiếp tục?')) return;
    setGenerating(true); setErr('');
    try {
      const data = await knockoutApi.generate(tournamentId, {});
      setMatches(data);
    } catch (e) {
      setErr(e.message || 'Lỗi tạo sơ đồ. Đảm bảo vòng bảng đã có kết quả.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Xóa toàn bộ sơ đồ knockout ───
  const handleClear = async () => {
    if (!isAdmin) return;
    if (!window.confirm('Xóa TOÀN BỘ sơ đồ knockout? Các kết quả knockout sẽ mất. Vòng bảng KHÔNG bị ảnh hưởng.')) return;
    setGenerating(true); setErr('');
    try {
      await knockoutApi.clearKnockout(tournamentId);
      setMatches([]); // xoa tren UI ngay
    } catch (e) {
      setErr(e.message || 'Lỗi khi xóa sơ đồ.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Nhập tỉ số 1 trận -> lưu DB ───
  const handleScore = async (matchId, homeScore, awayScore, homePenalty = null, awayPenalty = null) => {
    if (!isAdmin) return;
    // Cập nhật tạm trên UI cho mượt
    setMatches(prev => prev.map(m => m.matchId === matchId ? { ...m, homeScore, awayScore, homePenalty, awayPenalty } : m));
    try {
      const data = await knockoutApi.saveScore(matchId, homeScore, awayScore, homePenalty, awayPenalty);
      setMatches(data); // backend trả về sơ đồ mới (đã đẩy đội thắng lên vòng sau)
    } catch (e) {
      setErr(e.message || 'Lỗi lưu tỉ số');
      load(); // tải lại nếu lỗi
    }
  };

  // ─── Tải ảnh: 2 loại (sơ đồ / bảng kết quả) ───
  const exportImage = async (elementId, filePrefix) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    setExporting(true);
    let restore = () => {};

    // TAM bo gioi han cuon + no khung rong het de chup TOAN BO so do
    // (neu khong, snapdom chi chup phan dang nhin thay trong khung cuon).
    const prevOverflow = el.style.overflow;
    const prevOverflowX = el.style.overflowX;
    const prevWidth = el.style.width;
    const prevMaxWidth = el.style.maxWidth;
    // Lay chieu rong THUC (ca phan bi cuon an) roi ep khung bang dung kich thuoc do
    const fullWidth = el.scrollWidth;
    el.style.overflow = 'visible';
    el.style.overflowX = 'visible';
    el.style.width = `${fullWidth}px`;
    el.style.maxWidth = 'none';

    try {
      restore = await rasterizeImages(el);
      await new Promise(r => setTimeout(r, 150)); // cho layout no ra
      const safe = (tournamentName || 'Knockout').replace(/[^a-zA-Z0-9]/g, '_');
      const result = await snapdom(el, { scale: 2, backgroundColor: '#0a1530', width: fullWidth });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // iOS Safari: hien anh overlay de NHAN GIU luu (download bi chan)
        let dataUrl = '';
        try { const canvas = await result.toCanvas(); dataUrl = canvas.toDataURL('image/png'); }
        catch { try { const img = await result.toPng(); dataUrl = img.src; } catch {} }
        if (dataUrl) showImageOverlay(dataUrl);
        else await result.download({ format: 'png', filename: `${filePrefix}_${safe}` });
      } else {
        await result.download({ format: 'png', filename: `${filePrefix}_${safe}` });
      }
    } catch (e) {
      alert('Lỗi khi tạo ảnh. Thử lại nhé.');
    } finally {
      restore();
      // Tra lai khung nhu cu (co thanh cuon)
      el.style.overflow = prevOverflow;
      el.style.overflowX = prevOverflowX;
      el.style.width = prevWidth;
      el.style.maxWidth = prevMaxWidth;
      setExporting(false);
    }
  };

  // ─── Tách trận tranh hạng 3 ra riêng (không phải 1 vòng của bracket) ───
  const thirdPlaceMatch = matches.find(m => m.isThirdPlace) || null;
  const bracketMatches = matches.filter(m => !m.isThirdPlace);

  // ─── Tổ chức dữ liệu: gom theo round ───
  const rounds = (() => {
    const byRound = {};
    bracketMatches.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });
    const existing = Object.keys(byRound).map(Number).sort((a, b) => a - b);
    if (existing.length === 0) return [];

    const firstRoundNum = existing[0];
    const firstRoundCount = byRound[firstRoundNum].length;
    let totalRounds = 1, c = firstRoundCount;
    while (c > 1) { c = Math.ceil(c / 2); totalRounds++; }

    // Moi vong: { matches, expectedCount (so tran du kien), teamsInRound (so doi du kien) }
    const result = [];
    let expected = firstRoundCount;
    for (let i = 0; i < totalRounds; i++) {
      const rNum = firstRoundNum + i;
      result.push({
        matches: byRound[rNum] || [],
        expectedCount: expected,       // so tran vong nay (du kien)
        teamsInRound: expected * 2,    // so doi tham gia vong nay
      });
      expected = Math.ceil(expected / 2);
    }
    return result;
  })();

  const numRounds = rounds.length;
  const finalRound = numRounds > 0 ? rounds[numRounds - 1] : null;
  const finalMatch = finalRound && finalRound.matches.length > 0 ? finalRound.matches[0] : null;
  // Nha vo dich: thang ti so chinh, HOAC thang luan luu neu chung ket hoa
  const champion = (() => {
    if (!finalMatch || finalMatch.homeScore == null || finalMatch.awayScore == null) return null;
    if (finalMatch.homeScore !== finalMatch.awayScore) {
      return finalMatch.homeScore > finalMatch.awayScore
        ? { name: finalMatch.homeName, logo: finalMatch.homeLogo }
        : { name: finalMatch.awayName, logo: finalMatch.awayLogo };
    }
    // Hoa -> xet luan luu
    if (finalMatch.homePenalty != null && finalMatch.awayPenalty != null && finalMatch.homePenalty !== finalMatch.awayPenalty) {
      return finalMatch.homePenalty > finalMatch.awayPenalty
        ? { name: finalMatch.homeName, logo: finalMatch.homeLogo }
        : { name: finalMatch.awayName, logo: finalMatch.awayLogo };
    }
    return null;
  })();

  // ─── Trạng thái: chưa có sơ đồ ───
  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>;
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-3xl p-10 text-center" style={{ background: 'radial-gradient(ellipse at center, #16285f 0%, #0a1530 72%)' }}>
        <GitMerge size={48} className="mx-auto text-cyan-400/60 mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Chưa có sơ đồ loại trực tiếp</h2>
        <p className="text-sm text-blue-300/70 mb-6 max-w-md mx-auto">
          {isAdmin
            ? 'Bấm nút bên dưới để tự động lấy 2 đội đứng đầu mỗi bảng vào sơ đồ knockout. Vòng bảng cần có kết quả trước.'
            : 'Sơ đồ knockout chưa được tạo. Vui lòng quay lại sau.'}
        </p>
        {isAdmin && (
          <button onClick={() => handleGenerate()} disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-black shadow-lg shadow-cyan-500/25 disabled:opacity-60 transition-all">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
            Tạo Sơ Đồ Knockout
          </button>
        )}
        {false && isAdmin && (
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-black shadow-lg shadow-cyan-500/25 disabled:opacity-60 transition-all">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
            Tạo Sơ Đồ (Top 2 mỗi bảng)
          </button>
        )}
        {err && <p className="text-red-400 text-sm mt-4 flex items-center justify-center gap-1.5"><AlertTriangle size={14} />{err}</p>}
      </div>
    );
  }

  // ─── Có sơ đồ: hiển thị bracket + bảng nhập kết quả ───
  return (
    <div className="space-y-5">
      {/* Thanh nút điều khiển */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><GitMerge size={20} className="text-cyan-400" /> Sơ Đồ Loại Trực Tiếp</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 2 nút tải ảnh riêng */}
          <button onClick={() => exportImage('knockout-bracket', 'SoDo')} disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 transition-all">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={15} />} Tải ảnh sơ đồ
          </button>
          <button onClick={() => exportImage('knockout-results', 'KetQua')} disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 transition-all">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ListChecks size={15} />} Tải ảnh kết quả
          </button>
          {isAdmin && (
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={15} />} Tạo lại
            </button>
          )}
          {isAdmin && (
            <button onClick={handleClear} disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-all">
              <AlertTriangle size={15} /> Xóa Sơ Đồ
            </button>
          )}
        </div>
      </div>

      {err && <div className="text-red-400 text-sm flex items-center gap-1.5 px-2"><AlertTriangle size={14} />{err}</div>}

      {/* ═══ SƠ ĐỒ BRACKET ═══ */}
      <div id="knockout-bracket" className="rounded-3xl p-5 md:p-8 relative ko-scroll"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #16285f 0%, #0a1530 72%)', overflowX: 'auto' }}>
        <style>{`
          .ko-scroll::-webkit-scrollbar { height: 10px; }
          .ko-scroll::-webkit-scrollbar-track { background: #0a1530; border-radius: 8px; }
          .ko-scroll::-webkit-scrollbar-thumb { background: #1e3a6e; border-radius: 8px; }
          .ko-scroll::-webkit-scrollbar-thumb:hover { background: #2a4d8a; }
          .ko-scroll { scrollbar-color: #1e3a6e #0a1530; scrollbar-width: thin; }
        `}</style>
        <div className="text-center mb-7 relative z-10">
          <div className="text-[11px] md:text-[12px] tracking-[7px] text-blue-300/70 font-semibold">ROAD TO FINAL</div>
          <div className="text-xl md:text-3xl font-black text-white tracking-wide mt-1" style={{ textShadow: '0 2px 20px rgba(125,162,232,.5)' }}>
            {tournamentName}
          </div>
        </div>

        <div className="flex items-stretch gap-3 md:gap-5 relative z-10" style={{ width: 'max-content', minWidth: '100%' }}>
          {/* LAYOUT 1 CHIEU: cac vong xep trai -> phai (Vong 1/8 -> Tu ket -> ... -> Chung ket) */}
          {rounds.map((rd, rIdx) => {
            const isFinalCol = rIdx === rounds.length - 1;
            return (
              <div key={`RD${rIdx}`} className="flex flex-col flex-1 min-w-[160px] md:min-w-[190px]">
                <div className="text-center text-[10px] md:text-[11px] font-black tracking-widest text-blue-300/60 mb-3">
                  {roundName(rd.teamsInRound)}
                </div>
                {/* justify-around de cac cap can deu theo chieu doc (giong so do that) */}
                <div className="flex flex-col justify-around flex-1 gap-3">
                  {Array.from({ length: rd.expectedCount }).map((_, i) => (
                    rd.matches[i]
                      ? <Pair key={rd.matches[i].matchId} match={rd.matches[i]} side="left" isAdmin={isAdmin} onScore={handleScore} />
                      : <EmptyPair key={`RD${rIdx}-e${i}`} side="left" />
                  ))}
                </div>
              </div>
            );
          })}

          {/* COT CUOI: Cup + Nha vo dich + Tranh hang 3 */}
          <div className="flex flex-col items-center justify-center gap-3 px-1 min-w-[130px]">
            <Trophy size={48} className="text-amber-300" style={{ filter: 'drop-shadow(0 4px 24px rgba(251,191,36,.5))' }} />
            <div className="w-[110px] min-h-[56px] rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(56,189,248,.4)] px-2 py-1.5"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #0e7490)' }}>
              {champion ? <span className="text-[12px] font-black text-white text-center leading-tight">{champion.name}</span> : <Crown size={24} className="text-white/90" />}
            </div>
            <div className="text-[10px] text-blue-300/60 font-bold tracking-wide">NHÀ VÔ ĐỊCH</div>

            {/* TRẬN TRANH HẠNG 3 */}
            {thirdPlaceMatch && (
              <div className="w-full mt-4 pt-4 border-t border-blue-400/15">
                <div className="text-[10px] font-black tracking-[2px] text-orange-300/80 text-center mb-2">TRANH HẠNG 3</div>
                <Pair match={thirdPlaceMatch} side="left" isAdmin={isAdmin} onScore={handleScore} />
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-6 text-[11px] tracking-[3px] text-blue-400/50 font-bold relative z-10">SƠ ĐỒ LOẠI TRỰC TIẾP · PNH FOOTBALL</div>
      </div>

      {/* ═══ BẢNG NHẬP / XEM KẾT QUẢ TỪNG CẶP ═══ */}
      <div id="knockout-results" className="rounded-3xl p-5 md:p-7" style={{ background: 'linear-gradient(160deg, #0a0f1d 0%, #0d1426 60%, #0a1020 100%)' }}>
        <div className="text-center mb-5">
          <h3 className="text-lg font-black text-white">{tournamentName}</h3>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="w-6 h-[3px] rounded bg-gradient-to-r from-cyan-400 to-blue-500" />
            <span className="text-[11px] font-black tracking-[2px] text-cyan-400 uppercase">Kết Quả Knockout</span>
            <span className="w-6 h-[3px] rounded bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
        <div className="space-y-4">
          {rounds.map((rd, i) => (
            rd.matches.length > 0 && (
              <div key={i}>
                <div className="text-[11px] font-black tracking-widest text-cyan-400/70 mb-2 px-1">{roundName(rd.teamsInRound)}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rd.matches.map(m => <ResultRow key={m.matchId} match={m} isAdmin={isAdmin} onScore={handleScore} />)}
                </div>
              </div>
            )
          ))}
          {/* Trận tranh hạng 3 trong bảng kết quả */}
          {thirdPlaceMatch && (
            <div>
              <div className="text-[11px] font-black tracking-widest text-orange-400/70 mb-2 px-1">TRANH HẠNG 3</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ResultRow match={thirdPlaceMatch} isAdmin={isAdmin} onScore={handleScore} />
              </div>
            </div>
          )}
        </div>
        <div className="text-center mt-5 text-[10px] tracking-[2px] text-slate-600 font-bold">PNH FOOTBALL</div>
      </div>
    </div>
  );
}

// ─── 1 cặp đấu trong bracket (có ô nhập tỉ số) ───
// Ô trận trống (vòng chưa có đội) - 2 dòng placeholder
function EmptyPair({ side }) {
  const row = (
    <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-blue-400/20 bg-blue-950/30 min-h-[38px] flex-1 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="w-5 h-5 rounded-full bg-blue-900/50 shrink-0" />
        <span className="text-[12px] font-bold text-blue-400/30">—</span>
      </div>
      <div className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/40 border border-blue-400/15 flex items-center justify-center text-[13px] font-black text-blue-400/30">·</div>
    </div>
  );
  return <div className="flex flex-col gap-1">{row}{row}</div>;
}

function Pair({ match, side, isAdmin, onScore }) {
  const { homeName, awayName, homeLogo, awayLogo, homeScore, awayScore, homeTeamId, awayTeamId, homePenalty, awayPenalty } = match;
  const isDraw = homeScore != null && awayScore != null && homeScore === awayScore;
  // Doi thang: ti so chinh khac nhau, HOAC hoa nhung thang luan luu
  const penDecided = isDraw && homePenalty != null && awayPenalty != null && homePenalty !== awayPenalty;
  const decided = (homeScore != null && awayScore != null && homeScore !== awayScore) || penDecided;
  const homeWin = decided && (homeScore > awayScore || (penDecided && homePenalty > awayPenalty));
  const awayWin = decided && (awayScore > homeScore || (penDecided && awayPenalty > homePenalty));
  const canEdit = isAdmin && homeTeamId && awayTeamId;

  const [hs, setHs] = useState(homeScore ?? '');
  const [as, setAs] = useState(awayScore ?? '');
  const [hp, setHp] = useState(homePenalty ?? '');
  const [ap, setAp] = useState(awayPenalty ?? '');
  useEffect(() => { setHs(homeScore ?? ''); setAs(awayScore ?? ''); setHp(homePenalty ?? ''); setAp(awayPenalty ?? ''); }, [homeScore, awayScore, homePenalty, awayPenalty]);

  const commit = (newH, newA, newHp, newAp) => {
    const h = newH === '' ? null : Math.max(0, parseInt(newH, 10) || 0);
    const a = newA === '' ? null : Math.max(0, parseInt(newA, 10) || 0);
    const ph = newHp === '' ? null : Math.max(0, parseInt(newHp, 10) || 0);
    const pa = newAp === '' ? null : Math.max(0, parseInt(newAp, 10) || 0);
    if (h != null && a != null) onScore(match.matchId, h, a, ph, pa);
  };

  // Ti so dang hoa (theo input hien tai) -> hien o nhap luan luu
  const showPen = canEdit && hs !== '' && as !== '' && parseInt(hs, 10) === parseInt(as, 10);

  return (
    <div className="flex flex-col gap-1">
      <Row name={homeName} logo={homeLogo} side={side} win={homeWin}
        score={hs} canEdit={canEdit} onChange={(v) => { setHs(v); commit(v, as, hp, ap); }} />
      <Row name={awayName} logo={awayLogo} side={side} win={awayWin}
        score={as} canEdit={canEdit} onChange={(v) => { setAs(v); commit(hs, v, hp, ap); }} />
      {/* O nhap luan luu khi hoa (chi admin) */}
      {showPen && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="text-[9px] font-black tracking-wider text-amber-400 uppercase">Pen</span>
          <input type="number" min="0" max="99" value={hp} placeholder="0"
            onChange={(e) => { setHp(e.target.value); commit(hs, as, e.target.value, ap); }}
            className="w-7 h-6 rounded-md bg-amber-950/60 border border-amber-400/50 text-center text-[12px] font-black text-amber-200 outline-none focus:border-amber-400" />
          <span className="text-amber-500/70 text-xs font-black">-</span>
          <input type="number" min="0" max="99" value={ap} placeholder="0"
            onChange={(e) => { setAp(e.target.value); commit(hs, as, hp, e.target.value); }}
            className="w-7 h-6 rounded-md bg-amber-950/60 border border-amber-400/50 text-center text-[12px] font-black text-amber-200 outline-none focus:border-amber-400" />
        </div>
      )}
      {/* Hien ti so luan luu da luu (badge gon gang) */}
      {!showPen && penDecided && (
        <div className="flex justify-center mt-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-black tracking-wide">
            PEN {homePenalty}-{awayPenalty}
          </span>
        </div>
      )}
    </div>
  );
}

function Row({ name, logo, side, win, score, canEdit, onChange }) {
  const empty = !name;
  const card = (
    <div className={[
      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border min-h-[38px] flex-1 transition-all',
      side === 'right' ? 'flex-row-reverse text-right' : '',
      empty ? 'border-dashed border-blue-400/20 bg-blue-950/30'
            : win ? 'border-cyan-400/70 bg-gradient-to-r from-cyan-600/40 to-blue-900/40 shadow-[0_0_12px_rgba(56,189,248,.3)]'
                  : 'border-blue-400/25 bg-gradient-to-r from-blue-800/50 to-blue-950/50',
    ].join(' ')}>
      <div className="w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center shrink-0 overflow-hidden text-[11px]">
        {empty ? '' : (logo && (logo.startsWith('http') || logo.startsWith('data:')) ? <img src={logo} alt="" className="w-full h-full object-cover" /> : (logo || name?.[0] || '?'))}
      </div>
      <span className={`text-[12px] font-bold truncate ${empty ? 'text-blue-400/40' : 'text-blue-50'}`}>{empty ? '—' : name}</span>
    </div>
  );
  const box = canEdit ? (
    <input type="number" min="0" max="99" value={score}
      onChange={(e) => onChange(e.target.value)}
      className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/80 border border-cyan-400/40 text-center text-[13px] font-black text-cyan-200 outline-none focus:border-cyan-400" />
  ) : (
    <div className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/60 border border-blue-400/20 flex items-center justify-center text-[13px] font-black text-cyan-300">{score !== '' && score != null ? score : '·'}</div>
  );
  return <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>{card}{box}</div>;
}

// ─── 1 dòng kết quả trong bảng dưới ───
function ResultRow({ match, isAdmin, onScore }) {
  const { homeName, awayName, homeScore, awayScore, homeTeamId, awayTeamId, homePenalty, awayPenalty } = match;
  const canEdit = isAdmin && homeTeamId && awayTeamId;
  const isDraw = homeScore != null && awayScore != null && homeScore === awayScore;
  const penDecided = isDraw && homePenalty != null && awayPenalty != null && homePenalty !== awayPenalty;
  const homeWin = (homeScore != null && awayScore != null && homeScore > awayScore) || (penDecided && homePenalty > awayPenalty);
  const awayWin = (homeScore != null && awayScore != null && awayScore > homeScore) || (penDecided && awayPenalty > homePenalty);
  const [hs, setHs] = useState(homeScore ?? '');
  const [as, setAs] = useState(awayScore ?? '');
  const [hp, setHp] = useState(homePenalty ?? '');
  const [ap, setAp] = useState(awayPenalty ?? '');
  useEffect(() => { setHs(homeScore ?? ''); setAs(awayScore ?? ''); setHp(homePenalty ?? ''); setAp(awayPenalty ?? ''); }, [homeScore, awayScore, homePenalty, awayPenalty]);

  const commit = (nh, na, nhp, nap) => {
    const h = nh === '' ? null : Math.max(0, parseInt(nh, 10) || 0);
    const a = na === '' ? null : Math.max(0, parseInt(na, 10) || 0);
    const ph = nhp === '' ? null : Math.max(0, parseInt(nhp, 10) || 0);
    const pa = nap === '' ? null : Math.max(0, parseInt(nap, 10) || 0);
    if (h != null && a != null) onScore(match.matchId, h, a, ph, pa);
  };
  const showPen = canEdit && hs !== '' && as !== '' && parseInt(hs, 10) === parseInt(as, 10);

  return (
    <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <div className="flex items-center gap-2">
        <span className={`flex-1 text-right text-[13px] font-bold truncate ${homeWin ? 'text-cyan-300' : 'text-slate-200'}`}>{homeName || '—'}</span>
        {canEdit ? (
          <div className="flex items-center gap-1 shrink-0">
            <input type="number" min="0" value={hs} onChange={e => { setHs(e.target.value); commit(e.target.value, as, hp, ap); }}
              className="w-9 h-8 rounded-md bg-slate-950 border border-cyan-500/40 text-center text-sm font-black text-cyan-200 outline-none focus:border-cyan-400" />
            <span className="text-slate-500 font-black">:</span>
            <input type="number" min="0" value={as} onChange={e => { setAs(e.target.value); commit(hs, e.target.value, hp, ap); }}
              className="w-9 h-8 rounded-md bg-slate-950 border border-cyan-500/40 text-center text-sm font-black text-cyan-200 outline-none focus:border-cyan-400" />
          </div>
        ) : (
          <span className="shrink-0 px-2.5 text-sm font-black text-cyan-400">
            {homeScore ?? '-'} : {awayScore ?? '-'}
            {penDecided && <span className="text-amber-400 text-[11px]"> (pen {homePenalty}-{awayPenalty})</span>}
          </span>
        )}
        <span className={`flex-1 text-[13px] font-bold truncate ${awayWin ? 'text-cyan-300' : 'text-slate-200'}`}>{awayName || '—'}</span>
      </div>
      {showPen && (
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-400">Luân lưu:</span>
          <input type="number" min="0" value={hp} placeholder="-" onChange={e => { setHp(e.target.value); commit(hs, as, e.target.value, ap); }}
            className="w-8 h-6 rounded bg-amber-950/60 border border-amber-400/40 text-center text-[11px] font-black text-amber-200 outline-none" />
          <span className="text-amber-400 text-[11px]">-</span>
          <input type="number" min="0" value={ap} placeholder="-" onChange={e => { setAp(e.target.value); commit(hs, as, hp, e.target.value); }}
            className="w-8 h-6 rounded bg-amber-950/60 border border-amber-400/40 text-center text-[11px] font-black text-amber-200 outline-none" />
        </div>
      )}
    </div>
  );
}