import React, { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, Loader2, Check, X, Pencil, FileSpreadsheet, Save } from 'lucide-react';
import { registrationApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// DANH SACH DANG KY (chi Admin/BTC)
// - Hien FullName (KHONG email)
// - Duyet / Xoa / Sua ten
// - Xuat Excel (CSV) danh sach nguoi da dang ky
// - KHONG con nut chia doi (chia doi chuyen sang phan chia bang)
// Props: tournamentId, tournamentName, darkMode
// ─────────────────────────────────────────────────────────────
export default function RegistrationList({ tournamentId, tournamentName = 'Giai dau', darkMode }) {
  const dm = darkMode;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);   // dang sua ten dong nao
  const [editName, setEditName] = useState('');

  const fetchList = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await registrationApi.list(tournamentId);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr('Khong tai duoc danh sach dang ky.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };

  // Duyet
  const handleApprove = async (id) => {
    setBusyId(id);
    try { await registrationApi.approve(id); flash('Da duyet.'); await fetchList(); }
    catch { flash('Loi khi duyet.'); }
    finally { setBusyId(null); }
  };

  // Xoa (tu choi)
  const handleReject = async (id) => {
    if (!window.confirm('Xoa nguoi nay khoi danh sach dang ky?')) return;
    setBusyId(id);
    try { await registrationApi.reject(id); flash('Da xoa.'); await fetchList(); }
    catch { flash('Loi khi xoa.'); }
    finally { setBusyId(null); }
  };

  // Bat dau sua ten
  const startEdit = (r) => { setEditingId(r.id); setEditName(r.userName || ''); };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };

  // Luu ten moi
  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setBusyId(id);
    try {
      await registrationApi.editName(id, editName.trim());
      flash('Da sua ten.');
      setEditingId(null);
      await fetchList();
    } catch { flash('Loi khi sua ten.'); }
    finally { setBusyId(null); }
  };

  // Xuat Excel (dang CSV mo duoc bang Excel) - danh sach nguoi da dang ky
  const exportExcel = () => {
    if (list.length === 0) { flash('Chua co ai dang ky.'); return; }
    // CSV: STT, Ten, Trang thai
    const rows = [['STT', 'Ho Ten', 'Trang Thai']];
    list.forEach((r, i) => {
      const status = r.status === 'Assigned' ? 'Da chia doi'
        : r.status === 'Approved' ? 'Da duyet' : 'Cho duyet';
      rows.push([i + 1, r.userName || '', status]);
    });
    // Them BOM \uFEFF de Excel doc dung tieng Viet
    const csv = '\uFEFF' + rows.map(r =>
      r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DangKy_${tournamentName.replace(/[^\w]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flash('Da xuat file Excel (CSV).');
  };

  return (
    <div className={`rounded-2xl border-2 p-5 space-y-4 ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`}>
      {/* Tieu de + lam moi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-cyan-400" />
          <h2 className={`text-sm font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>Danh Sach Dang Ky</h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dm ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>{list.length}</span>
        </div>
        <button onClick={fetchList} disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Lam moi
        </button>
      </div>

      {msg && (
        <div className={`text-xs font-medium px-3 py-2 rounded-lg ${dm ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>{msg}</div>
      )}

      {/* Nut XUAT EXCEL (chi hien khi co nguoi) */}
      {list.length > 0 && (
        <button onClick={exportExcel}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm transition-all active:scale-[0.98]">
          <FileSpreadsheet size={15} />
          In Danh Sach (Excel)
        </button>
      )}

      {err && <p className="text-xs text-red-400">{err}</p>}

      {loading && list.length === 0 && (
        <div className={`flex items-center justify-center gap-2 py-6 text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          <Loader2 size={16} className="animate-spin" /> Dang tai...
        </div>
      )}

      {!loading && list.length === 0 && !err && (
        <div className={`flex flex-col items-center justify-center gap-2 py-8 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
          <Users size={32} className="opacity-40" />
          <p className="text-sm font-medium">Chua co ai dang ky</p>
        </div>
      )}

      {/* Danh sach */}
      {list.length > 0 && (
        <div className="space-y-2">
          {list.map((r, idx) => (
            <div key={r.id ?? idx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dm ? 'bg-white/5' : 'bg-slate-50'}`}>
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</span>

              {/* Ten: xem hoac dang sua */}
              {editingId === r.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className={`flex-1 min-w-0 px-2 py-1 rounded-lg text-sm font-medium outline-none ${dm ? 'bg-slate-800 text-white border border-cyan-500/40' : 'bg-white text-gray-800 border border-cyan-400'}`}
                />
              ) : (
                <span className={`flex-1 text-sm font-bold truncate ${dm ? 'text-white/90' : 'text-gray-800'}`}>{r.userName || 'Nguoi dung'}</span>
              )}

              {/* Trang thai badge (khi khong sua) */}
              {editingId !== r.id && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  r.status === 'Assigned' ? 'bg-emerald-500/15 text-emerald-400'
                  : r.status === 'Approved' ? 'bg-cyan-500/15 text-cyan-400'
                  : dm ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'
                }`}>
                  {r.status === 'Assigned' ? 'Da chia doi' : r.status === 'Approved' ? 'Da duyet' : 'Cho'}
                </span>
              )}

              {/* Nut hanh dong */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {editingId === r.id ? (
                  <>
                    <button onClick={() => saveEdit(r.id)} disabled={busyId === r.id}
                      className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50">
                      {busyId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    </button>
                    <button onClick={cancelEdit}
                      className="p-1.5 rounded-lg bg-slate-500/15 text-slate-400 hover:bg-slate-500/25">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Duyet (neu chua duyet & chua chia doi) */}
                    {r.status !== 'Approved' && r.status !== 'Assigned' && (
                      <button onClick={() => handleApprove(r.id)} disabled={busyId === r.id} title="Duyet"
                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50">
                        {busyId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                    )}
                    {/* Sua ten (hien khi da duyet, theo yeu cau) */}
                    <button onClick={() => startEdit(r)} title="Sua ten"
                      className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25">
                      <Pencil size={12} />
                    </button>
                    {/* Xoa */}
                    <button onClick={() => handleReject(r.id)} disabled={busyId === r.id} title="Xoa"
                      className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50">
                      {busyId === r.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}