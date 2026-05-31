import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Save, AlertTriangle } from 'lucide-react';

const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

const TeamManager = ({ darkMode, language, teams = [], activeTournament, onAddTeam, onEditTeam, onDeleteTeam }) => {
  const dm = darkMode;
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: '', abbr: '', logo: '', color: COLORS[0] });
  const [imgError, setImgError] = useState(false);

  const card  = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const input = dm ? 'bg-white/8 border-white/12 text-white placeholder-slate-500 focus:border-emerald-500/50' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500';
  const labelCls = dm ? 'text-slate-400' : 'text-slate-600';

  const openAdd = () => {
    setEditingTeam(null);
    setForm({ name: '', abbr: '', logo: '', color: COLORS[0] });
    setImgError(false);
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setForm({ name: team.name, abbr: team.abbr, logo: team.logo || '', color: team.color || COLORS[0] });
    setImgError(false);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingTeam) {
      onEditTeam({ ...editingTeam, ...form, name: form.name.trim(), abbr: form.abbr.trim().toUpperCase() });
    } else {
      onAddTeam({ id: Date.now().toString(), ...form, name: form.name.trim(), abbr: form.abbr.trim().toUpperCase(), tournamentId: activeTournament?.id });
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Quản Lý Đội Bóng</h1>
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{teams.length} đội · {activeTournament?.name || 'Chưa có giải đấu'}</p>
          </div>
        </div>
        {activeTournament && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Thêm Đội
          </button>
        )}
      </div>

      {/* No tournament warning */}
      {!activeTournament && (
        <div className={`rounded-2xl border p-6 flex items-center gap-3 ${dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={20} className="text-amber-400 shrink-0" />
          <p className={`text-sm font-medium ${dm ? 'text-amber-300' : 'text-amber-700'}`}>Vui lòng tạo giải đấu trước khi thêm đội bóng.</p>
        </div>
      )}

      {/* Empty state */}
      {activeTournament && teams.length === 0 && (
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${card}`}>
          <Users size={48} className={`mb-4 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-lg font-black mb-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Chưa có đội nào</p>
          <p className={`text-sm mb-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Bắt đầu thêm đội bóng vào giải đấu</p>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-all">
            <Plus size={15} className="inline mr-1.5" /> Thêm Đội Đầu Tiên
          </button>
        </div>
      )}

      {/* Team grid */}
      {teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {teams.map(team => (
            <div key={team.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group relative ${card}`}
              style={{ borderTopColor: team.color || '#10b981', borderTopWidth: 3 }}>
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => openEdit(team)}
                  className="w-7 h-7 rounded-lg bg-blue-500/90 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Edit3 size={12} className="text-white" />
                </button>
                <button onClick={() => onDeleteTeam(team.id)}
                  className="w-7 h-7 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>

              <div className="p-4 flex flex-col items-center text-center gap-2">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-2xl" style={{ background: `${team.color}22` }}>
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <span style={{ display: team.logo ? 'none' : 'flex' }} className="text-3xl">⚽</span>
                </div>
                <div>
                  <p className={`text-sm font-black leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{team.name}</p>
                  {team.abbr && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: team.color || '#10b981' }}>
                      {team.abbr}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL (fixed overlay) ── */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${dm ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            style={{ animation: 'dropdownIn .2s ease-out both' }}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
                {editingTeam ? 'Chỉnh Sửa Đội' : 'Thêm Đội Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Logo preview */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl shrink-0" style={{ background: `${form.color}22` }}>
                {form.logo && !imgError
                  ? <img src={form.logo} alt="" className="w-full h-full object-contain" onError={() => setImgError(true)} />
                  : <span>⚽</span>}
              </div>
              <div className="flex-1">
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${labelCls}`}>URL Logo</label>
                <input value={form.logo} placeholder="https://..."
                  onChange={e => { setForm(p => ({ ...p, logo: e.target.value })); setImgError(false); }}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${input}`} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${labelCls}`}>Tên Đội *</label>
              <input value={form.name} placeholder="VD: Manchester City"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${input}`} />
            </div>

            {/* Abbr */}
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${labelCls}`}>Viết Tắt</label>
              <input value={form.abbr} placeholder="VD: MCI" maxLength={4}
                onChange={e => setForm(p => ({ ...p, abbr: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${input}`} />
            </div>

            {/* Color */}
            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${labelCls}`}>Màu Đội</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${dm ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Hủy
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex items-center justify-center gap-2 transition-all">
                <Save size={15} /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeamManager;
