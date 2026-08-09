import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Crown, GitMerge, Loader2, Download, Image as ImageIcon, ListChecks, RefreshCw, AlertTriangle, Swords } from 'lucide-react';
import { captureAndSave } from '../../utils/exportImage';
import { knockoutApi } from '../../services/api';

const KNOCKOUT_BASE = 100;

// ─── Kich thuoc co dinh cua 1 cap dau (dung de tinh vi tri doi xung) ───
// 1 cap = 2 hang doi. Moi hang cao 38px, cach nhau 4px (gap-1).
const ROW_H = 38;        // chieu cao 1 hang doi
const ROW_GAP = 4;       // gap-1 giua 2 hang trong cung 1 cap
const PAIR_H = ROW_H * 2 + ROW_GAP;   // = 80px, chieu cao 1 cap
const BASE_GAP = 12;     // khoang cach giua 2 cap o VONG DAU TIEN (gap-3)

// Tinh khoang cach doc cho vong thu rIdx (0 = vong dau tien).
// Nguyen tac so do loai truc tiep: cap cha phai nam GIUA 2 cap con.
//   - Buoc lap (step) cua vong sau = gap doi vong truoc
//   - Le tren (offset) = nua hieu so giua step hien tai va chieu cao 1 cap
// Nho vay cap o vong 2 luon can giua dung 2 cap o vong 1 -> khong bi lech.
const bracketSpacing = (rIdx) => {
  const step = (PAIR_H + BASE_GAP) * Math.pow(2, rIdx); // khoang cach tim-den-tim
  const gap = step - PAIR_H;                            // khoang trong giua 2 cap
  const offset = (step - (PAIR_H + BASE_GAP)) / 2;      // day cap dau xuong cho can giua
  return { gap, offset, step };
};

// Nhan vong theo so doi tham gia vong do
const roundName = (teamsInRound) => {
  if (teamsInRound === 2) return 'Chung Kết';
  if (teamsInRound === 4) return 'Bán Kết';
  if (teamsInRound === 8) return 'Tứ Kết';
  if (teamsInRound === 16) return 'Vòng 1/8';
  if (teamsInRound === 32) return 'Vòng 1/16';
  return `Vòng 1/${teamsInRound / 2}`;
};

// ─── Khung anh xuat 1 TRAN DAU (dung o Sơ Đồ Loại) ─────────────────────────
// Bo cuc da duyet qua nhieu vong chinh: logo + ten xep COT doc, rieng SO DIEM
// tach ra dat NGANG canh khoi logo+ten (khong nam duoi ten, khong cach xa logo).
// Nen co hoa van nhe: quang sang goc, duong tron san bong mo, vien goc, cham luoi.
function MatchLogoBox({ logo, name, fallbackColor }) {
  const isImage = logo && (logo.startsWith('http') || logo.startsWith('data:'));
  return (
    <div className="w-[68px] h-[68px] rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.15)' }}>
      {isImage ? (
        // KHONG dat crossOrigin: logo thuong la base64 (data:...) tu luc tai len,
        // crossOrigin la thua va tren mot so trinh duyet co the khien anh
        // KHONG tai duoc thay vi chi anh huong luc chup canvas.
        // rasterizeImages() trong exportImage.js da tu lo phan CORS khi chup anh roi.
        <img src={logo} alt={name} className="w-full h-full object-contain p-2" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white rounded-2xl"
          style={{ background: fallbackColor }}>
          {(logo && logo.length <= 2) ? logo : (name?.[0] || '?')}
        </div>
      )}
    </div>
  );
}

