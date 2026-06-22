import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Save, Upload, Loader2 } from 'lucide-react';
import { teamApi } from '../../services/api';

const TeamManager = ({ tournament, darkMode, language, isAdmin, onUpdate, onReload }) => {
  const dm = darkMode;
  const teams = tournament.teams || [];
  const tournamentId = tournament.id;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', logo: '' });
  const [imgErr, setImgErr] = useState(false);
  const [logoTab, setLogoTab] = useState('url');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const dim = dm ? 'text-slate-400' : 'text-slate-500';

  const reload = async () => {
    if (onReload) await onReload();
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', logo: '' });
    setImgErr(false); setLogoTab('url'); setErr('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, logo: t.logo || '' });
    setImgErr(false);
    setLogoTab(t.logo && t.logo.startsWith('data:') ? 'file' : 'url');
    setErr('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) { setErr('Vui lòng nhập tên đội.'); return; }
    if (!tournamentId) { setErr('Chưa có giải đấu.'); return; }
    setSaving(true); setErr('');
    try {
      if (editing) {
        await teamApi.update(editing.id, { name: form.name.trim(), logo: form.logo });
      } else {
        await teamApi.create(tournamentId, { name: form.name.trim(), logo: form.logo });
      }
      setShowModal(false);
      await reload();
    } catch (e) {
      setErr(e.message || 'Lỗi lưu đội.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Xóa đội này?')) return;
    try {
      await teamApi.remove(id);
      await reload();
    } catch (e) {
      alert('Lỗi xóa: ' + e.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setForm(p => ({ ...p, logo: reader.result })); setImgErr(false); };
    reader.readAsDataURL(file);
  };

  const renderLogo = (logo) => {
    if (!logo) return '⚽';
    if (logo.startsWith('http') || logo.startsWith('data:')) {
      return <img src={logo} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />;
    }
    return logo; // emoji
  };

  return (
    <div className="p-6 space-y-5" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Quản Lý Đội Bóng</h1>
            <p className={`text-sm ${dim}`}>{teams.length} đội trong giải đấu này</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Thêm Đội
          </button>
        )}
      </div>

      {teams.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center ${card}`}>
          <Users size={48} className={`mx-auto mb-4 ${dim}`} />
          <p className={`text-lg font-black mb-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Chưa có đội nào</p>
          {isAdmin && <button onClick={openAdd} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-all"><Plus size={14} className="inline mr-1.5" />Thêm Đội Đầu Tiên</button>}
        </div>
      )}

      {teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {teams.map(team => (
            <div key={team.id} className={`rounded-2xl border overflow-hidden group relative hover:scale-[1.02] transition-all ${card}`} style={{ borderTopColor: '#3b82f6', borderTopWidth: 3 }}>
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => openEdit(team)} className="w-7 h-7 rounded-lg bg-blue-500/90 flex items-center justify-center hover:bg-blue-600 transition-colors"><Edit3 size={12} className="text-white" /></button>
                  <button onClick={() => del(team.id)} className="w-7 h-7 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-600 transition-colors"><Trash2 size={12} className="text-white" /></button>
                </div>
              )}
              <div className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-3xl bg-blue-500/10">
                  {renderLogo(team.logo)}
                </div>
                <p className={`text-sm font-black leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{team.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-45 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-6 bg-slate-900 text-white space-y-5 animate-[dropdownIn_0.2s_ease-out_both]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black text-white">{editing ? 'Chỉnh Sửa Đội' : 'Thêm Đội Mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={17} /></button>
            </div>

            {err && (
              <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{err}</div>
            )}

            {/* Logo */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">Logo Đội Bóng</label>
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-slate-800 bg-white p-1 overflow-hidden">
                  {form.logo
                    ? ((form.logo.startsWith('http') || form.logo.startsWith('data:'))
                        ? <img src={form.logo} alt="" className="w-full h-full object-contain" onError={() => setImgErr(true)} />
                        : <span className="text-2xl">{form.logo}</span>)
                    : <span className="text-slate-800 text-2xl font-black">⚽</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button type="button" onClick={() => setLogoTab('url')} className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${logoTab === 'url' ? 'bg-slate-800 text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'}`}>URL / Emoji</button>
                    <button type="button" onClick={() => setLogoTab('file')} className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${logoTab === 'file' ? 'bg-slate-800 text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'}`}>Upload File</button>
                  </div>
                  {logoTab === 'url' ? (
                    <input type="text" value={form.logo} onChange={e => { setForm(p => ({ ...p, logo: e.target.value })); setImgErr(false); }}
                      placeholder="https://... hoặc 🦅"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  ) : (
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black cursor-pointer transition-all">
                      <Upload size={13} className="text-emerald-400" /><span>Chọn file ảnh</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Tên đội */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Tên Đội *</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="VD: Manchester United FC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 transition-all active:scale-95">Hủy</button>
              <button type="button" onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;