import React, { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, Loader2, UserCheck, Clock } from 'lucide-react';
import { registrationApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// DANH SACH NGUOI DA DANG KY GIAI (chi Admin/BTC xem)
// - Hien FullName (KHONG hien email - bao mat)
// - Hien trang thai: Da dang ky / Da duoc chia doi
// - Nut lam moi
// Props: tournamentId, darkMode
// ─────────────────────────────────────────────────────────────
export default function RegistrationList({ tournamentId, darkMode }) {
  const dm = darkMode;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetchList = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await registrationApi.list(tournamentId);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr('Không tải được danh sách đăng ký.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className={`rounded-2xl border-2 p-5 space-y-4 ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`}>
      {/* Tieu de + nut lam moi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-cyan-400" />
          <h2 className={`text-sm font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>
            Danh Sách Đăng Ký
          </h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dm ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
            {list.length}
          </span>
        </div>
        <button onClick={fetchList} disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Làm mới
        </button>
      </div>

      {/* Loi */}
      {err && <p className="text-xs text-red-400">{err}</p>}

      {/* Dang tai */}
      {loading && list.length === 0 && (
        <div className={`flex items-center justify-center gap-2 py-6 text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          <Loader2 size={16} className="animate-spin" /> Đang tải...
        </div>
      )}

      {/* Trong */}
      {!loading && list.length === 0 && !err && (
        <div className={`flex flex-col items-center justify-center gap-2 py-8 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
          <Users size={32} className="opacity-40" />
          <p className="text-sm font-medium">Chưa có ai đăng ký</p>
        </div>
      )}

      {/* Danh sach */}
      {list.length > 0 && (
        <div className="space-y-2">
          {list.map((r, idx) => (
            <div key={r.id ?? idx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dm ? 'bg-white/5' : 'bg-slate-50'}`}>
              {/* So thu tu */}
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                {idx + 1}
              </span>
              {/* Ten (KHONG email) */}
              <span className={`flex-1 text-sm font-bold truncate ${dm ? 'text-white/90' : 'text-gray-800'}`}>
                {r.userName || 'Người dùng'}
              </span>
              {/* Trang thai */}
              {r.status === 'Assigned' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <UserCheck size={13} /> {r.teamName || 'Đã chia đội'}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${dm ? 'text-amber-400/80' : 'text-amber-600'}`}>
                  <Clock size={13} /> Đã đăng ký
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}