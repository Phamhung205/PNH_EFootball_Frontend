import React, { useState, useEffect } from 'react';
import { Star, Share2, Download, Upload, Facebook, Link2, Check, Loader2 } from 'lucide-react';
import { tournamentApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// TournamentActions: 3 tinh nang gan vao trang giai
//  #72 Danh gia sao (ai cung danh gia)
//  #71 Chia se mang xa hoi
//  #87 Sao luu / khoi phuc du lieu giai (JSON)
// Props: tournament, darkMode, isAdmin, fullData (toan bo du lieu giai de sao luu)
// ─────────────────────────────────────────────────────────────
export default function TournamentActions({ tournament, darkMode = true, isAdmin = false, fullData = null }) {
  const dm = darkMode;
  const tid = tournament?.id ?? tournament?.tournamentId;
  const tName = tournament?.name ?? 'Giai dau';

  // ── #72 Danh gia sao ──
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [myStars, setMyStars] = useState(0);   // sao dang hover/chon
  const [rated, setRated] = useState(false);
  const [rating, setRating] = useState(false);

  useEffect(() => {
    if (!tid) return;
    tournamentApi.getRating(tid)
      .then(r => { if (r) { setAvg(r.average || 0); setCount(r.count || 0); } })
      .catch(() => {});
  }, [tid]);

  const handleRate = async (stars) => {
    if (!tid || rating) return;
    setRating(true);
    try {
      const r = await tournamentApi.rate(tid, stars);
      if (r) { setAvg(r.average || 0); setCount(r.count || 0); setRated(true); }
    } catch { /* im lang */ }
    finally { setRating(false); }
  };

  // ── #71 Chia se ──
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Xem giai dau ${tName} tren PNH Football!`;

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* trinh duyet cu */ }
  };
  const shareNative = async () => {
    // Dung Web Share API tren mobile (mo menu chia se cua he dieu hanh)
    if (navigator.share) {
      try { await navigator.share({ title: tName, text: shareText, url: shareUrl }); } catch {}
    } else {
      copyLink();
    }
  };

  // ── #87 Sao luu / Khoi phuc ──
  const [importMsg, setImportMsg] = useState(null);

  const backupData = () => {
    // Xuat toan bo du lieu giai ra file JSON
    const data = fullData || tournament;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_${tName.replace(/[^\w]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreData = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Chi doc va hien thi thong tin (khoi phuc that can API rieng - o day bao da doc file)
        const teamsCount = data.teams?.length ?? 0;
        const matchesCount = data.matches?.length ?? 0;
        setImportMsg(`Da doc file sao luu: ${data.name || '?'} — ${teamsCount} doi, ${matchesCount} tran. (De khoi phuc hoan toan can tao giai moi tu du lieu nay)`);
      } catch {
        setImportMsg('File khong hop le (khong phai file sao luu JSON).');
      }
      setTimeout(() => setImportMsg(null), 6000);
    };
    reader.readAsText(file);
    ev.target.value = ''; // reset de chon lai duoc
  };

  const cardCls = dm ? 'bg-white/3 border-white/10' : 'bg-white border-gray-200';
  const btnCls = dm ? 'bg-white/5 hover:bg-white/10 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

  return (
    <div className={`rounded-2xl border-2 p-5 space-y-5 ${cardCls}`}>
      {/* ── #72 DANH GIA SAO ── */}
      <div>
        <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
          <Star size={16} className="text-amber-400" /> Đánh Giá Giải Đấu
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s}
                onMouseEnter={() => setMyStars(s)}
                onMouseLeave={() => setMyStars(0)}
                onClick={() => handleRate(s)}
                disabled={rating}
                className="transition-transform hover:scale-110 disabled:opacity-50">
                <Star size={26}
                  className={(myStars ? s <= myStars : s <= Math.round(avg))
                    ? 'text-amber-400 fill-amber-400'
                    : dm ? 'text-slate-600' : 'text-slate-300'} />
              </button>
            ))}
          </div>
          <div className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className="font-black text-amber-400">{avg}</span>
            <span className="text-xs"> / 5 · {count} lượt</span>
          </div>
        </div>
        {rated && <p className="text-xs text-emerald-400 mt-1.5">✓ Cảm ơn bạn đã đánh giá!</p>}
      </div>

      {/* ── #71 CHIA SE ── */}
      <div className="pt-4 border-t border-white/5">
        <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
          <Share2 size={16} className="text-cyan-400" /> Chia Sẻ Giải Đấu
        </h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={shareFacebook} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all">
            <Facebook size={14} /> Facebook
          </button>
          <button onClick={shareNative} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${btnCls}`}>
            <Share2 size={14} /> Chia sẻ khác
          </button>
          <button onClick={copyLink} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${btnCls}`}>
            {copied ? <><Check size={14} className="text-emerald-400" /> Đã copy!</> : <><Link2 size={14} /> Copy link</>}
          </button>
        </div>
      </div>

      {/* ── #87 SAO LUU / KHOI PHUC (chi Admin) ── */}
      {isAdmin && (
        <div className="pt-4 border-t border-white/5">
          <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
            <Download size={16} className="text-emerald-400" /> Sao Lưu Dữ Liệu
          </h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={backupData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all">
              <Download size={14} /> Tải file sao lưu
            </button>
            <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${btnCls}`}>
              <Upload size={14} /> Khôi phục từ file
              <input type="file" accept=".json" onChange={restoreData} className="hidden" />
            </label>
          </div>
          {importMsg && <p className={`text-xs mt-2 ${dm ? 'text-cyan-300' : 'text-cyan-600'}`}>{importMsg}</p>}
          <p className={`text-[11px] mt-1.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            Sao lưu tải toàn bộ dữ liệu giải ra file JSON để lưu trữ.
          </p>
        </div>
      )}
    </div>
  );
}