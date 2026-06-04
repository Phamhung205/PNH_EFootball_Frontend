import React, { useState, useEffect } from 'react';
import { Layers, Shuffle, Save, AlertTriangle, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { groupApi } from '../../services/api';

const GroupSetup = ({ darkMode, language, teams = [], activeTournament, groups, onGroupsChange, onReload }) => {
  const dm = darkMode;

  // Suy ra so bang ban dau tu du lieu da luu (neu co), mac dinh 2
  const initialGroups = groups && Object.keys(groups).length ? groups : {};
  const initialNum = Object.keys(initialGroups).length || 2;

  const [numGroups, setNumGroups]         = useState(initialNum);
  const [localGroups, setLocalGroups]     = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ─── Khi teams (da load tu backend) thay doi -> dung GroupName co san de khoi phuc bang ───
  // teams[].group da duoc api.js doc tu GroupName backend.
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
      if (n >= 2) setNumGroups(n);
    } else if (groups && Object.keys(groups).length) {
      setLocalGroups(groups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const groupKeys = Array.from({ length: numGroups }, (_, i) => String.fromCharCode(65 + i));

  // Doi chua thuoc bang nao
  const assignedIds = new Set(Object.values(localGroups).flat());
  const pool = teams.filter(t => !assignedIds.has(t.id));

  // Chia tu dong
  const autoAssign = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const newGroups = {};
    groupKeys.forEach(k => { newGroups[k] = []; });
    shuffled.forEach((t, i) => { newGroups[groupKeys[i % numGroups]].push(t.id); });
    setLocalGroups(newGroups);
  };

  // Dat lai (xoa het phan bang local, dua tat ca ve pool)
  const resetGroups = () => {
    const newGroups = {};
    groupKeys.forEach(k => { newGroups[k] = []; });
    setLocalGroups(newGroups);
    setSelectedGroup('A');
  };

  const assignToGroup = (teamId) => {
    setLocalGroups(prev => {
      const g = { ...prev };
      groupKeys.forEach(k => { g[k] = (g[k] || []).filter(id => id !== teamId); });
      g[selectedGroup] = [...(g[selectedGroup] || []), teamId];
      return g;
    });
  };

  const removeFromGroup = (teamId, groupKey) => {
    setLocalGroups(prev => ({ ...prev, [groupKey]: (prev[groupKey] || []).filter(id => id !== teamId) }));
  };

  // ─── LUU THAT len backend ───
  const handleSave = async () => {
    if (!activeTournament?.id) { showToast('Chưa chọn giải đấu.'); return; }
    setSaving(true);
    try {
      // Chi gui cac bang co doi
      const payload = {};
      groupKeys.forEach(k => {
        if ((localGroups[k] || []).length) payload[k] = localGroups[k];
      });
      await groupApi.save(activeTournament.id, payload);
      // Save xong -> TAT spinner + bao thanh cong NGAY (khong cho onReload)
      setSaving(false);
      if (onGroupsChange) onGroupsChange(localGroups);
      showToast('Đã lưu phân bảng!');
      // Tai lai teams chay NEN (khong chan UI, khong lam treo nut Luu)
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
        <span className="flex-1 text-left">{team.name}</span>
        {removable ? <ArrowLeft size={13} className="text-slate-400 shrink-0" /> : <ChevronRight size={13} className="text-emerald-400 shrink-0" />}
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
          <button onClick={resetGroups}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
            Đặt Lại
          </button>
          <button onClick={autoAssign}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-purple-500/20">
            <Shuffle size={15} /> Chia Tự Động
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold transition-all">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Lưu
          </button>
        </div>
      </div>

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

      {/* Num groups selector */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 flex-wrap ${card}`}>
        <span className={`text-sm font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Số bảng:</span>
        {[2, 4, 8].map(n => (
          <button key={n} type="button" onClick={() => { setNumGroups(n); resetGroups(); }}
            className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${numGroups === n
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow'
              : dm ? 'bg-white/8 text-slate-400 hover:text-white hover:bg-white/12' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {n} bảng
          </button>
        ))}
        <span className={`ml-auto text-xs ${dim}`}>
          Nhấp đội ở Pool → vào bảng đang chọn. Nhấp trong bảng → đưa về Pool.
        </span>
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
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupKeys.map(gk => {
              const groupTeamIds = localGroups[gk] || [];
              const isSel = selectedGroup === gk;
              return (
                <div key={gk}
                  onClick={() => setSelectedGroup(gk)}
                  className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all ${isSel ? cardSel : card}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-black ${isSel ? 'text-emerald-400' : (dm ? 'text-white' : 'text-slate-900')}`}>
                      Bảng {gk}
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