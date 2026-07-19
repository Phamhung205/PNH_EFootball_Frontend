import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Save, Upload, Loader2, Download, Search, Check, Zap, ClipboardList, AlertCircle } from 'lucide-react';
import { teamApi } from '../../services/api';

const TeamManager = ({ tournament, darkMode, language, isAdmin, onUpdate, onReload }) => {
  const tr = (vi, en) => (language === 'en' ? en : vi);
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
  const [compressing, setCompressing] = useState(false);     // dang nen logo cu
  const [compressMsg, setCompressMsg] = useState('');         // tien trinh nen

  // ─── Thu vien doi (tai doi tu giai khac) ───
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [libFilterTour, setLibFilterTour] = useState('all'); // loc theo giai goc
  const [libSelected, setLibSelected] = useState({});         // { name: {name,logo} }
  const [libImporting, setLibImporting] = useState(false);

  // ── NHAP NHIEU DOI CUNG LUC ──
  const [showBulk, setShowBulk] = useState(false);
  const [bulkMode, setBulkMode] = useState('file');    // 'file' = tu file nen/anh, 'text' = go tay
  const [bulkText, setBulkText] = useState('');
  const [bulkItems, setBulkItems] = useState([]);       // [{ name, logoUrl }] danh sach cuoi cung
  const [bulkReading, setBulkReading] = useState('');   // tien trinh doc file
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkErr, setBulkErr] = useState('');
  const [bulkDone, setBulkDone] = useState('');

  // Ten file -> ten doi: bo duong dan, bo duoi anh, bo so thu tu dau (vd "01-Doi A.png")
  const fileNameToTeamName = (path) => {
    const base = String(path).split('/').pop().split('\\').pop();
    return base
      .replace(/\.(png|jpe?g|gif|webp|svg|bmp)$/i, '')
      .replace(/^\s*\d+\s*[-_.)]\s*/, '')
      .trim();
  };

  const isImageName = (n) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(n);

  // Thu nho logo ve toi da 128px -> base64 PNG (giu nen trong suot)
  const shrinkToBase64 = (blob) => new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const MAX = 128;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });

  // Gop danh sach + loai trung (voi doi da co va trong chinh danh sach)
  const mergeItems = (list) => {
    const existing = new Set(teams.map(t => (t.name || '').trim().toLowerCase()));
    const seen = new Set();
    const out = [];
    list.forEach(it => {
      const name = (it.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (existing.has(key) || seen.has(key)) return;
      seen.add(key);
      out.push({ name, logoUrl: it.logoUrl || null });
    });
    return out;
  };

  // Chon NHIEU FILE ANH (khong can thu vien ngoai)
  const handlePickImages = async (ev) => {
    const files = Array.from(ev.target.files || []);
    ev.target.value = '';
    if (!files.length) return;
    setBulkErr(''); setBulkDone('');
    const imgs = files.filter(f => f.type.startsWith('image/'));
    if (!imgs.length) { setBulkErr(tr('Không có file ảnh nào.', 'No image files found.')); return; }
    const out = [];
    for (let i = 0; i < imgs.length; i++) {
      setBulkReading(tr(`Đang đọc ${i + 1}/${imgs.length}...`, `Reading ${i + 1}/${imgs.length}...`));
      out.push({ name: fileNameToTeamName(imgs[i].name), logoUrl: await shrinkToBase64(imgs[i]) });
    }
    setBulkReading('');
    setBulkItems(mergeItems(out));
  };

  // Chon FILE NEN .zip (can thu vien jszip)
  const handlePickZip = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setBulkErr(''); setBulkDone(''); setBulkReading(tr('Đang mở file nén...', 'Opening archive...'));

    let JSZip;
    try {
      // @vite-ignore: Vite KHONG kiem tra luc build -> chua cai jszip van chay duoc.
      // Neu chua cai, loi roi vao catch ben duoi va hien huong dan cho nguoi dung.
      const mod = await import(/* @vite-ignore */ 'jszip');
      JSZip = mod.default || mod;
    } catch {
      setBulkReading('');
      setBulkErr(tr('Chưa cài thư viện giải nén. Mở terminal chạy: npm install jszip — hoặc dùng nút "Chọn nhiều ảnh".',
                    'Zip library not installed. Run: npm install jszip — or use "Select images" instead.'));
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files)
        .filter(e => !e.dir && isImageName(e.name) && !e.name.startsWith('__MACOSX'));
      if (!entries.length) {
        setBulkReading('');
        setBulkErr(tr('File nén không có ảnh nào.', 'The archive contains no images.'));
        return;
      }
      const out = [];
      for (let i = 0; i < entries.length; i++) {
        setBulkReading(tr(`Đang đọc ${i + 1}/${entries.length}...`, `Reading ${i + 1}/${entries.length}...`));
        const blob = await entries[i].async('blob');
        out.push({ name: fileNameToTeamName(entries[i].name), logoUrl: await shrinkToBase64(blob) });
      }
      setBulkReading('');
      setBulkItems(mergeItems(out));
    } catch {
      setBulkReading('');
      setBulkErr(tr('Không đọc được file nén này.', 'Could not read this archive.'));
    }
  };

  const removeBulkItem = (idx) => setBulkItems(prev => prev.filter((_, i) => i !== idx));

  // Che do go tay: moi dong 1 ten
  const applyBulkText = (text) => {
    setBulkText(text);
    setBulkErr('');
    setBulkItems(mergeItems((text || '').split('\n').map(n => ({ name: n }))));
  };

  const openBulk = () => {
    setBulkMode('file'); setBulkText(''); setBulkItems([]);
    setBulkErr(''); setBulkDone(''); setBulkReading(''); setShowBulk(true);
  };

  const handleBulkSubmit = async () => {
    if (bulkItems.length === 0) {
      setBulkErr(tr('Chưa có đội nào để thêm.', 'No teams to add yet.'));
      return;
    }
    if (bulkItems.length > 200) {
      setBulkErr(tr('Tối đa 200 đội mỗi lần nhập.', 'Maximum 200 teams per import.'));
      return;
    }
    setBulkSaving(true); setBulkErr(''); setBulkDone('');
    try {
      const res = await teamApi.createBulk(tournamentId, bulkItems);
      const added = res?.added ?? bulkItems.length;
      const skipped = res?.skipped ?? 0;
      setBulkDone(
        tr(`Đã thêm ${added} đội.`, `Added ${added} teams.`) +
        (skipped > 0 ? ' ' + tr(`Bỏ qua ${skipped} đội trùng.`, `Skipped ${skipped} duplicates.`) : '')
      );
      setBulkItems([]); setBulkText('');
      if (onReload) await onReload();
      setTimeout(() => setShowBulk(false), 1400);
    } catch (e) {
      if (e?.code === 'PLAN_LIMIT_TEAMS') {
        setBulkErr((e.message || '') + ' ' + tr('Vào Tài khoản → Gói Đăng Ký để nâng cấp.','Go to Account → Subscription to upgrade.'));
      } else {
        setBulkErr(e.message || tr('Lỗi khi nhập đội.', 'Error importing teams.'));
      }
    } finally {
      setBulkSaving(false);
    }
  };

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
      // Tao TAT CA doi trong 1 request (nhanh + on dinh, tu lay logo o backend)
      const names = picks.map(p => p.name).filter(Boolean);
      await teamApi.createBulk(tournamentId, names);
      // Thanh cong -> dong popup + xoa lua chon ngay
      setShowLibrary(false);
      setLibSelected({});
      // Tai lai danh sach (neu loi cung khong sao, du lieu da vao DB)
      try { await reload(); } catch { /* F5 se thay */ }

      // NEN NGAM logo cac doi vua them neu con lon (de lan sau vao nhanh)
      // Chay nen, khong chan UI - chi lam khi co the
      setTimeout(() => { autoCompressHeavy(); }, 500);
    } catch (e) {
      alert(tr('Lỗi khi thêm đội: ','Error adding team: ') + (e.message || tr('Thử lại sau','Please try again later')));
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
    if (!tournamentId) { setErr(tr('Chưa có giải đấu.','No tournament yet.')); return; }
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
      // Cham gioi han so doi cua goi -> goi y dang ky goi
      if (e?.code === 'PLAN_LIMIT_TEAMS') {
        setErr((e.message || '') + ' ' + tr('Vào Tài khoản → Gói Đăng Ký để nâng cấp.','Go to Account → Subscription to upgrade.'));
      } else {
        setErr(e.message || tr('Lỗi lưu đội.','Error saving team.'));
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm(tr('Xóa đội này?','Delete this team?'))) return;
    try {
      await teamApi.remove(id);
      await reload();
    } catch (e) {
      alert(tr('Lỗi xóa: ','Delete error: ') + e.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // NEN logo: resize ve toi da 128x128px (vua khung hien thi), giam dung luong
      const img = new Image();
      img.onload = () => {
        const MAX = 128; // kich thuoc toi da (px) - vua dep voi khung logo
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // Xuat PNG nen (giu trong suot). Neu anh khong trong suot, dung JPEG nhe hon.
        const compressed = canvas.toDataURL('image/png');
        setForm(p => ({ ...p, logo: compressed }));
        setImgErr(false);
      };
      img.onerror = () => { setForm(p => ({ ...p, logo: reader.result })); setImgErr(false); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Nen 1 anh base64/url ve toi da 128px, tra ve base64 PNG nho gon
  const compressImage = (src) => new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const MAX = 128;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    } catch { resolve(null); }
  });

  // Nen TAT CA logo cu cua giai (base64 lon) -> nho gon -> luu lai. Chay 1 lan.
  const compressAllLogos = async () => {
    const heavy = teams.filter(t => t.logo && t.logo.startsWith('data:'));
    if (heavy.length === 0) { alert('Không có logo base64 nào để nén.'); return; }
    if (!window.confirm(`Sẽ nén ${heavy.length} logo để web nhanh hơn. Tiếp tục?`)) return;
    setCompressing(true);
    let done = 0, saved = 0;
    try {
      for (const t of heavy) {
        setCompressMsg(tr(`Đang nén ${done + 1}/${heavy.length}...`, `Compressing ${done + 1}/${heavy.length}...`));
        const small = await compressImage(t.logo);
        // Chi luu neu nen duoc nho hon (tranh ghi de vo ich)
        if (small && small.length < t.logo.length) {
          try { await teamApi.update(t.id, { name: t.name, logo: small }); saved++; } catch { /* skip */ }
        }
        done++;
      }
      setCompressMsg(tr('Xong! Đang tải lại...','Done! Reloading...'));
      await reload();
      alert(`Đã nén ${saved}/${heavy.length} logo. Web sẽ nhanh hơn!`);
    } catch (e) {
      alert('Lỗi khi nén: ' + (e.message || ''));
    } finally {
      setCompressing(false);
      setCompressMsg('');
    }
  };

  // Nen NGAM logo lon (chay im lang, khong popup) - goi sau import
  const autoCompressHeavy = async () => {
    if (compressing) return;
    const heavy = teams.filter(t => t.logo && t.logo.startsWith('data:') && t.logo.length > 6000);
    if (heavy.length === 0) return;
    for (const t of heavy) {
      const small = await compressImage(t.logo);
      if (small && small.length < t.logo.length) {
        try { await teamApi.update(t.id, { name: t.name, logo: small }); } catch { /* skip */ }
      }
    }
    try { await reload(); } catch { /* skip */ }
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
            <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Quản Lý Đội Bóng','Team Management')}</h1>
            <p className={`text-sm ${dim}`}>{teams.length} {tr('đội trong giải đấu này','teams in this tournament')}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {teams.some(t => t.logo && t.logo.startsWith('data:')) && (
              <button onClick={compressAllLogos} disabled={compressing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-50 ${dm ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' : 'border-amber-400 text-amber-600 hover:bg-amber-50'}`}>
                {compressing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {compressing ? (compressMsg || tr('Đang nén...','Compressing...')) : tr('Nén logo (tăng tốc)','Compress logos (speed up)')}
              </button>
            )}
            <button onClick={openLibrary} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' : 'border-cyan-400 text-cyan-600 hover:bg-cyan-50'}`}>
              <Download size={16} /> {tr('Tải đội về','Download teams')}
            </button>
            <button onClick={openBulk} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${dm ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'}`}>
              <ClipboardList size={16} /> {tr('Nhập Nhiều Đội','Bulk Import')}
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              <Plus size={16} /> {tr('Thêm Đội','Add Team')}
            </button>
          </div>
        )}
      </div>

      {teams.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center ${card}`}>
          <Users size={48} className={`mx-auto mb-4 ${dim}`} />
          <p className={`text-lg font-black mb-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{tr('Chưa có đội nào','No teams yet')}</p>
          {isAdmin && <button onClick={openAdd} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold hover:opacity-90 transition-all"><Plus size={14} className="inline mr-1.5" />{tr('Thêm Đội Đầu Tiên','Add First Team')}</button>}
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
              <h2 className="text-base font-black text-white">{editing ? tr('Chỉnh Sửa Đội','Edit Team') : tr('Thêm Đội Mới','Add New Team')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={17} /></button>
            </div>

            {err && (
              <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{err}</div>
            )}

            {/* Logo */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">{tr('Logo Đội Bóng','Team Logo')}</label>
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
                      placeholder={tr("https://... hoặc 🦅","https://... or 🦅")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  ) : (
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black cursor-pointer transition-all">
                      <Upload size={13} className="text-emerald-400" /><span>{tr('Chọn file ảnh','Choose image file')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Tên đội */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">{tr('Tên Đội *','Team Name *')}</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder={tr("VD: Đội Bóng A...","e.g. Team A...")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 transition-all active:scale-95">{tr('Hủy','Cancel')}</button>
              <button type="button" onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}{tr('Lưu','Save')}
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
                  <h2 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Thư Viện Đội','Team Library')}</h2>
                  <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{tr('Chọn đội từ các giải đã tạo để thêm nhanh','Pick teams from your other tournaments to add quickly')}</p>
                </div>
              </div>
              <button onClick={() => setShowLibrary(false)} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={18} /></button>
            </div>

            {/* Thanh tim kiem + loc giai */}
            <div className={`px-5 py-3 border-b flex flex-col sm:flex-row gap-2 ${dm ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <div className="relative flex-1">
                <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder={tr("Tìm tên đội...","Search team name...")}
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border ${dm ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-400'}`} />
              </div>
              {allTournaments.length > 0 && (
                <select value={libFilterTour} onChange={e => setLibFilterTour(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm outline-none border ${dm ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-400'}`}>
                  <option value="all">{tr('Tất cả giải','All tournaments')}</option>
                  {allTournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            {/* Nut chon ca cum (khi da loc 1 giai) */}
            {libFilterTour !== 'all' && (
              <div className={`px-5 py-2 border-b ${dm ? 'border-slate-700/50' : 'border-slate-100'}`}>
                <button onClick={() => selectAllFromTournament(libFilterTour)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300">{tr('+ Chọn tất cả đội của giải này','+ Select all teams from this tournament')}</button>
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
                <button onClick={() => setShowLibrary(false)} className={`px-4 py-2 rounded-xl text-sm font-bold border ${dm ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>{tr('Hủy','Cancel')}</button>
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
      {/* ── MODAL: NHAP NHIEU DOI (tu file nen / nhieu anh / go tay) ── */}
      {showBulk && (
        <div className="fixed inset-0 z-45 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl p-6 bg-slate-900 text-white space-y-4 animate-[dropdownIn_0.2s_ease-out_both] max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black flex items-center gap-2">
                <ClipboardList size={17} className="text-emerald-400" />
                {tr('Nhập Nhiều Đội Cùng Lúc','Bulk Import Teams')}
              </h2>
              <button onClick={() => setShowBulk(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={17} /></button>
            </div>

            {/* Chon cach nhap */}
            <div className="flex p-1 rounded-xl bg-black/30 border border-white/10">
              <button onClick={() => setBulkMode('file')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${bulkMode === 'file' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white/80'}`}>
                {tr('Từ File (có logo)','From File (with logos)')}
              </button>
              <button onClick={() => setBulkMode('text')}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${bulkMode === 'text' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white/80'}`}>
                {tr('Gõ Tay (chỉ tên)','Type (names only)')}
              </button>
            </div>

            {bulkMode === 'file' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  {tr('Tên file ảnh sẽ thành tên đội. VD: "Đội Sấm Sét.png" → đội "Đội Sấm Sét".',
                      'Each image file name becomes the team name. E.g. "Thunder FC.png" → team "Thunder FC".')}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/5 cursor-pointer transition-all">
                    <Upload size={20} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">{tr('File nén (.zip)','Archive (.zip)')}</span>
                    <input type="file" accept=".zip,application/zip" className="hidden" onChange={handlePickZip} />
                  </label>
                  <label className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/5 cursor-pointer transition-all">
                    <Upload size={20} className="text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300">{tr('Chọn nhiều ảnh','Select images')}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} />
                  </label>
                </div>

                {bulkReading && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    <Loader2 size={13} className="animate-spin" />{bulkReading}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  {tr('Mỗi dòng một tên đội. Dán trực tiếp từ Excel hoặc Word đều được.','One team name per line. You can paste from Excel or Word.')}
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => applyBulkText(e.target.value)}
                  rows={7} spellCheck={false}
                  placeholder={tr('Đội A\nĐội B\nĐội C','Team A\nTeam B\nTeam C')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-emerald-500 transition-colors resize-none font-mono" />
              </div>
            )}

            {/* Xem truoc danh sach se them */}
            {bulkItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">
                    {bulkItems.length} {tr('đội sẽ được thêm','teams will be added')}
                  </span>
                  <button onClick={() => { setBulkItems([]); setBulkText(''); }}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors">
                    {tr('Xóa hết','Clear all')}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800">
                  {bulkItems.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 px-3 py-2">
                      {it.logoUrl
                        ? <img src={it.logoUrl} alt="" className="w-7 h-7 rounded object-cover shrink-0 bg-slate-800" />
                        : <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-500">—</div>}
                      <span className="flex-1 text-xs font-semibold truncate">{it.name}</span>
                      <button onClick={() => removeBulkItem(idx)}
                        className="p-1 rounded hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkErr && (
              <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" /><span>{bulkErr}</span>
              </div>
            )}
            {bulkDone && (
              <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
                <Check size={13} />{bulkDone}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowBulk(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold hover:bg-white/5 transition-all">
                {tr('Hủy','Cancel')}
              </button>
              <button onClick={handleBulkSubmit} disabled={bulkSaving || bulkItems.length === 0 || !!bulkReading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {bulkSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {bulkSaving ? tr('Đang thêm...','Adding...') : tr('Thêm Tất Cả','Add All')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;