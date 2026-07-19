import React, { useState } from 'react';
import { Trophy, Plus, Users, Calendar, ArrowRight, Search, Clock, CheckCircle2, Play, Globe, UserCircle2 } from 'lucide-react';
import { FormatBadge, StatusBadge } from '../TournamentWorkspace';

/* ════════════════════════════════════════════════════════════
   TOURNAMENT LIST — Card grid of all tournaments
════════════════════════════════════════════════════════════ */
const TournamentList = ({ tournaments, darkMode, language, onEnter, onCreateNew, user }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);
  // Moi tai khoan da dang nhap deu tao duoc giai.
  // So luong bi gioi han theo goi -> backend tra 403 kem thong bao het luot dung thu.
  const canCreate = !!user;
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [scope, setScope] = useState('mine');   // 'mine' = giai cua toi | 'community' = giai cong dong

  const myId = user?.id ?? null;

  // Giai do CHINH MINH tao
  const isMine = (t) => myId != null && t.createdByUserId === myId;

  // Loc theo pham vi (cua toi / cong dong) truoc
  const scoped = scope === 'mine' ? tournaments.filter(isMine) : tournaments;

  // Khớp status Tiếng Việt với dữ liệu thật từ backend/mock
  const filtered = scoped.filter(t => {
    const matchSearch = (t.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Đếm theo từng nhóm trạng thái (chuỗi tiếng Việt)
  const countActive = scoped.filter(t => t.status === 'Đang diễn ra').length;
  const countPending = scoped.filter(t => t.status === 'Sắp khởi tranh' || t.status === 'Chờ khởi động').length;
  const countDone = scoped.filter(t => t.status === 'Hoàn thành' || t.status === 'Đã kết thúc').length;

  const card = dm
    ? 'bg-white/4 border-white/8 hover:bg-white/7 hover:border-emerald-500/20'
    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xl';

  const dim = dm ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{scope === 'mine' ? tr('Giải Đấu Của Tôi','My Tournaments') : tr('Giải Đấu Cộng Đồng','Community Tournaments')}</h1>
          <p className={`text-sm mt-0.5 ${dim}`}>
            {scoped.length} {tr('giải đấu','tournaments')} · {countActive} {tr('đang diễn ra','ongoing')} · {countPending} {tr('chờ','upcoming')} · {countDone} {tr('hoàn thành','finished')}
          </p>
        </div>
        {canCreate && (
          <button onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105">
            <Plus size={16} /> {tr('Tạo Giải Mới','Create Tournament')}
          </button>
        )}
      </div>

      {/* ── CHON PHAM VI: Giai cua toi | Giai cong dong ── */}
      <div className={`inline-flex p-1 rounded-2xl border ${dm ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
        {[
          { id: 'mine', icon: UserCircle2, label: tr('Giải Của Tôi', 'My Tournaments'), count: tournaments.filter(isMine).length },
          { id: 'community', icon: Globe, label: tr('Giải Cộng Đồng', 'Community'), count: tournaments.length },
        ].map(tab => {
          const on = scope === tab.id;
          return (
            <button key={tab.id} onClick={() => setScope(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all
                ${on
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                  : (dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`}>
              <tab.icon size={15} />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${on ? 'bg-white/25' : (dm ? 'bg-white/10' : 'bg-slate-200')}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter bar — status dùng tiếng Việt khớp với backend */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dim}`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tr("Tìm kiếm giải đấu...","Search tournaments...")}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
              ${dm ? 'bg-white/6 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/40' : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-400'}`}
            style={dm ? { backgroundColor: '#0f172a', color: '#fff' } : {}}
          />
        </div>
        {[
          { id: 'all', l: tr('Tất Cả','All') },
          { id: 'Sắp khởi tranh', l: tr('Chờ Khởi Động','Upcoming') },
          { id: 'Đang diễn ra', l: tr('Đang Diễn Ra','Ongoing') },
          { id: 'Hoàn thành', l: tr('Đã Kết Thúc','Finished') },
        ].map(f => (
          <button key={f.id} type="button" onClick={() => setFilterStatus(f.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === f.id
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow'
              : dm ? 'bg-white/6 border border-white/10 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className={`rounded-2xl border p-16 text-center ${dm ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200'}`}>
          {search
            ? <><Search size={48} className={`mx-auto mb-4 ${dim}`} /><p className={`text-lg font-black mb-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{tr('Không tìm thấy kết quả','No results found')}</p></>
            : <><Trophy size={56} className={`mx-auto mb-4 ${dim}`} />
              <p className={`text-xl font-black mb-2 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                {scope === 'mine'
                  ? tr('Bạn chưa tạo giải đấu nào','You have not created any tournaments')
                  : tr('Chưa có giải đấu nào','No tournaments yet')}
              </p>
              {scope === 'mine' && myId == null && (
                <p className="text-sm mb-4 text-amber-400 font-semibold">
                  {tr('Hãy đăng xuất rồi đăng nhập lại để hệ thống nhận diện giải của bạn.',
                      'Please sign out and sign in again so the system can recognize your tournaments.')}
                </p>
              )}
              {scope === 'mine' && myId != null && tournaments.length > 0 && (
                <p className={`text-sm mb-4 ${dim}`}>
                  {tr('Xem giải của mọi người ở tab "Giải Cộng Đồng".','Browse everyone\'s tournaments in the "Community" tab.')}
                </p>
              )}
              {canCreate ? (
                <>
                  <p className={`text-sm mb-6 ${dim}`}>{tr('Tạo giải đấu đầu tiên của bạn để bắt đầu','Create your first tournament to get started')}</p>
                  <button onClick={onCreateNew} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all">
                    <Plus size={16} className="inline mr-2" />{tr('Tạo Giải Đấu Đầu Tiên','Create Your First Tournament')}
                  </button>
                </>
              ) : (
                <p className={`text-sm mb-2 ${dim}`}>{tr('Hiện chưa có giải đấu nào để xem. Vui lòng quay lại sau.','No tournaments to view yet. Please come back later.')}</p>
              )}
            </>}
        </div>
      )}

      {/* Tournament cards grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t, idx) => {
            // Render logo: emoji hoặc URL/data
            const logoVal = t.logo || t.logoUrl;
            const isImage = logoVal && (logoVal.startsWith('http') || logoVal.startsWith('data:'));
            return (
              <div key={t.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.01] cursor-pointer group ${card}`}
                style={{ animation: `fadeUp .3s ease-out ${idx * 0.05}s both` }}
                onClick={() => onEnter(t.id)}>

                <div className="relative h-32 bg-gradient-to-br from-emerald-700/40 to-cyan-800/40 flex items-center justify-center overflow-hidden">
                  {isImage
                    ? <img src={logoVal} alt={t.name} className="absolute inset-0 w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    : logoVal
                      ? <span style={{ fontSize: 56, lineHeight: 1 }}>{logoVal}</span>
                      : <Trophy size={48} className="text-emerald-400/60" />}
                  {/* Lop phu toi dam hon khi co anh -> badge & chu noi ro */}
                  <div className={`absolute inset-0 ${isImage ? 'bg-gradient-to-t from-black/80 via-black/30 to-black/40' : 'bg-gradient-to-t from-black/50 to-transparent'}`} />
                  <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                    <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm shadow-lg">
                      <FormatBadge format={t.format} dm={dm} />
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm shadow-lg">
                      <StatusBadge status={t.status} dm={dm} />
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className={`text-base font-black leading-tight mb-2 group-hover:text-emerald-400 transition-colors ${dm ? 'text-white' : 'text-slate-900'}`}>
                    {t.name}
                  </h2>

                  {/* Nguoi tao giai — de phan biet o trang cong dong */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {t.createdByAvatar
                      ? <img src={t.createdByAvatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                      : <UserCircle2 size={14} className={dim} />}
                    <span className={`text-[11px] font-semibold truncate ${dim}`}>
                      {t.createdByName || tr('Không rõ người tạo', 'Unknown creator')}
                    </span>
                    {isMine(t) && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                        {tr('Của bạn', 'Yours')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Users, v: t.teams?.length || 0, l: tr('Đội','Teams') },
                      { icon: Calendar, v: t.matches?.length || 0, l: tr('Trận','Matches') },
                      { icon: CheckCircle2, v: t.matches?.filter(m => m.status === 'done').length || 0, l: tr('Xong','Done') },
                    ].map(({ v, l }) => (
                      <div key={l} className={`text-center p-2 rounded-xl ${dm ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{v}</p>
                        <p className={`text-[10px] font-medium ${dim}`}>{l}</p>
                      </div>
                    ))}
                  </div>

                  {t.createdAt && !isNaN(new Date(t.createdAt).getTime()) && (
                    <div className={`text-[10px] ${dim} mb-3`}>
                      <Clock size={10} className="inline mr-1" />
                      {new Date(t.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                    </div>
                  )}

                  <button type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-cyan-500/20 font-bold text-sm transition-all group-hover:border-emerald-500/40">
                    <Play size={14} /> {tr('Vào Giải Đấu','Enter Tournament')}
                    <ArrowRight size={13} className="ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentList;