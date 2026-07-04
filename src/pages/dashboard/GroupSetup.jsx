import React, { useState, useEffect, useRef } from 'react';
import { Layers, Shuffle, Save, AlertTriangle, ChevronRight, ArrowLeft, CheckCircle2, Lock, Eye, GitMerge, Download, Loader2 } from 'lucide-react';
import { groupApi, registrationApi } from '../../services/api';
import { snapdom } from '@zumer/snapdom';

// Tao ten bang theo index: 0->A, 25->Z, 26->"Bang 27", 27->"Bang 28"...
const makeGroupKey = (i) => (i < 26 ? String.fromCharCode(65 + i) : `Bảng ${i + 1}`);

const GroupSetup = ({ darkMode, language, teams = [], activeTournament, groups, onGroupsChange, onReload, isAdmin = false, matches = [], onGoToTab }) => {
  const dm = darkMode;
  const canEdit = isAdmin; // CHI ADMIN moi duoc chia bang / luu. User chi xem.

  // ─── Kiem tra vong bang da DONE chua: co tran VA tat ca tran deu done ───
  const groupMatches = (matches || []).filter(m => m && m.status); // tat ca tran
  const totalMatches = groupMatches.length;
  const doneMatches = groupMatches.filter(m => m.status === 'done').length;
  const isGroupStageDone = totalMatches > 0 && doneMatches === totalMatches;
  const [showDoneDetail, setShowDoneDetail] = useState(false);

  // Suy ra so bang ban dau tu du lieu da luu (neu co), mac dinh 2
  const initialGroups = groups && Object.keys(groups).length ? groups : {};
  const initialNum = Object.keys(initialGroups).length || 2;

  const [numGroups, setNumGroups]         = useState(initialNum);
  const [localGroups, setLocalGroups]     = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);
  // Map teamId -> ten nguoi duoc gan random (hien canh doi bong)
  const [playerMap, setPlayerMap]         = useState({});
  const captureRef = useRef(null);        // vung bang de chup anh
  const [downloading, setDownloading]     = useState(false);
  const [assigningPlayers, setAssigningPlayers] = useState(false);

  // Load ten nguoi duoc gan vao tung doi (tu dang ky da chia)
  const loadAssignments = React.useCallback(() => {
    const tid = activeTournament?.id ?? activeTournament?.tournamentId;
    if (!tid) return Promise.resolve();
    return registrationApi.teamAssignments(tid)
      .then(list => {
        const map = {};
        (list || []).forEach(a => { if (a.teamId != null) map[a.teamId] = a.playerName; });
        setPlayerMap(map);
      })
      .catch(() => {});
  }, [activeTournament]);

  useEffect(() => {
    let alive = true;
    loadAssignments();
    return () => { alive = false; };
  }, [loadAssignments]);

  // Gan nguoi dang ky random vao cac doi CO SAN
  const handleAssignPlayers = async () => {
    const tid = activeTournament?.id ?? activeTournament?.tournamentId;
    if (!tid) return;
    if (!window.confirm('Gan ngau nhien nhung nguoi da dang ky vao cac doi bong? (doi phai co san)')) return;
    setAssigningPlayers(true);
    try {
      const res = await registrationApi.autoAssign(tid);
      setToast(res?.message || 'Da gan nguoi vao doi!');
      await loadAssignments();
    } catch (e) {
      setToast('Loi: ' + (e?.message || 'khong gan duoc. Kiem tra da co doi chua.'));
    } finally {
      setAssigningPlayers(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ─── Khi teams (da load tu backend) thay doi -> dung GroupName co san de khoi phuc bang ───
  useEffect(() => {
    const fromTeams = {};
    let hasAny = false;
    teams.forEach(t => {
      if (t.group) {
        hasAny = true;
        if (!fromTeams[t.group]) fromTeams[t.group] = [];
        fromTeams[t.group].push(t.id);
      }
    });
    if (hasAny) {
      setLocalGroups(fromTeams);
      const n = Object.keys(fromTeams).length;
      if (n >= 1) setNumGroups(n);
    } else if (groups && Object.keys(groups).length) {
      setLocalGroups(groups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  // Danh sach key bang theo numGroups (A,B,... roi "Bang 27"...)
  const groupKeys = Array.from({ length: numGroups }, (_, i) => makeGroupKey(i));

  // Neu bang dang chon khong con ton tai (vi giam so bang) -> ve bang dau
  useEffect(() => {
    if (!groupKeys.includes(selectedGroup)) {
      setSelectedGroup(groupKeys[0] || 'A');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numGroups]);

  // Doi chua thuoc bang nao
  const assignedIds = new Set(Object.values(localGroups).flat());
  const pool = teams.filter(t => !assignedIds.has(t.id));

  // Chia tu dong: chia deu doi vao numGroups bang
  const autoAssign = () => {
    if (!canEdit) return; // User khong duoc chia
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const newGroups = {};
    groupKeys.forEach(k => { newGroups[k] = []; });
    shuffled.forEach((t, i) => { newGroups[groupKeys[i % numGroups]].push(t.id); });
    setLocalGroups(newGroups);
  };

  // Dat lai (xoa het phan bang local, dua tat ca ve pool)
  const resetGroups = () => {
    if (!canEdit) return; // User khong duoc dat lai
    const newGroups = {};
    groupKeys.forEach(k => { newGroups[k] = []; });
    setLocalGroups(newGroups);
    setSelectedGroup(groupKeys[0] || 'A');
  };

  // Doi so bang (tu slider hoac o nhap): clamp 1..99, reset phan bang
  const changeNumGroups = (val) => {
    if (!canEdit) return; // User khong duoc doi so bang
    let n = parseInt(val, 10);
    if (isNaN(n)) n = 1;
    if (n < 1) n = 1;
    if (n > 99) n = 99;
    setNumGroups(n);
    const keys = Array.from({ length: n }, (_, i) => makeGroupKey(i));
    const newGroups = {};
    keys.forEach(k => { newGroups[k] = []; });
    setLocalGroups(newGroups);
    setSelectedGroup(keys[0] || 'A');
  };

  // Tai anh bang dau ve may (kem ten nguoi da chia). Toi uu mobile: scale 2, nen goc toi.
  const handleDownloadImage = async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const result = await snapdom(captureRef.current, { scale: 2, backgroundColor: dm ? '#0a0f1d' : '#ffffff' });
      const img = await result.toPng();
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `ChiaBang_${(activeTournament?.name || 'giai').replace(/[^\w]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setToast('Khong tai duoc anh. Thu lai.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const assignToGroup = (teamId) => {
    if (!canEdit) return; // User khong duoc keo doi vao bang
    setLocalGroups(prev => {
      const g = { ...prev };
      groupKeys.forEach(k => { g[k] = (g[k] || []).filter(id => id !== teamId); });
      g[selectedGroup] = [...(g[selectedGroup] || []), teamId];
      return g;
    });
  };

  const removeFromGroup = (teamId, groupKey) => {
    if (!canEdit) return; // User khong duoc go doi khoi bang
    setLocalGroups(prev => ({ ...prev, [groupKey]: (prev[groupKey] || []).filter(id => id !== teamId) }));
  };

  // ─── LUU THAT len backend ───
  const handleSave = async () => {
    if (!canEdit) { showToast('Bạn không có quyền lưu phân bảng.'); return; }
    if (!activeTournament?.id) { showToast('Chưa chọn giải đấu.'); return; }
    setSaving(true);
    try {
      const payload = {};
      groupKeys.forEach(k => {
        if ((localGroups[k] || []).length) payload[k] = localGroups[k];
      });
      await groupApi.save(activeTournament.id, payload);
      setSaving(false);
      if (onGroupsChange) onGroupsChange(localGroups);
      showToast('Đã lưu phân bảng!');
      if (onReload) { Promise.resolve(onReload()).catch(() => {}); }
    } catch (e) {
      setSaving(false);
      showToast('Lỗi lưu: ' + (e.message || 'không xác định'));
    }
  };

  const getTeam = id => teams.find(t => t.id === id);

  const card     = dm ? 'bg-white/5 border-white/10'        : 'bg-white border-slate-200 shadow-sm';
  const cardSel  = dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-300';
  const dim      = dm ? 'text-slate-400' : 'text-slate-500';

  const TeamChip = ({ teamId, onClick, removable }) => {
    const team = getTeam(teamId);
    if (!team) return null;
    return (
      <button type="button" onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 ${dm ? 'bg-white/8 border border-white/10 hover:bg-white/12 text-white' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900'}`}>
        <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center text-sm shrink-0" style={{ background: `${team.color || '#10b981'}33` }}>
          {team.logo
            ? (team.logo.startsWith('http') || team.logo.startsWith('data:')
                ? <img src={team.logo} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display='none'} />
                : <span>{team.logo}</span>)
            : '⚽'}
        </div>
        {/* Ten doi (ben trai) */}
        <span className="flex-1 text-left min-w-0 truncate">{team.name}</span>

        {/* Ten nguoi duoc gan (ben phai, doi dien ten doi) */}
        {playerMap[team.id] ? (
          <span className={`text-[13px] font-semibold truncate max-w-[45%] text-right ${dm ? 'text-cyan-300' : 'text-cyan-600'}`}>
            👤 {playerMap[team.id]}
          </span>
        ) : (
          /* Chua gan nguoi -> van hien mui ten de biet bam duoc */
          removable
            ? <ArrowLeft size={13} className="text-slate-400 shrink-0" />
            : <ChevronRight size={13} className="text-emerald-400 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Chia Bảng Đấu</h1>
            <p className={`text-sm ${dim}`}>{teams.length} đội · {numGroups} bảng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <>
              <button onClick={resetGroups}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                Đặt Lại
              </button>
              <button onClick={autoAssign}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-purple-500/20">
                <Shuffle size={15} /> Chia Tự Động
              </button>
              <button onClick={handleAssignPlayers} disabled={assigningPlayers}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-lg shadow-pink-500/20">
                {assigningPlayers ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shuffle size={15} />}
                Gán Người (Random)
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold transition-all">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                Lưu
              </button>
              <button onClick={handleDownloadImage} disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold transition-all">
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Tải Ảnh
              </button>
            </>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${dm ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <Lock size={14} />
              <span className="text-xs font-bold">Chỉ xem — chỉ Admin được chia bảng</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── BANNER: Vong bang DONE ─── */}
      {isGroupStageDone && (
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: 'rgba(16,185,129,0.4)', background: dm ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))' : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))' }}>
          <div className="p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <CheckCircle2 size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-400 tracking-wide">DONE</span>
                  <span className={`text-sm font-bold ${dm ? 'text-slate-200' : 'text-slate-700'}`}>— Vòng bảng đã hoàn thành</span>
                </div>
                <p className={`text-xs mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  {doneMatches}/{totalMatches} trận đã có kết quả. Sẵn sàng vào vòng loại trực tiếp.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDoneDetail(v => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                <Eye size={15} /> {showDoneDetail ? 'Ẩn' : 'Xem'} kết quả
              </button>
              <button onClick={() => onGoToTab && onGoToTab('knockout')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-cyan-500/20">
                <GitMerge size={15} /> Chuyển qua Knockout
              </button>
            </div>
          </div>
          {/* Xem lai ket qua vong bang */}
          {showDoneDetail && (
            <div className={`border-t px-5 py-4 ${dm ? 'border-slate-700/50 bg-slate-900/30' : 'border-slate-200 bg-white/50'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupMatches.map((m, i) => {
                  const home = teams.find(t => String(t.id) === String(m.homeId));
                  const away = teams.find(t => String(t.id) === String(m.awayId));
                  return (
                    <div key={m.id || i} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs ${dm ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <span className={`font-bold truncate flex-1 text-right ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{home?.name || '?'}</span>
                      <span className="font-black text-cyan-400 shrink-0 px-1.5">{m.homeScore ?? '-'} : {m.awayScore ?? '-'}</span>
                      <span className={`font-bold truncate flex-1 ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{away?.name || '?'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {!activeTournament && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className={`text-sm font-medium ${dm ? 'text-amber-300' : 'text-amber-700'}`}>Vui lòng chọn giải đấu trước.</p>
        </div>
      )}
      {activeTournament && teams.length < 2 && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className={`text-sm font-medium ${dm ? 'text-amber-300' : 'text-amber-700'}`}>Cần ít nhất 2 đội để chia bảng.</p>
        </div>
      )}

      {/* Num groups selector - NUT +/- (chinh xac, de bam mobile) */}
      <div className={`rounded-2xl border p-4 space-y-3 ${card}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-sm font-bold shrink-0 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Số bảng:</span>

          {/* Nut giam */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeNumGroups(numGroups - 1)}
              disabled={!canEdit || numGroups <= 1}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-black transition-all active:scale-90 ${(!canEdit || numGroups <= 1) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${dm ? 'bg-slate-800 text-purple-300 hover:bg-slate-700' : 'bg-slate-100 text-purple-600 hover:bg-slate-200'}`}>
              −
            </button>

            {/* O nhap so truc tiep */}
            <input
              type="number"
              min="1"
              max="99"
              value={numGroups}
              onChange={(e) => changeNumGroups(e.target.value)}
              disabled={!canEdit}
              className={`w-20 h-11 px-2 rounded-xl text-center text-xl font-black outline-none border-2 transition-all ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''} ${dm ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'}`}
            />

            {/* Nut tang */}
            <button
              type="button"
              onClick={() => changeNumGroups(numGroups + 1)}
              disabled={!canEdit || numGroups >= 99}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-black transition-all active:scale-90 ${(!canEdit || numGroups >= 99) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${dm ? 'bg-slate-800 text-purple-300 hover:bg-slate-700' : 'bg-slate-100 text-purple-600 hover:bg-slate-200'}`}>
              +
            </button>

            <span className={`text-sm font-black ml-1 ${dm ? 'text-purple-300' : 'text-purple-600'}`}>bảng</span>
          </div>
        </div>

        {/* Nut chon nhanh so bang pho bien */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs ${dim}`}>Chọn nhanh:</span>
          {[2, 4, 8, 16].map(n => (
            <button key={n}
              type="button"
              onClick={() => changeNumGroups(n)}
              disabled={!canEdit}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!canEdit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${numGroups === n
                ? 'bg-purple-500 text-white'
                : dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {n} bảng
            </button>
          ))}
        </div>

        <p className={`text-xs ${dim}`}>
          Bấm +/− hoặc gõ số (1–99). Nhấp đội ở Pool → vào bảng đang chọn. Nhấp đội trong bảng → đưa về Pool.
        </p>
      </div>

      {/* Main layout */}
      {activeTournament && teams.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pool */}
          <div className={`rounded-2xl border p-4 space-y-2 ${card}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${dim}`}>
              Đội Chưa Phân Bổ ({pool.length})
            </p>
            {pool.length === 0
              ? <p className={`text-sm text-center py-6 ${dim}`}>✅ Tất cả đã được phân bổ</p>
              : pool.map(t => (
                <TeamChip key={t.id} teamId={t.id} onClick={() => assignToGroup(t.id)} />
              ))}
          </div>

          {/* Groups */}
          <div ref={captureRef} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupKeys.map(gk => {
              const groupTeamIds = localGroups[gk] || [];
              const isSel = selectedGroup === gk;
              // Ten hien thi: neu la chu cai don -> "Bảng A", neu da la "Bảng 27" -> giu nguyen
              const label = gk.startsWith('Bảng') ? gk : `Bảng ${gk}`;
              return (
                <div key={gk}
                  onClick={() => setSelectedGroup(gk)}
                  className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all ${isSel ? cardSel : card}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-black ${isSel ? 'text-emerald-400' : (dm ? 'text-white' : 'text-slate-900')}`}>
                      {label}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isSel ? 'bg-emerald-500/20 text-emerald-400' : (dm ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                      {groupTeamIds.length} đội
                    </span>
                  </div>
                  {groupTeamIds.length === 0
                    ? <p className={`text-sm text-center py-4 ${dim}`}>{isSel ? '← Nhấp đội từ Pool' : 'Chọn bảng này'}</p>
                    : groupTeamIds.map(id => (
                      <TeamChip key={id} teamId={id} removable onClick={(e) => { e.stopPropagation(); removeFromGroup(id, gk); }} />
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-emerald-500/20 border border-emerald-400">
          <CheckCircle2 size={14} />{toast}
        </div>
      )}
    </div>
  );
};

export default GroupSetup;