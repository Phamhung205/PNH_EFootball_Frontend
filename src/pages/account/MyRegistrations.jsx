import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Trophy, UserCheck, Clock, Check } from 'lucide-react';
import { registrationApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// TRANG USER: Cac giai minh da dang ky
// Hien ten giai, trang thai (cho/da duyet/da chia doi), ten doi neu co
// ─────────────────────────────────────────────────────────────
export default function MyRegistrations({ darkMode = true }) {
  const dm = darkMode;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await registrationApi.my();
        if (alive) setList(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setErr('Không tải được danh sách.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Nhan trang thai -> badge
  const statusBadge = (status, teamName) => {
    if (status === 'Assigned') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <UserCheck size={12} /> {teamName || 'Đã chia đội'}
        </span>
      );
    }
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Check size={12} /> Đã duyệt
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${dm ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
        <Clock size={12} /> Chờ duyệt
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Tieu de */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <ClipboardList size={22} className="text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Giải Đã Đăng Ký</h1>
          <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Các giải đấu bạn đã đăng ký tham dự</p>
        </div>
      </div>

      {err && <p className="text-sm text-red-400 mb-4">{err}</p>}

      {/* Dang tai */}
      {loading && (
        <div className={`flex items-center justify-center gap-2 py-12 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          <Loader2 size={18} className="animate-spin" /> Đang tải...
        </div>
      )}

      {/* Trong */}
      {!loading && list.length === 0 && !err && (
        <div className={`flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed ${dm ? 'border-white/10 text-slate-500' : 'border-gray-200 text-slate-400'}`}>
          <Trophy size={40} className="opacity-40" />
          <p className="text-sm font-medium">Bạn chưa đăng ký giải nào</p>
          <p className="text-xs opacity-70">Vào một giải đang mở đăng ký để tham dự</p>
        </div>
      )}

      {/* Danh sach giai */}
      {list.length > 0 && (
        <div className="space-y-3">
          {list.map((r, idx) => (
            <div key={r.id ?? idx}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${dm ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dm ? 'bg-white/5' : 'bg-slate-100'}`}>
                <Trophy size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${dm ? 'text-white' : 'text-slate-800'}`}>
                  {r.tournamentName || 'Giải đấu'}
                </p>
                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                  Đăng ký: {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
              {statusBadge(r.status, r.teamName)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}