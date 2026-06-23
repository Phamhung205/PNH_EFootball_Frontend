import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Save, Upload, Loader2, Download, Search, Check } from 'lucide-react';
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

  // ─── Thu vien doi (tai doi tu giai khac) ───
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [libFilterTour, setLibFilterTour] = useState('all'); // loc theo giai goc
  const [libSelected, setLibSelected] = useState({});         // { name: {name,logo} }
  const [libImporting, setLibImporting] = useState(false);

  const openLibrary = async () => {
    setShowLibrary(true);
    setLibSearch(''); setLibFilterTour('all'); setLibSelected({});
    setLibLoading(true);
    try {
      const data = await teamApi.getLibrary(tournamentId);
      setLibrary(Array.isArray(data) ? data : []);
    } catch (e) {
      setLibrary([]);
    } finally {
      setLibLoading(false);
    }
  };

  // Toggle chon 1 doi
  const toggleLibTeam = (item) => {
    setLibSelected(prev => {
      const next = { ...prev };
      const key = (item.name || '').toLowerCase();
      if (next[key]) delete next[key];
      else next[key] = { name: item.name };
      return next;
    });
  };

  // Chon ca cum doi cua 1 giai
  const selectAllFromTournament = (tourId) => {
    setLibSelected(prev => {
      const next = { ...prev };
      library.forEach(item => {
        const inTour = (item.tournaments || []).some(t => String(t.id) === String(tourId));
        if (inTour) next[(item.name || '').toLowerCase()] = { name: item.name, logo: item.logoUrl };
      });
      return next;
    });
  };

  // Them cac doi da chon vao giai hien tai
  const importSelected = async () => {
    const picks = Object.values(libSelected);
    if (!picks.length) { setShowLibrary(false); return; }
    setLibImporting(true);
    try {
      // Bo qua doi da co trong giai (trung ten)
      const existing = new Set(teams.map(t => (t.name || '').toLowerCase()));
      const toAdd = picks.filter(p => !existing.has((p.name || '').toLowerCase()));

      // Lay logo cho cac doi duoc chon (thu vien khong kem logo de tai nhanh)
      let logoMap = {};
      try {
        logoMap = await teamApi.getLogos(toAdd.map(p => p.name));
      } catch { logoMap = {}; }

      for (const p of toAdd) {
        const key = (p.name || '').trim().toLowerCase();
        const logo = logoMap[key] || p.logo || '';
        await teamApi.create(tournamentId, { name: p.name, logo });
      }
      setShowLibrary(false);
      await reload();
    } catch (e) {
      alert('Lỗi khi thêm đội: ' + (e.message || ''));
    } finally {
      setLibImporting(false);
    }
  };

  // Danh sach giai goc (de loc) tu library
  const allTournaments = (() => {
    const map = {};
    library.forEach(item => (item.tournaments || []).forEach(t => { if (t.id) map[t.id] = t.name; }));
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  })();

  // Loc library theo search + giai
  const filteredLibrary = library.filter(item => {
    const matchSearch = !libSearch.trim() || (item.name || '').toLowerCase().includes(libSearch.trim().toLowerCase());
    const matchTour = libFilterTour === 'all' || (item.tournaments || []).some(t => String(t.id) === String(libFilterTour));
    return matchSearch && matchTour;
  });
  const selectedCount = Object.keys(libSelected).length;

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
          <div className="flex items-center gap-2">
            <button onClick={openLibrary} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' : 'border-cyan-400 text-cyan-600 hover:bg-cyan-50'}`}>
              <Download size={16} /> Tải đội về
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              <Plus size={16} /> Thêm Đội
            </button>
          </div>
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

      {/* ─── POPUP: Thu vien doi (tai doi tu giai khac) ─── */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLibrary(false)}>
          <div className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border flex flex-col ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
            {/* Header popup */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                  <Download size={18} className="text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Thư Viện Đội</h2>
                  <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Chọn đội từ các giải đã tạo để thêm nhanh</p>
                </div>
              </div>
              <button onClick={() => setShowLibrary(false)} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={18} /></button>
            </div>

            {/* Thanh tim kiem + loc giai */}
            <div className={`px-5 py-3 border-b flex flex-col sm:flex-row gap-2 ${dm ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <div className="relative flex-1">
                <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Tìm tên đội..."
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border ${dm ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-400'}`} />
              </div>
              {allTournaments.length > 0 && (
                <select value={libFilterTour} onChange={e => setLibFilterTour(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm outline-none border ${dm ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-400'}`}>
                  <option value="all">Tất cả giải</option>
                  {allTournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            {/* Nut chon ca cum (khi da loc 1 giai) */}
            {libFilterTour !== 'all' && (
              <div className={`px-5 py-2 border-b ${dm ? 'border-slate-700/50' : 'border-slate-100'}`}>
                <button onClick={() => selectAllFromTournament(libFilterTour)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300">+ Chọn tất cả đội của giải này</button>
              </div>
            )}

            {/* Danh sach doi */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {libLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-cyan-400" /></div>
              ) : filteredLibrary.length === 0 ? (
                <div className={`text-center py-12 text-sm ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                  {library.length === 0 ? 'Chưa có đội nào trong các giải khác.' : 'Không tìm thấy đội phù hợp.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLibrary.map((item, i) => {
                    const key = (item.name || '').toLowerCase();
                    const picked = !!libSelected[key];
                    const alreadyIn = teams.some(t => (t.name || '').toLowerCase() === key);
                    return (
                      <button key={i} onClick={() => !alreadyIn && toggleLibTeam(item)} disabled={alreadyIn}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          alreadyIn ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-800/30'
                          : picked ? 'border-cyan-400 bg-cyan-500/15'
                          : dm ? 'border-slate-700 bg-slate-800/40 hover:border-slate-600' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                        <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden text-base">
                          {item.hasLogo ? '🛡️' : '⚽'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{item.name}</div>
                          <div className={`text-[10px] truncate ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                            {alreadyIn ? 'Đã có trong giải' : `Có trong ${item.count} giải`}
                          </div>
                        </div>
                        {picked && !alreadyIn && (
                          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                            <Check size={13} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer popup */}
            <div className={`flex items-center justify-between gap-3 px-5 py-4 border-t ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`text-sm font-bold ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                Đã chọn {selectedCount} đội
              </span>
              <div className="flex gap-2">
                <button onClick={() => setShowLibrary(false)} className={`px-4 py-2 rounded-xl text-sm font-bold border ${dm ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>Hủy</button>
                <button onClick={importSelected} disabled={libImporting || selectedCount === 0}
                  className="px-5 py-2 rounded-xl text-sm font-black bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all">
                  {libImporting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Thêm {selectedCount > 0 ? `(${selectedCount})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;