const MatchExportCard = React.forwardRef(function MatchExportCard(
  { match, roundLabel, tournamentName, language = 'vi' }, ref
) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const { homeName, awayName, homeLogo, awayLogo, homeScore, awayScore, homePenalty, awayPenalty } = match || {};
  const hasScore = homeScore != null && awayScore != null;
  // Tran hoa o 90 phut, phai giai quyet bang luan luu 11m
  const penDecided = hasScore && homeScore === awayScore && homePenalty != null && awayPenalty != null;

  return (
    <div ref={ref} className="rounded-[28px] p-9 relative overflow-hidden"
      style={{
        width: '820px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        background: `
          radial-gradient(ellipse 900px 500px at 50% -10%, rgba(56,189,248,0.10), transparent 60%),
          radial-gradient(ellipse 700px 400px at 100% 110%, rgba(52,211,153,0.08), transparent 60%),
          linear-gradient(160deg, #0a0f1d 0%, #0d1426 55%, #0a1020 100%)`,
      }}>
      {/* Duong tron + gach ngang goi y san bong, rat mo */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 340, height: 340, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', border: '1px solid rgba(148,163,184,0.06)' }} />
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '50%', height: 1, background: 'rgba(148,163,184,0.06)' }} />
      {/* Vien goc */}
      <div className="absolute pointer-events-none" style={{ width: 110, height: 110, top: -18, left: -18, opacity: .18, borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8', borderRadius: '24px 0 0 0' }} />
      <div className="absolute pointer-events-none" style={{ width: 110, height: 110, bottom: -18, right: -18, opacity: .18, borderBottom: '2px solid #34d399', borderRight: '2px solid #34d399', borderRadius: '0 0 24px 0' }} />
      {/* Cham luoi 2 goc */}
      <div className="absolute grid gap-[6px] pointer-events-none" style={{ top: 24, right: 30, gridTemplateColumns: 'repeat(5,4px)', opacity: .35 }}>
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className="w-1 h-1 rounded-full" style={{ background: '#334155' }} />)}
      </div>
      <div className="absolute grid gap-[6px] pointer-events-none" style={{ bottom: 24, left: 30, gridTemplateColumns: 'repeat(5,4px)', opacity: .35 }}>
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className="w-1 h-1 rounded-full" style={{ background: '#334155' }} />)}
      </div>

      <div className="relative text-center">
        <span className="inline-flex items-center gap-2 px-[18px] py-[6px] rounded-full text-xs font-black tracking-[3px]"
          style={hasScore
            ? { background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.25)', color: '#cbd5e1' }
            : { background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#7dd3fc' }}>
          {hasScore ? tr('FULL TIME', 'FULL TIME') : tr('SẮP DIỄN RA', 'UPCOMING')}
        </span>
      </div>
      <div className="relative text-center text-xs font-bold tracking-[2px] uppercase mt-2 mb-7" style={{ color: '#64748b' }}>
        {roundLabel} · {tournamentName}
      </div>

      <div className="relative flex items-center justify-center gap-7 mb-2">
        <div className="flex items-center gap-3.5">
          <div className="flex flex-col items-center gap-2">
            <MatchLogoBox logo={homeLogo} name={homeName} fallbackColor="linear-gradient(135deg,#3b82f6,#6366f1)" />
            <span className="text-sm font-black whitespace-nowrap" style={{ color: '#e2e8f0' }}>{homeName || '—'}</span>
          </div>
          <span className="font-black leading-none" style={{ fontSize: hasScore ? 46 : 30, color: hasScore ? '#fff' : '#334155' }}>
            {hasScore ? homeScore : '—'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black"
            style={{ background: '#0a1020', border: '2px solid rgba(148,163,184,0.15)', color: '#64748b' }}>VS</div>
          <span className="text-[10.5px] font-bold whitespace-nowrap" style={{ color: '#475569' }}>
            {hasScore ? tr('Kết thúc', 'Full time') : tr('Chưa đấu', 'Not started')}
          </span>
          {/* Ti so luan luu 11m — chi hien khi hoa o 90 phut va co du 2 ket qua pen */}
          {penDecided && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide whitespace-nowrap"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
              {tr('PEN', 'PEN')} {homePenalty}-{awayPenalty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 flex-row-reverse">
          <div className="flex flex-col items-center gap-2">
            <MatchLogoBox logo={awayLogo} name={awayName} fallbackColor="linear-gradient(135deg,#f43f5e,#db2777)" />
            <span className="text-sm font-black whitespace-nowrap" style={{ color: '#e2e8f0' }}>{awayName || '—'}</span>
          </div>
          <span className="font-black leading-none" style={{ fontSize: hasScore ? 46 : 30, color: hasScore ? '#fff' : '#334155' }}>
            {hasScore ? awayScore : '—'}
          </span>
        </div>
      </div>

      <div className="relative flex justify-between items-center mt-2 pt-[18px]" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
        <span className="text-[11px] font-bold tracking-wide" style={{ color: '#475569' }}>{tournamentName}</span>
        <span className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: '#cbd5e1' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#38bdf8' }} />
          PNH FOOTBALL
        </span>
      </div>
    </div>
  );
});

export default function KnockoutBracket({ tournament, teams = [], tournamentName = 'GIẢI ĐẤU', isAdmin = false, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const tournamentId = tournament?.id;
  const [matches, setMatches] = useState([]);   // các trận knockout từ backend
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState('');
  // Kieu so do: 'two' = 2 nhanh (giong World Cup), 'one' = 1 chieu (cu)
  const [viewMode, setViewMode] = useState('two');

  // ─── Xuat anh MOT TRAN cu the (khu vuc moi) ───
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [exportingMatch, setExportingMatch] = useState(false);
  const matchCardRef = useRef(null);
  const previewWrapRef = useRef(null);   // container ben ngoai de do chieu rong that
  const [previewScale, setPreviewScale] = useState(1);

  // Tu tinh ty le thu nho khung xem truoc theo dung chieu rong man hinh THAT.
  // Truoc day dung transform:scale(0.75) CO DINH -> tren dien thoai (~360-430px)
  // khung 820px du da thu 0.75 van con 615px, vuot man hinh, phai cuon ngang.
  // Gio do container that (ResizeObserver) va tinh scale = rong container / 820,
  // luon vua khit man hinh du la dien thoai nho hay man hinh may tinh.
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const capNhat = () => {
      const rong = el.clientWidth;
      if (rong > 0) setPreviewScale(Math.min(1, rong / 820));
    };
    capNhat();
    const ro = new ResizeObserver(capNhat);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedMatchId]);

  // ─── Tải sơ đồ từ backend ───
  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const data = await knockoutApi.get(tournamentId);
      setMatches(data);
    } catch (e) {
      setErr(e.message || tr('Lỗi tải sơ đồ', 'Error loading bracket'));
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
    if (matches.length > 0 && !window.confirm(tr('Tạo lại sơ đồ sẽ XÓA kết quả knockout hiện tại. Tiếp tục?', 'Regenerating the bracket will DELETE current knockout results. Continue?'))) return;
    setGenerating(true); setErr('');
    try {
      const data = await knockoutApi.generate(tournamentId, {});
      setMatches(data);
    } catch (e) {
      setErr(e.message || tr('Lỗi tạo sơ đồ. Đảm bảo vòng bảng đã có kết quả.', 'Error generating bracket. Make sure the group stage has results.'));
    } finally {
      setGenerating(false);
    }
  };

  // ─── Xóa toàn bộ sơ đồ knockout ───
  const handleClear = async () => {
    if (!isAdmin) return;
    if (!window.confirm(tr('Xóa TOÀN BỘ sơ đồ knockout? Các kết quả knockout sẽ mất. Vòng bảng KHÔNG bị ảnh hưởng.', 'Delete the ENTIRE knockout bracket? Knockout results will be lost. The group stage is NOT affected.'))) return;
    setGenerating(true); setErr('');
    try {
      await knockoutApi.clearKnockout(tournamentId);
      setMatches([]); // xoa tren UI ngay
    } catch (e) {
      setErr(e.message || tr('Lỗi khi xóa sơ đồ.', 'Error deleting bracket.'));
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
      setErr(e.message || tr('Lỗi lưu tỉ số', 'Error saving score'));
      load(); // tải lại nếu lỗi
    }
  };

  // ─── Tải ảnh: 2 loại (sơ đồ / bảng kết quả) ───
  const exportImage = async (elementId, filePrefix) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    setExporting(true);

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
      const safe = (tournamentName || 'Knockout').replace(/[^a-zA-Z0-9]/g, '_');
      // captureAndSave tu nhan dien may:
      //  - iPad/iPhone: hien anh de NHAN GIU luu (Safari chan tai tu dong,
      //    the <a download> truoc day KHONG hoat dong tren iOS)
      //  - PC/Android: tai file binh thuong
      const ok = await captureAndSave(el, {
        filename: `${filePrefix}_${safe}`,
        background: '#0a1530',
        language,
      });
      if (!ok) alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } catch (e) {
      alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } finally {
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
  // Doi thang 1 tran: hon ti so, hoa thi xet luan luu. Chua xong -> null.
  const winnerOfMatch = (m) => {
    if (!m || m.homeScore == null || m.awayScore == null) return null;
    if (m.homeScore !== m.awayScore) {
      return m.homeScore > m.awayScore
        ? { name: m.homeName, logo: m.homeLogo }
        : { name: m.awayName, logo: m.awayLogo };
    }
    if (m.homePenalty != null && m.awayPenalty != null && m.homePenalty !== m.awayPenalty) {
      return m.homePenalty > m.awayPenalty
        ? { name: m.homeName, logo: m.homeLogo }
        : { name: m.awayName, logo: m.awayLogo };
    }
    return null;
  };

  const rounds = (() => {
    const byRound = {};
    bracketMatches.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });
    const existing = Object.keys(byRound).map(Number).sort((a, b) => a - b);
    if (existing.length === 0) return [];

    const firstRoundNum = existing[0];
    const firstRoundCount = byRound[firstRoundNum].length;
    let totalRounds = 1, c = firstRoundCount;
    while (c > 1) { c = Math.ceil(c / 2); totalRounds++; }

    const result = [];
    let expected = firstRoundCount;
    for (let i = 0; i < totalRounds; i++) {
      const rNum = firstRoundNum + i;

      // Dat tran vao DUNG VI TRI (bracketSlot) chu khong theo thu tu trong mang.
      // Neu khong, tran le se hien nham nhanh.
      const slots = new Array(expected).fill(null);
      (byRound[rNum] || []).forEach((m, k) => {
        const pos = Number.isInteger(m.bracketSlot) ? m.bracketSlot : k;
        if (pos >= 0 && pos < expected && !slots[pos]) slots[pos] = m;
        else if (!slots[k] && k < expected) slots[k] = m;   // du phong
      });

      // Doi DU KIEN cho o chua co tran: lay doi thang 2 tran vong truoc.
      // Nho vay doi nao thang truoc la hien ten ngay, khong phai cho cap kia.
      const prev = result[i - 1];
      const projected = slots.map((m, k) => {
        if (m) return null;
        if (!prev) return null;
        return {
          home: winnerOfMatch(prev.slots[k * 2]),
          away: winnerOfMatch(prev.slots[k * 2 + 1]),
        };
      });

      result.push({
        slots,
        projected,
        matches: slots.filter(Boolean),
        expectedCount: expected,
        teamsInRound: expected * 2,
      });
      expected = Math.ceil(expected / 2);
    }
    return result;
  })();

  const numRounds = rounds.length;

  // Danh sach TAT CA tran da co du 2 doi (de chon xuat anh), kem ten vong dau
  // cua chinh tran do (khong phai vong hien tai dang xem trong so do).
  const exportableMatches = rounds.flatMap(rd =>
    rd.matches
      .filter(m => m.homeTeamId && m.awayTeamId) // chi tran da co du 2 doi
      .map(m => ({ ...m, roundLabel: roundName(rd.teamsInRound) }))
  );
  const selectedMatch = exportableMatches.find(m => String(m.matchId) === String(selectedMatchId)) || null;

  // Rut gon ten doi dai truoc khi dua vao <option> — trinh duyet moi may cat
  // chuoi dai theo cach rieng, khong dieu khien duoc, nen chu dong cat truoc
  // de dong nao cung doc duoc gon gang tren man hinh nho.
  const rutGon = (ten, max = 14) =>
    !ten ? '' : (ten.length > max ? ten.slice(0, max - 1) + '…' : ten);

  const handleExportMatch = async () => {
    if (!selectedMatch || !matchCardRef.current) return;
    setExportingMatch(true);
    try {
      const safeRound = selectedMatch.roundLabel.replace(/[^a-zA-Z0-9À-ỹ]/g, '_');
      const ok = await captureAndSave(matchCardRef.current, {
        filename: `${safeRound}_${(selectedMatch.homeName || '')}_vs_${(selectedMatch.awayName || '')}`,
        background: '#0a1020',
        language,
      });
      if (!ok) alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } catch {
      alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } finally {
      setExportingMatch(false);
    }
  };
  const finalRound = numRounds > 0 ? rounds[numRounds - 1] : null;

  // Vi tri TAM cua so do (tinh tu dau cot, sau nhan vong).
  // Dung de day cot giua (cup + chung ket) xuong cho thang hang voi cac nhanh.
  // Cot dau tien co nhieu cap nhat nen chieu cao cua no = chieu cao ca so do.
  const centerOffset = (() => {
    if (numRounds < 2) return 0;
    const firstCount = Math.ceil(rounds[0].expectedCount / 2); // so cap nhanh trai vong dau
    const { step } = bracketSpacing(0);
    const colHeight = firstCount * step - (step - PAIR_H);     // chieu cao cot vong dau
    return Math.max(0, colHeight / 2 - PAIR_H);                // tam, tru nua chieu cao cap chung ket
  })();
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
        <h2 className="text-xl font-black text-white mb-2">{tr('Chưa có sơ đồ loại trực tiếp', 'No knockout bracket yet')}</h2>
        <p className="text-sm text-blue-300/70 mb-6 max-w-md mx-auto">
          {isAdmin
            ? tr('Bấm nút bên dưới để tự động lấy 2 đội đứng đầu mỗi bảng vào sơ đồ knockout. Vòng bảng cần có kết quả trước.', 'Click the button below to automatically take the top 2 teams from each group into the knockout bracket. The group stage needs results first.')
            : tr('Sơ đồ knockout chưa được tạo. Vui lòng quay lại sau.', 'The knockout bracket has not been created yet. Please come back later.')}
        </p>
        {isAdmin && (
          <button onClick={() => handleGenerate()} disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-black shadow-lg shadow-cyan-500/25 disabled:opacity-60 transition-all">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
            {tr('Tạo Sơ Đồ', 'Generate Bracket')} Knockout
          </button>
        )}
        {false && isAdmin && (
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-black shadow-lg shadow-cyan-500/25 disabled:opacity-60 transition-all">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
            {tr('Tạo Sơ Đồ', 'Generate Bracket')} (Top 2 mỗi bảng)
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
          <h2 className="text-lg font-black text-white flex items-center gap-2"><GitMerge size={20} className="text-cyan-400" /> {tr('Sơ Đồ Loại Trực Tiếp', 'Knockout Bracket')}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chon kieu so do: 2 nhanh hay 1 chieu */}
          <div className="flex p-1 rounded-xl border border-blue-400/25 bg-blue-950/40">
            <button onClick={() => setViewMode('two')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all ${viewMode === 'two' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' : 'text-blue-300/60 hover:text-blue-200'}`}>
              {tr('2 Nhánh', '2 Sides')}
            </button>
            <button onClick={() => setViewMode('one')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all ${viewMode === 'one' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' : 'text-blue-300/60 hover:text-blue-200'}`}>
              {tr('1 Chiều', '1 Column')}
            </button>
          </div>
          {/* 2 nút tải ảnh riêng */}
          <button onClick={() => exportImage('knockout-bracket', 'SoDo')} disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 transition-all">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={15} />} {tr('Tải ảnh sơ đồ', 'Download bracket')}
          </button>
          <button onClick={() => exportImage('knockout-results', 'KetQua')} disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 transition-all">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ListChecks size={15} />} {tr('Tải ảnh kết quả', 'Download results')}
          </button>
          {isAdmin && (
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={15} />} {tr('Tạo lại', 'Regenerate')}
            </button>
          )}
          {isAdmin && (
            <button onClick={handleClear} disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-all">
              <AlertTriangle size={15} /> {tr('Xóa Sơ Đồ', 'Delete Bracket')}
            </button>
          )}
        </div>
      </div>

      {/* ═══ XUẤT ẢNH 1 TRẬN CỤ THỂ ═══
          Chon 1 tran da co du 2 doi -> xem truoc + tai anh rieng tran do.
          Nhan biet ro TEN VONG DAU cua chinh tran do (Tu Ket/Ban Ket/Chung Ket...). */}
      {exportableMatches.length > 0 && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Swords size={16} className="text-blue-300" />
            <h4 className="text-sm font-black text-blue-100">
              {tr('Xuất ảnh một trận đấu', 'Export a single match')}
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-blue-950/50 border border-blue-400/30 text-white text-sm outline-none focus:border-cyan-400/60">
              <option value="">{tr('— Chọn trận đấu —', '— Select a match —')}</option>
              {exportableMatches.map(m => (
                <option key={m.matchId} value={m.matchId}>
                  {m.roundLabel} · {rutGon(m.homeName)} vs {rutGon(m.awayName)}
                  {m.homeScore != null && m.awayScore != null ? ` (${m.homeScore}-${m.awayScore})` : ''}
                </option>
              ))}
            </select>

            <button onClick={handleExportMatch} disabled={!selectedMatch || exportingMatch}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white transition-all shrink-0">
              {exportingMatch ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {tr('Tải ảnh trận này', 'Download this match')}
            </button>
          </div>

          {/* Xem truoc: hien dung khung se duoc xuat ra, TU DONG vua khit man hinh.
              previewWrapRef do dung chieu rong that -> previewScale tinh ra tu do,
              khong con phu thuoc vao 1 con so co dinh nhu truoc. */}
          {selectedMatch && (
            <div ref={previewWrapRef} className="w-full overflow-hidden rounded-2xl">
              <div style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                width: '820px',
                // Chieu cao THAT cua MatchExportCard (do bang Playwright = 288px
                // o kich thuoc goc 820px), nhan scale de vua khit, khong du khoang trang.
                height: `${288 * previewScale}px`,
              }}>
                <MatchExportCard
                  ref={matchCardRef}
                  match={selectedMatch}
                  roundLabel={selectedMatch.roundLabel}
                  tournamentName={tournamentName}
                  language={language}
                />
              </div>
            </div>
          )}
        </div>
      )}

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
          {viewMode === 'two' ? (
            <>
              {/* ═══ NHANH TRAI: cac vong (tru chung ket), lay NUA DAU moi vong ═══ */}
              {rounds.slice(0, -1).map((rd, rIdx) => {
                const half = Math.ceil(rd.expectedCount / 2);
                const { gap, offset } = bracketSpacing(rIdx);
                return (
                  <div key={`L${rIdx}`} className="flex flex-col flex-1 min-w-[150px] md:min-w-[185px]">
                    <div className="text-center text-[10px] md:text-[11px] font-black tracking-widest text-blue-300/60 mb-3">
                      {roundName(rd.teamsInRound, language)}
                    </div>
                    {/* KHONG dung justify-around: no rai deu nen cap con khong khop cap cha.
                        Dung gap + marginTop tinh theo cap so nhan de moi cap cha nam GIUA 2 cap con. */}
                    <div className="flex flex-col" style={{ gap: `${gap}px`, paddingTop: `${offset}px` }}>
                      {Array.from({ length: half }).map((_, i) => (
                        rd.slots[i]
                          ? <Pair key={rd.slots[i].matchId} match={rd.slots[i]} side="left" isAdmin={isAdmin} onScore={handleScore} />
                          : <EmptyPair key={`L${rIdx}-e${i}`} side="left" proj={rd.projected?.[i]} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* ═══ GIUA: Chung ket + Cup + Nha vo dich + Tranh hang 3 ═══ */}
              {/* KHONG dung justify-center: no can giua theo CHIEU CAO CONTAINER,
                  ma container co the cao hon so do (do nhan vong, tranh hang 3...).
                  Phai day xuong dung TAM cua so do de cup thang hang voi chung ket. */}
              <div className="flex flex-col items-center gap-3 px-1 min-w-[150px]"
                style={{ paddingTop: `${centerOffset}px` }}>
                {finalRound && (
                  <div className="text-center text-[10px] md:text-[11px] font-black tracking-widest text-amber-300/70 mb-1">
                    {roundName(finalRound.teamsInRound, language)}
                  </div>
                )}
                {finalMatch
                  ? <div className="w-full max-w-[190px]"><Pair match={finalMatch} side="left" isAdmin={isAdmin} onScore={handleScore} /></div>
                  : <div className="w-full max-w-[190px]"><EmptyPair side="left" /></div>}
                <Trophy size={44} className="text-amber-300 mt-1" style={{ filter: 'drop-shadow(0 4px 24px rgba(251,191,36,.5))' }} />
                <div className="w-[110px] min-h-[52px] rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(56,189,248,.4)] px-2 py-1.5"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #0e7490)' }}>
                  {champion ? <span className="text-[12px] font-black text-white text-center leading-tight">{champion.name}</span> : <Crown size={24} className="text-white/90" />}
                </div>
                <div className="text-[10px] text-blue-300/60 font-bold tracking-wide">{tr('NHÀ VÔ ĐỊCH', 'CHAMPION')}</div>
                {thirdPlaceMatch && (
                  <div className="w-full max-w-[190px] mt-3 pt-3 border-t border-blue-400/15">
                    <div className="text-[10px] font-black tracking-[2px] text-orange-300/80 text-center mb-2">{tr('TRANH HẠNG 3', '3RD PLACE')}</div>
                    <Pair match={thirdPlaceMatch} side="left" isAdmin={isAdmin} onScore={handleScore} />
                  </div>
                )}
              </div>

              {/* ═══ NHANH PHAI: cac vong dao nguoc, lay NUA SAU moi vong, mirror (side=right) ═══ */}
              {rounds.slice(0, -1).slice().reverse().map((rd, rIdxRev) => {
                const rIdx = rounds.length - 2 - rIdxRev;
                const half = Math.ceil(rd.expectedCount / 2);
                const secondCount = rd.expectedCount - half;
                const { gap, offset } = bracketSpacing(rIdx);
                return (
                  <div key={`R${rIdx}`} className="flex flex-col flex-1 min-w-[150px] md:min-w-[185px]">
                    <div className="text-center text-[10px] md:text-[11px] font-black tracking-widest text-blue-300/60 mb-3">
                      {roundName(rd.teamsInRound, language)}
                    </div>
                    {/* Dung cong thuc voi nhanh trai (cung rIdx) -> 2 ben doi xung tuyet doi */}
                    <div className="flex flex-col" style={{ gap: `${gap}px`, paddingTop: `${offset}px` }}>
                      {Array.from({ length: secondCount }).map((_, i) => {
                        const mi = half + i;
                        return rd.slots[mi]
                          ? <Pair key={rd.slots[mi].matchId} match={rd.slots[mi]} side="right" isAdmin={isAdmin} onScore={handleScore} />
                          : <EmptyPair key={`R${rIdx}-e${i}`} side="right" proj={rd.projected?.[mi]} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* LAYOUT 1 CHIEU: cac vong xep trai -> phai (Vong 1/8 -> Tu ket -> ... -> Chung ket) */}
              {rounds.map((rd, rIdx) => {
                const { gap, offset } = bracketSpacing(rIdx);
                return (
                <div key={`RD${rIdx}`} className="flex flex-col flex-1 min-w-[160px] md:min-w-[190px]">
                  <div className="text-center text-[10px] md:text-[11px] font-black tracking-widest text-blue-300/60 mb-3">
                    {roundName(rd.teamsInRound, language)}
                  </div>
                  {/* Cung cong thuc voi layout 2 nhanh: cap cha nam giua 2 cap con */}
                  <div className="flex flex-col" style={{ gap: `${gap}px`, paddingTop: `${offset}px` }}>
                    {Array.from({ length: rd.expectedCount }).map((_, i) => (
                      rd.slots[i]
                        ? <Pair key={rd.slots[i].matchId} match={rd.slots[i]} side="left" isAdmin={isAdmin} onScore={handleScore} />
                        : <EmptyPair key={`RD${rIdx}-e${i}`} side="left" proj={rd.projected?.[i]} />
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
                <div className="text-[10px] text-blue-300/60 font-bold tracking-wide">{tr('NHÀ VÔ ĐỊCH', 'CHAMPION')}</div>
                {thirdPlaceMatch && (
                  <div className="w-full mt-4 pt-4 border-t border-blue-400/15">
                    <div className="text-[10px] font-black tracking-[2px] text-orange-300/80 text-center mb-2">{tr('TRANH HẠNG 3', '3RD PLACE')}</div>
                    <Pair match={thirdPlaceMatch} side="left" isAdmin={isAdmin} onScore={handleScore} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="text-center mt-6 text-[11px] tracking-[3px] text-blue-400/50 font-bold relative z-10">{tr('SƠ ĐỒ LOẠI TRỰC TIẾP · PNH FOOTBALL', 'KNOCKOUT BRACKET · PNH FOOTBALL')}</div>
      </div>

      {/* ═══ BẢNG NHẬP / XEM KẾT QUẢ TỪNG CẶP ═══ */}
      <div id="knockout-results" className="rounded-3xl p-5 md:p-7" style={{ background: 'linear-gradient(160deg, #0a0f1d 0%, #0d1426 60%, #0a1020 100%)' }}>
        <div className="text-center mb-5">
          <h3 className="text-lg font-black text-white">{tournamentName}</h3>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="w-6 h-[3px] rounded bg-gradient-to-r from-cyan-400 to-blue-500" />
            <span className="text-[11px] font-black tracking-[2px] text-cyan-400 uppercase">{tr('Kết Quả Knockout', 'Knockout Results')}</span>
            <span className="w-6 h-[3px] rounded bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
        <div className="space-y-4">
          {rounds.map((rd, i) => (
            rd.matches.length > 0 && (
              <div key={i}>
                <div className="text-[11px] font-black tracking-widest text-cyan-400/70 mb-2 px-1">{roundName(rd.teamsInRound, language)}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rd.matches.map(m => <ResultRow key={m.matchId} match={m} isAdmin={isAdmin} onScore={handleScore} language={language} />)}
                </div>
              </div>
            )
          ))}
          {/* Trận tranh hạng 3 trong bảng kết quả */}
          {thirdPlaceMatch && (
            <div>
              <div className="text-[11px] font-black tracking-widest text-orange-400/70 mb-2 px-1">{tr('TRANH HẠNG 3', '3RD PLACE')}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ResultRow match={thirdPlaceMatch} isAdmin={isAdmin} onScore={handleScore} language={language} />
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
function EmptyPair({ side, proj }) {
  // proj = doi DU KIEN da thang o vong truoc (neu co).
  // Doi nao thang truoc thi hien ten ngay, khong phai cho cap con lai.
  const row = (team) => (
    <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed h-[38px] flex-1 overflow-hidden
        ${team ? 'border-emerald-400/30 bg-emerald-500/8' : 'border-blue-400/20 bg-blue-950/30'}
        ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        {team?.logo
          ? <img src={team.logo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
          : <div className="w-5 h-5 rounded-full bg-blue-900/50 shrink-0" />}
        <span className={`text-[12px] font-bold truncate ${team ? 'text-emerald-200/90' : 'text-blue-400/30'}`}>
          {team?.name || '—'}
        </span>
      </div>
      <div className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/40 border border-blue-400/15 flex items-center justify-center text-[13px] font-black text-blue-400/30">·</div>
    </div>
  );
  // Chieu cao CO DINH giong Pair de cong thuc can giua luon dung
  return <div className="flex flex-col gap-1" style={{ height: `${PAIR_H}px` }}>{row(proj?.home)}{row(proj?.away)}</div>;
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
    // relative + chieu cao CO DINH: o luan luu se noi len (absolute) nen
    // khong lam cap cao them -> khong lam lech cac vong sau.
    <div className="flex flex-col gap-1 relative" style={{ height: `${PAIR_H}px` }}>
      <Row name={homeName} logo={homeLogo} side={side} win={homeWin}
        score={hs} canEdit={canEdit} onChange={(v) => { setHs(v); commit(v, as, hp, ap); }} />
      <Row name={awayName} logo={awayLogo} side={side} win={awayWin}
        score={as} canEdit={canEdit} onChange={(v) => { setAs(v); commit(hs, v, hp, ap); }} />
      {/* O nhap luan luu khi hoa (chi admin) — dat absolute de khong an vao chieu cao cap */}
      {showPen && (
        <div className="absolute left-0 right-0 top-full flex items-center justify-center gap-1.5 mt-0.5 z-10">
          <span className="text-[9px] font-black tracking-wider text-amber-400 uppercase">Pen</span>
          <input type="number" min="0" max="99" value={hp} placeholder="0"
            onChange={(e) => { setHp(e.target.value); commit(hs, as, e.target.value, ap); }}
            className="score-input w-7 h-6 rounded-md bg-amber-950/60 border border-amber-400/50 text-center text-[12px] font-black text-amber-200 outline-none focus:border-amber-400" />
          <span className="text-amber-500/70 text-xs font-black">-</span>
          <input type="number" min="0" max="99" value={ap} placeholder="0"
            onChange={(e) => { setAp(e.target.value); commit(hs, as, hp, e.target.value); }}
            className="score-input w-7 h-6 rounded-md bg-amber-950/60 border border-amber-400/50 text-center text-[12px] font-black text-amber-200 outline-none focus:border-amber-400" />
        </div>
      )}
      {/* Hien ti so luan luu da luu (badge gon gang) */}
      {!showPen && penDecided && (
        <div className="absolute left-0 right-0 top-full flex justify-center mt-0.5 z-10">
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
      // h-[38px] CO DINH (khong dung min-h): so do knockout tinh vi tri can giua
      // theo chieu cao co dinh cua moi cap. Neu dung min-h, ten dai xuong 2 dong
      // se lam cap cao them -> lech toan bo cac vong sau.
      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border h-[38px] flex-1 transition-all overflow-hidden',
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
      className="score-input w-7 h-[38px] shrink-0 rounded-md bg-blue-950/80 border border-cyan-400/40 text-center text-[13px] font-black text-cyan-200 outline-none focus:border-cyan-400" />
  ) : (
    <div className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/60 border border-blue-400/20 flex items-center justify-center text-[13px] font-black text-cyan-300">{score !== '' && score != null ? score : '·'}</div>
  );
  return <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>{card}{box}</div>;
}

// ─── 1 dòng kết quả trong bảng dưới ───
function ResultRow({ match, isAdmin, onScore, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
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
              className="score-input w-9 h-8 rounded-md bg-slate-950 border border-cyan-500/40 text-center text-sm font-black text-cyan-200 outline-none focus:border-cyan-400" />
            <span className="text-slate-500 font-black">:</span>
            <input type="number" min="0" value={as} onChange={e => { setAs(e.target.value); commit(hs, e.target.value, hp, ap); }}
              className="score-input w-9 h-8 rounded-md bg-slate-950 border border-cyan-500/40 text-center text-sm font-black text-cyan-200 outline-none focus:border-cyan-400" />
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
          <span className="text-[10px] font-bold text-amber-400">{tr('Luân lưu:', 'Penalties:')}</span>
          <input type="number" min="0" value={hp} placeholder="-" onChange={e => { setHp(e.target.value); commit(hs, as, e.target.value, ap); }}
            className="score-input w-8 h-6 rounded bg-amber-950/60 border border-amber-400/40 text-center text-[11px] font-black text-amber-200 outline-none" />
          <span className="text-amber-400 text-[11px]">-</span>
          <input type="number" min="0" value={ap} placeholder="-" onChange={e => { setAp(e.target.value); commit(hs, as, hp, e.target.value); }}
            className="score-input w-8 h-6 rounded bg-amber-950/60 border border-amber-400/40 text-center text-[11px] font-black text-amber-200 outline-none" />
        </div>
      )}
    </div>
  );
}