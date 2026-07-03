import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Loader2, Trophy } from 'lucide-react';
import TournamentChat from './TournamentChat';
import { tournamentApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// TRANG CHAT TOAN MAN HINH - mo qua link ?chat={tournamentId}
// Admin gui link nay, user bam vao -> vao thang box chat cua giai
// Props: tournamentId, currentUser, darkMode, onBack
// ─────────────────────────────────────────────────────────────
export default function ChatPage({ tournamentId, currentUser, darkMode = true, onBack }) {
  const dm = darkMode;
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) { setLoading(false); return; }
    let alive = true;
    tournamentApi.getById(tournamentId)
      .then(t => { if (alive) { setTournament(t); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tournamentId]);

  const bg = dm ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 to-blue-50';

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack}
            className={`p-2 rounded-xl transition-all ${dm ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-600 hover:bg-slate-100 shadow'}`}>
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className={`text-lg font-black truncate ${dm ? 'text-white' : 'text-slate-900'}`}>
              {loading ? 'Đang tải...' : (tournament?.name || 'Giải đấu')}
            </h1>
            <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Box chat giải đấu</p>
          </div>
        </div>

        {/* Chua dang nhap */}
        {!currentUser ? (
          <div className={`rounded-2xl border-2 p-8 flex flex-col items-center gap-3 text-center ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`}>
            <Trophy size={36} className="text-amber-400 opacity-60" />
            <p className={`font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>Cần đăng nhập</p>
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Bạn cần đăng nhập và đã đăng ký giải này để vào chat.
            </p>
            <button onClick={onBack}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm">
              Về trang đăng nhập
            </button>
          </div>
        ) : loading ? (
          <div className={`rounded-2xl border-2 p-8 flex items-center justify-center gap-2 ${dm ? 'border-white/10 bg-white/3 text-slate-400' : 'border-gray-200 bg-white text-slate-500'}`}>
            <Loader2 size={18} className="animate-spin" /> Đang tải...
          </div>
        ) : (
          <TournamentChat tournamentId={tournamentId} currentUser={currentUser} darkMode={dm} />
        )}
      </div>
    </div>
  );
}