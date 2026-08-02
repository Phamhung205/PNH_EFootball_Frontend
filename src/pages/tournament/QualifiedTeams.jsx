import React, { useState, useEffect, useMemo, useRef } from 'react';
import { knockoutApi } from '../../services/api';
import { Download, Image as ImageIcon, Loader2, Trophy, Settings2, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { captureAndSave } from '../../utils/exportImage';

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

export default function QualifiedTeams({ tournament, tournamentName = 'GIẢI ĐẤU', language = 'vi', isAdmin = false }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const tournamentId = tournament?.id;
  const [matches, setMatches] = useState([]);
  // Danh sach doi SE vao knockout — hien khi CHUA tao so do
  const [qualified, setQualified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(null);
  const [exporting, setExporting] = useState(false);

  // ── CHON DOI VAO VONG TRONG ──
  const [thirdCount, setThirdCount] = useState('');   // o nhap so doi hang ba
  const [manualIds, setManualIds] = useState(null);   // null = tu dong, [] = dang chon tay
  const [savingCfg, setSavingCfg] = useState(false);
  const [cfgMsg, setCfgMsg] = useState('');
  const [addBang, setAddBang] = useState('');   // bang dang chon o khu them tay
  const [addDoi, setAddDoi] = useState('');      // doi dang chon o khu them tay
  // Tro toi khoi poster dang hien (1 trong 2 nhanh render)
  const posterRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tournamentId) return;
      setLoading(true);
      try {
        const data = await knockoutApi.get(tournamentId);
        // LUON lay danh sach doi du dieu kien: du lieu tran khong co TEN BANG,
        // phai lay tu day. Truoc day chi goi khi chua co so do nen ao tai ve
        // bi mat dong "Bang A", "Bang B"...
        try {
          const q = await knockoutApi.getQualified(tournamentId);
          if (alive) {
            setQualified(q);
            // Dong bo o nhap + che do chon tay voi cai dat da luu tren may chu
            if (q?.thirdPlaceCount !== undefined && q?.thirdPlaceCount !== null)
              setThirdCount(String(q.thirdPlaceCount));
            if (q?.isManual) setManualIds((q.teams || []).map(t => t.teamId));
          }
        }
        catch { if (alive) setQualified(null); }
        if (alive) setMatches(Array.isArray(data) ? data : []);
      } catch { if (alive) setMatches([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [tournamentId]);

  // Tai lai danh sach doi vao vong trong (goi sau khi doi cai dat)
  const reloadQualified = React.useCallback(async (soHangBa) => {
    if (!tournamentId) return;
    try {
      const q = await knockoutApi.getQualified(
        tournamentId, undefined,
        (soHangBa === '' || soHangBa === undefined) ? undefined : Number(soHangBa)
      );
      setQualified(q);
      // Dong bo o nhap voi cai dat dang luu tren may chu
      if (soHangBa === undefined && q?.thirdPlaceCount !== undefined && q?.thirdPlaceCount !== null)
        setThirdCount(String(q.thirdPlaceCount));
      // Dang o che do chon tay -> nap danh sach hien tai de bam sua
      if (q?.isManual && manualIds === null)
        setManualIds((q.teams || []).map(t => t.teamId));
    } catch { /* giu nguyen danh sach cu */ }
  }, [tournamentId, manualIds]);

  // Luu cai dat len may chu (so doi hang ba + danh sach chon tay)
  const luuCauHinh = async (soHangBa, dsChonTay) => {
    if (!tournamentId) return;
    setSavingCfg(true); setCfgMsg('');
    try {
      await knockoutApi.saveQualifyConfig(tournamentId, {
        thirdPlaceCount: (soHangBa === '' || soHangBa === undefined) ? null : Number(soHangBa),
        manualTeamIds: dsChonTay && dsChonTay.length > 0 ? dsChonTay : null,
      });
      await reloadQualified(soHangBa);
      setCfgMsg(tr('Đã lưu', 'Saved'));
      setTimeout(() => setCfgMsg(''), 2000);
    } catch (e) {
      setCfgMsg(tr('Lỗi: ', 'Error: ') + (e?.message || ''));
    } finally {
      setSavingCfg(false);
    }
  };

  // Bam vao 1 doi de them/bo khoi danh sach (che do chon tay)
  const toggleTeam = async (teamId) => {
    // Chua bat chon tay -> lay danh sach tu dong lam diem xuat phat
    const hienTai = manualIds ?? (qualified?.teams || []).map(t => t.teamId);
    const moi = hienTai.includes(teamId)
      ? hienTai.filter(id => id !== teamId)
      : [...hienTai, teamId];
    setManualIds(moi);
    await luuCauHinh(thirdCount, moi);
  };

  // Them 1 doi thu cong: chon Bang -> chon Doi -> bam Them.
  const themDoiTay = async () => {
    const id = Number(addDoi);
    if (!id) return;
    const hienTai = manualIds ?? (qualified?.teams || []).map(t => t.teamId);
    if (hienTai.includes(id)) { setAddDoi(''); return; }
    const moi = [...hienTai, id];
    setManualIds(moi);
    setAddDoi('');
    await luuCauHinh(thirdCount, moi);
  };

  // Xoa 1 doi khoi danh sach (nut X tren moi doi)
  const xoaDoi = async (teamId) => {
    const hienTai = manualIds ?? (qualified?.teams || []).map(t => t.teamId);
    const moi = hienTai.filter(id => id !== teamId);
    setManualIds(moi);
    await luuCauHinh(thirdCount, moi);
  };

  // Bo chon tay, ve lai hoan toan tu dong
  const veTuDong = async () => {
    setManualIds(null);
    await luuCauHinh(thirdCount, null);
  };

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

      // CAP DAU THAT cua vong nay (lay tu chinh cac tran, khong phai du kien).
      // Sap theo bracketSlot de dung thu tu hien thi tren so do.
      const pairs = [...ms]
        .sort((a, b) => (a.bracketSlot ?? a.matchId ?? 0) - (b.bracketSlot ?? b.matchId ?? 0))
        .map(m => ({
          home: { name: m.homeName, logo: m.homeLogo },
          away: { name: m.awayName, logo: m.awayLogo },
        }));

      const teamsInRound = ms.length * 2; // số đội dự kiến của vòng
      return { round: rNum, teamsInRound, teams, pairs, labels: roundLabels(teamsInRound) };
    }).slice(0, 1); // CHI hien vong dau tien (danh sach doi vao vong trong), khong hien 1/8, tu ket...
  }, [matches]);

  // Vòng đang chọn (mặc định vòng đầu tiên)
  const activeRound = useMemo(() => {
    if (rounds.length === 0) return null;
    if (selectedRound == null) return rounds[0];
    return rounds.find(r => r.round === selectedRound) || rounds[0];
  }, [rounds, selectedRound]);

  // Ghep them TEN BANG + SO HAT GIONG tu API qualified vao danh sach doi.
  // Du lieu tran (matches) khong co 2 truong nay, phai lay tu qualified.
  const activeTeams = useMemo(() => {
    const list = activeRound?.teams || [];
    const meta = new Map();
    (qualified?.teams || []).forEach(q => {
      const key = String(q.teamId ?? q.id ?? '');
      if (key) meta.set(key, { groupName: q.groupName, seed: q.seed });
    });
    return list.map((t, i) => {
      const m = meta.get(String(t.id)) || {};
      return { ...t, groupName: m.groupName, seed: m.seed ?? i + 1 };
    });
  }, [activeRound, qualified]);

  const handleExport = async () => {
    // Dung ref chu KHONG dung getElementById: co 2 nhanh render cung id
    // (chua tao so do / da tao so do), getElementById luon lay cai DAU TIEN
    // trong DOM nen co the chup nham khoi.
    const el = posterRef.current;
    if (!el) return;
    setExporting(true);
    // Luu style cu de tra lai sau khi chup
    const prevEl = el.getAttribute('style') || '';
    const grid = el.querySelector('[data-poster-grid]');
    const prevGrid = grid ? (grid.getAttribute('style') || '') : '';
    const teamGrid = el.querySelector('[data-team-grid]');
    const prevTeamGrid = teamGrid ? (teamGrid.getAttribute('style') || '') : '';
    try {
      // ── EP BO CUC NGANG khi chup ──
      // Tren dien thoai, lop lg: khong kich hoat nen 2 khoi xep DOC -> anh dai thong loc.
      // Dung setProperty(..., 'important') vi lop Tailwind grid-cols-1 co the
      // thang the inline style thong thuong.
      el.style.setProperty('width', '1280px', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      if (grid) {
        // Doi vao TRAI (1.5fr) · cap dau vao PHAI (0.85fr)
        grid.style.setProperty('display', 'grid', 'important');
        grid.style.setProperty('grid-template-columns', 'minmax(0,1.5fr) minmax(0,0.85fr)', 'important');
        grid.style.setProperty('gap', '16px', 'important');
        // Bo order cua Tailwind: dat lai thu tu bang chinh DOM order
        grid.querySelectorAll(':scope > div').forEach(child => {
          child.style.setProperty('order', '0', 'important');
        });
        // Khoi DOI phai dung truoc (trai), khoi CAP DAU dung sau (phai)
        const teamBox = grid.querySelector('[data-team-box]');
        const pairBox = grid.querySelector('[data-pair-box]');
        if (teamBox) teamBox.style.setProperty('order', '1', 'important');
        if (pairBox) pairBox.style.setProperty('order', '2', 'important');
      }
      if (teamGrid) {
        teamGrid.style.setProperty('display', 'grid', 'important');
        teamGrid.style.setProperty('grid-template-columns', 'repeat(4, minmax(0,1fr))', 'important');
        teamGrid.style.setProperty('gap', '10px', 'important');
      }
      // Cho trinh duyet ve lai theo kich thuoc moi
      await new Promise(r => setTimeout(r, 80));

      const safe = (tournamentName || 'Giai').replace(/[^a-zA-Z0-9]/g, '_');
      // captureAndSave tu nhan dien may va tu giam do phan giai theo gioi han canvas
      const ok = await captureAndSave(el, {
        filename: `DoiVaoVong_${safe}`,
        background: '#0a1a52',
        language,
      });
      if (!ok) alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } catch (e) {
      alert(tr('Lỗi khi tạo ảnh. Thử lại nhé.', 'Error creating image. Please try again.'));
    } finally {
      // Tra lai bo cuc goc. Phai removeProperty tung cai vi setAttribute
      // KHONG xoa duoc cac thuoc tinh dat kem 'important'.
      ['width', 'max-width'].forEach(k => el.style.removeProperty(k));
      if (grid) {
        ['display', 'grid-template-columns', 'gap'].forEach(k => grid.style.removeProperty(k));
        grid.querySelectorAll(':scope > div').forEach(child => child.style.removeProperty('order'));
      }
      if (teamGrid) {
        ['display', 'grid-template-columns', 'gap'].forEach(k => teamGrid.style.removeProperty(k));
      }
      // Dat lai style ban dau (vd background cua nhanh chua co so do)
      if (prevEl) el.setAttribute('style', prevEl);
      if (grid && prevGrid) grid.setAttribute('style', prevGrid);
      if (teamGrid && prevTeamGrid) teamGrid.setAttribute('style', prevTeamGrid);
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
            <div ref={posterRef} className="p-4 rounded-3xl" style={{ background: '#0a1a52' }}>
              {/* Tieu de trong anh */}
              <div className="text-center pb-1">
                <h2 className="text-xl font-black text-white tracking-wide">{tournamentName}</h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300/70 mt-1">
                  {tr('Các Đội Lọt Vào Vòng Trong', 'Teams Advancing to Knockout')}
                </p>
              </div>

              {/* ════ BANG DIEU KHIEN CHON DOI ════
                  Chi hien tren giao dien. Khi TAI ANH (exporting=true) thi AN di
                  vi bang nay nam trong posterRef -> neu khong an se lot vao anh. */}
              {isAdmin && !qualified?.hasBracket && !exporting && (
                <div className="mb-4 rounded-2xl border border-blue-400/25 bg-blue-500/8 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 size={16} className="text-blue-300" />
                    <h4 className="text-sm font-black text-blue-100">
                      {tr('Chọn đội vào vòng trong', 'Select advancing teams')}
                    </h4>
                    {cfgMsg && <span className="text-[11px] text-emerald-400 font-bold">{cfgMsg}</span>}
                  </div>

                  <div className="flex items-end gap-3 flex-wrap">
                    <div>
                      <label className="block text-[11px] text-blue-300/70 mb-1">
                        {tr('Số đội hạng ba lấy thêm', 'Best third-place teams')}
                      </label>
                      <input
                        type="number" min="0" max="32" value={thirdCount}
                        onChange={(e) => setThirdCount(e.target.value)}
                        onBlur={() => luuCauHinh(thirdCount, manualIds)}
                        placeholder={tr('Tự tính', 'Auto')}
                        disabled={savingCfg}
                        className="w-28 px-3 py-2 rounded-xl bg-blue-950/50 border border-blue-400/30 text-white text-sm outline-none focus:border-cyan-400/60"
                      />
                    </div>

                    <div className="text-xs text-blue-300/70 pb-2">
                      {tr(`Luôn lấy ${qualified?.perGroup ?? 2} đội đầu mỗi bảng`,
                          `Always top ${qualified?.perGroup ?? 2} per group`)}
                      {' · '}
                      <span className="font-bold text-blue-100">
                        {tr(`tổng ${qTeams.length} đội`, `${qTeams.length} teams total`)}
                      </span>
                    </div>

                    {manualIds !== null && (
                      <button onClick={veTuDong} disabled={savingCfg}
                        className="px-3 py-2 rounded-xl border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/10 disabled:opacity-50">
                        {tr('Bỏ chọn tay — về tự động', 'Reset to automatic')}
                      </button>
                    )}
                  </div>

                  {/* Canh bao so doi khong tao duoc so do */}
                  {qualified && qTeams.length >= 2 && !qualified.isPowerOfTwo && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/12 border border-red-500/30">
                      <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-200 leading-relaxed">
                        {tr(`Đang có ${qTeams.length} đội — chưa tạo được sơ đồ. Cần đúng ${qualified.nextPowerOfTwo} đội (thiếu ${qualified.nextPowerOfTwo - qTeams.length} đội).`,
                            `${qTeams.length} teams — cannot create bracket. Need exactly ${qualified.nextPowerOfTwo} (missing ${qualified.nextPowerOfTwo - qTeams.length}).`)}
                      </p>
                    </div>
                  )}
                  {qualified?.isPowerOfTwo && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/30">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-200 font-semibold">
                        {tr(`Đủ ${qTeams.length} đội — tạo sơ đồ được`, `${qTeams.length} teams — ready to create bracket`)}
                      </p>
                    </div>
                  )}

                  {/* ════ THEM DOI THU CONG: chon Bang -> chon Doi -> Them ════ */}
                  {Array.isArray(qualified?.groupStandings) && qualified.groupStandings.length > 0 && (
                    <div className="rounded-2xl border border-dashed border-blue-400/40 bg-blue-500/5 p-3.5">
                      <div className="text-xs font-black text-blue-300 mb-2.5 flex items-center gap-1.5">
                        <Plus size={14} /> {tr('Thêm đội thủ công', 'Add team manually')}
                      </div>
                      <div className="flex items-end gap-2.5 flex-wrap">
                        <div>
                          <label className="block text-[10px] text-blue-300/60 mb-1">{tr('1. Chọn bảng', '1. Group')}</label>
                          <select value={addBang}
                            onChange={(e) => { setAddBang(e.target.value); setAddDoi(''); }}
                            className="px-3 py-2 rounded-xl bg-blue-950/60 border border-blue-400/30 text-white text-[13px] outline-none focus:border-cyan-400/60 min-w-[110px]">
                            <option value="">{tr('— Bảng —', '— Group —')}</option>
                            {qualified.groupStandings.map(g => (
                              <option key={g.groupName} value={g.groupName}>
                                {tr('Bảng', 'Group')} {g.groupName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-blue-300/40 text-base pb-2">→</span>

                        <div>
                          <label className="block text-[10px] text-blue-300/60 mb-1">{tr('2. Chọn đội', '2. Team')}</label>
                          <select value={addDoi} onChange={(e) => setAddDoi(e.target.value)}
                            disabled={!addBang}
                            className="px-3 py-2 rounded-xl bg-blue-950/60 border border-blue-400/30 text-white text-[13px] outline-none focus:border-cyan-400/60 disabled:opacity-40 min-w-[150px]">
                            <option value="">{tr('— Đội —', '— Team —')}</option>
                            {(qualified.groupStandings.find(g => g.groupName === addBang)?.teams || [])
                              .filter(t => !qTeams.some(q => q.teamId === t.teamId))
                              .map(t => (
                                <option key={t.teamId} value={t.teamId}>{t.name}</option>
                              ))}
                          </select>
                        </div>

                        <span className="text-blue-300/40 text-base pb-2">→</span>

                        <button onClick={themDoiTay} disabled={!addDoi || savingCfg}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-[13px] font-black">
                          <CheckCircle2 size={14} /> {tr('Thêm', 'Add')}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-blue-300/50">
                    {tr('Nhấp vào đội bên dưới để bỏ, hoặc dùng nút ✕ trên mỗi đội.',
                        'Tap a team below to remove, or use the ✕ button.')}
                  </p>
                </div>
              )}

              {/* Bo cuc NGANG: DOI ben trai · CAP DAU ben phai (man hinh hep tu xuong doc) */}
              <div data-poster-grid
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)] gap-4 items-start">

            <div data-team-box className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5 lg:order-1">
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

              <div data-team-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {qTeams.map((t) => (
                  <div key={t.teamId}
                    onClick={() => { if (isAdmin && !qualified?.hasBracket && !exporting) toggleTeam(t.teamId); }}
                    title={isAdmin && !qualified?.hasBracket && !exporting ? tr('Nhấp để bỏ đội này', 'Tap to remove') : undefined}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all
                      ${t.isThirdPlace
                        ? 'bg-amber-500/12 border-amber-400/35'
                        : 'bg-blue-500/10 border-blue-400/20'}
                      ${isAdmin && !qualified?.hasBracket && !exporting ? 'cursor-pointer hover:brightness-125' : ''}`}>
                    <span className={`w-6 h-6 shrink-0 rounded-lg text-[11px] font-black flex items-center justify-center
                      ${t.isThirdPlace ? 'bg-amber-500/30 text-amber-200' : 'bg-blue-500/25 text-blue-200'}`}>
                      {t.seed}
                    </span>
                    {t.logo
                      ? <img src={t.logo} alt="" className="w-7 h-7 rounded-lg object-contain shrink-0" />
                      : <div className="w-7 h-7 rounded-lg bg-blue-500/20 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-50 truncate">{t.name}</p>
                      {t.groupName && (
                        <p className="text-[10px] text-blue-300/60">{tr('Bảng', 'Group')} {t.groupName}</p>
                      )}
                    </div>
                    {isAdmin && !qualified?.hasBracket && !exporting && (
                      <button
                        onClick={(e) => { e.stopPropagation(); xoaDoi(t.teamId); }}
                        title={tr('Xóa đội này', 'Remove team')}
                        className="ml-auto w-5 h-5 shrink-0 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 text-[13px] font-black leading-none flex items-center justify-center hover:bg-red-500/35">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* ════ BANG XEP HANG DOI HANG BA ════
                  Hien du CA cac doi hang ba, to sang doi duoc chon, lam mo doi bi loai.
                  Giup BTC giai thich duoc voi cac doi tai sao minh khong di tiep. */}
              {Array.isArray(qualified?.thirdPlaceRanking) && qualified.thirdPlaceRanking.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-400/15">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider mb-2">
                    {tr('Xếp hạng các đội hạng ba', 'Third-place ranking')}
                  </h4>
                  {isAdmin && !qualified?.hasBracket && !exporting && (
                    <p className="text-[10px] text-blue-300/60 mb-2">
                      {tr('Nhấp vào đội để thêm / bỏ khỏi danh sách đi tiếp.',
                          'Tap a team to add / remove from the qualified list.')}
                    </p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-blue-300/50 font-black uppercase">
                          <th className="text-left py-1.5 px-1">#</th>
                          <th className="text-left py-1.5 px-1">{tr('Đội', 'Team')}</th>
                          <th className="text-center py-1.5 px-1">{tr('Bảng', 'Grp')}</th>
                          <th className="text-center py-1.5 px-1">{tr('Tr', 'P')}</th>
                          <th className="text-center py-1.5 px-1">{tr('HS', 'GD')}</th>
                          <th className="text-center py-1.5 px-1">{tr('BT', 'GF')}</th>
                          <th className="text-center py-1.5 px-1 text-amber-300">{tr('Đ', 'Pts')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qualified.thirdPlaceRanking.map((r) => {
                          const team = qTeams.find(x => x.teamId === r.teamId);
                          const ten = team?.name
                            || (qualified.teams || []).find(x => x.teamId === r.teamId)?.name
                            || `#${r.teamId}`;
                          const chonDuoc = isAdmin && !qualified?.hasBracket && !exporting;
                          return (
                            <tr key={r.teamId}
                              onClick={() => { if (chonDuoc) toggleTeam(r.teamId); }}
                              title={chonDuoc ? tr('Nhấp để thêm/bỏ', 'Tap to toggle') : undefined}
                              className={`border-t border-blue-400/10 ${r.qualified ? '' : 'opacity-40'}
                                ${chonDuoc ? 'cursor-pointer hover:bg-blue-500/10' : ''}`}>
                              <td className="py-1.5 px-1 font-black text-blue-300/60">{r.rank}</td>
                              <td className="py-1.5 px-1">
                                <span className={`font-bold ${r.qualified ? 'text-amber-200' : 'text-blue-100'}`}>
                                  {ten}
                                </span>
                                {r.qualified && (
                                  <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300">
                                    {tr('ĐI TIẾP', 'IN')}
                                  </span>
                                )}
                              </td>
                              <td className="text-center py-1.5 px-1 text-blue-300/70">{r.groupName}</td>
                              <td className="text-center py-1.5 px-1 text-blue-200">{r.played}</td>
                              <td className="text-center py-1.5 px-1 text-blue-200">
                                {r.goalDiff > 0 ? '+' : ''}{r.goalDiff}
                              </td>
                              <td className="text-center py-1.5 px-1 text-blue-200">{r.goalsFor}</td>
                              <td className="text-center py-1.5 px-1 font-black text-amber-300">{r.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-blue-300/45 mt-2">
                    {tr('Xét: điểm → hiệu số → bàn thắng → số trận thắng',
                        'Order: points → goal difference → goals for → wins')}
                  </p>
                </div>
              )}
            </div>

            {/* Cap dau du kien */}
            {qPairs.length > 0 && (
              <div data-pair-box className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5 lg:order-2">
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
              </div>{/* het khung 2 cot */}
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

  // Cap dau cua vong dang xem + ten vong (VONG 1/16, TU KET...)
  const activePairs = activeRound?.pairs || [];
  const roundName = tr(activeRound.labels.vi, activeRound.labels.en);

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

      {/* POSTER - vùng chụp ảnh.
          Bo cuc GIONG ban hien tren web: cot trai la Cap Dau Du Kien,
          cot phai la danh sach doi co TEN + TEN BANG.
          Ban cu chi hien logo tron nen anh tai ve khong biet doi nao. */}
      <div ref={posterRef} className="relative rounded-3xl overflow-hidden p-5 md:p-7"
        style={{ background: 'radial-gradient(ellipse at 20% 30%, #1a3a8f 0%, #0a1a52 60%, #060f38 100%)' }}>
        {/* Hiệu ứng đường cong nền */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 40%, rgba(80,140,255,0.08) 50%, transparent 60%)' }} />

        <div className="relative">
          {/* Tieu de */}
          <div className="text-center mb-5">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">{tournamentName}</h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300/70 mt-1">
              {roundName} · {tr('Các Đội Lọt Vào Vòng Trong', 'Teams Advancing to Knockout')}
            </p>
          </div>

          {/* Doi BEN TRAI (1.5fr) · Cap dau BEN PHAI (0.85fr).
              data-poster-grid: de handleExport tim va ep 2 cot khi chup anh. */}
          <div data-poster-grid
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)] gap-4 items-start">

            {/* COT PHAI: cap dau (order-2 de nam ben phai) */}
            {activePairs.length > 0 && (
              <div data-pair-box className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-4 md:p-5 lg:order-2">
                <h3 className="font-black text-blue-100 mb-3 text-sm">
                  {tr('Cặp Đấu Dự Kiến', 'Projected Matchups')}
                </h3>
                <div className="space-y-2">
                  {activePairs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-5 shrink-0 text-blue-300/50 font-bold">{i + 1}</span>
                      <span className="flex-1 text-right font-bold text-blue-50 break-words">{p.home?.name || '—'}</span>
                      <span className="px-1.5 shrink-0 text-blue-300/50 font-black">vs</span>
                      <span className="flex-1 font-bold text-blue-50 break-words">{p.away?.name || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COT TRAI: danh sach doi co TEN + BANG (order-1 de nam ben trai) */}
            <div data-team-box className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-4 md:p-5 lg:order-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} className="text-amber-400" />
                <h3 className="font-black text-blue-100">
                  {tr('Các Đội Lọt Vào Vòng Trong', 'Teams Advancing to Knockout')}
                </h3>
              </div>
              <p className="text-xs text-blue-300/70 mb-4">
                {tr(`${activeTeams.length} đội · ${roundName}`,
                    `${activeTeams.length} teams · ${roundName}`)}
              </p>

              <div data-team-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {activeTeams.map((t) => (
                  <div key={t.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20">
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-blue-500/25 text-blue-200 text-[11px] font-black flex items-center justify-center">
                      {t.seed}
                    </span>
                    {t.logo
                      ? <img src={t.logo} alt="" className="w-7 h-7 shrink-0 rounded-lg object-contain" />
                      : <div className="w-7 h-7 rounded-lg bg-blue-500/20 shrink-0" />}
                    <div className="min-w-0">
                      {/* Cho ten xuong toi da 2 dong thay vi cat cut */}
                      <p className="text-xs font-bold text-blue-50 leading-tight"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                        {t.name}
                      </p>
                      {t.groupName && (
                        <p className="text-[10px] text-blue-300/60">{tr('Bảng', 'Group')} {t.groupName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold tracking-widest mt-4">
            <Trophy size={12} /> PNH FOOTBALL
          </div>
        </div>
      </div>
    </div>
  );
}