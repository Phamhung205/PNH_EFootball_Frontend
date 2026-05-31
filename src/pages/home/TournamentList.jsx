import React, { useState } from 'react';
import { Trophy, Plus, Users, Calendar, ArrowRight, Search, Filter, Clock, CheckCircle2, Play } from 'lucide-react';
import { FormatBadge, StatusBadge } from '../TournamentWorkspace';

/* ════════════════════════════════════════════════════════════
   TOURNAMENT LIST — Card grid of all tournaments
════════════════════════════════════════════════════════════ */
const TournamentList = ({ tournaments, darkMode, language, onEnter, onCreateNew, user }) => {
  const dm = darkMode;
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = tournaments.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const card = dm
    ? 'bg-white/4 border-white/8 hover:bg-white/7 hover:border-emerald-500/20'
    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xl';

  const dim = dm ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-black ${dm?'text-white':'text-slate-900'}`}>Giải Đấu Của Tôi</h1>
          <p className={`text-sm mt-0.5 ${dim}`}>{tournaments.length} giải đấu · {tournaments.filter(t=>t.status==='active').length} đang diễn ra</p>
        </div>
        <button onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105">
          <Plus size={16} /> Tạo Giải Mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className={`relative flex-1 min-w-48 max-w-72`}>
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dim}`} />
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Tìm kiếm giải đấu..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
              ${dm?'bg-white/6 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/40':'bg-white border-slate-200 text-slate-900 focus:border-emerald-400'}`} />
        </div>
        {/* Status filter */}
        {[{id:'all',l:'Tất Cả'},{id:'pending',l:'Chờ Khởi Động'},{id:'active',l:'Đang Diễn Ra'},{id:'done',l:'Đã Kết Thúc'}].map(f=>(
          <button key={f.id} type="button" onClick={()=>setFilterStatus(f.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus===f.id
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow'
              : dm?'bg-white/6 border border-white/10 text-slate-400 hover:text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className={`rounded-2xl border p-16 text-center ${dm?'bg-white/3 border-white/8':'bg-white border-slate-200'}`}>
          {search
            ? <><Search size={48} className={`mx-auto mb-4 ${dim}`} /><p className={`text-lg font-black mb-1 ${dm?'text-slate-400':'text-slate-600'}`}>Không tìm thấy kết quả</p></>
            : <><Trophy size={56} className={`mx-auto mb-4 ${dim}`} />
                <p className={`text-xl font-black mb-2 ${dm?'text-slate-300':'text-slate-700'}`}>Chưa có giải đấu nào</p>
                <p className={`text-sm mb-6 ${dim}`}>Tạo giải đấu đầu tiên của bạn để bắt đầu</p>
                <button onClick={onCreateNew} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all">
                  <Plus size={16} className="inline mr-2" />Tạo Giải Đấu Đầu Tiên
                </button>
              </>}
        </div>
      )}

      {/* Tournament cards grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t, idx) => (
            <div key={t.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.01] cursor-pointer group ${card}`}
              style={{ animation: `fadeUp .3s ease-out ${idx*0.05}s both` }}
              onClick={() => onEnter(t.id)}>

              {/* Card header */}
              <div className="relative h-28 bg-gradient-to-br from-emerald-700/40 to-cyan-800/40 flex items-center justify-center overflow-hidden">
                {t.logo
                  ? <img src={t.logo} alt={t.name} className="h-20 w-20 object-contain drop-shadow-xl" onError={e=>e.target.style.display='none'} />
                  : <Trophy size={48} className="text-emerald-400/60" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <FormatBadge format={t.format} dm={dm} />
                </div>
                <div className="absolute bottom-3 left-3">
                  <StatusBadge status={t.status} dm={dm} />
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h2 className={`text-base font-black leading-tight mb-3 group-hover:text-emerald-400 transition-colors ${dm?'text-white':'text-slate-900'}`}>
                  {t.name}
                </h2>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon:Users,    v: t.teams?.length||0,                    l:'Đội' },
                    { icon:Calendar, v: t.matches?.length||0,                  l:'Trận' },
                    { icon:CheckCircle2, v: t.matches?.filter(m=>m.status==='done').length||0, l:'Xong' },
                  ].map(({icon:Icon,v,l}) => (
                    <div key={l} className={`text-center p-2 rounded-xl ${dm?'bg-white/5':'bg-slate-50'}`}>
                      <p className={`text-lg font-black ${dm?'text-white':'text-slate-900'}`}>{v}</p>
                      <p className={`text-[10px] font-medium ${dim}`}>{l}</p>
                    </div>
                  ))}
                </div>

                <div className={`text-[10px] ${dim} mb-3`}>
                  <Clock size={10} className="inline mr-1" />
                  {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                </div>

                {/* Enter button */}
                <button type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-cyan-500/20 font-bold text-sm transition-all group-hover:border-emerald-500/40">
                  <Play size={14} /> Vào Giải Đấu
                  <ArrowRight size={13} className="ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
