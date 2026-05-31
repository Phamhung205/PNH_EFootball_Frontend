import React, { useState, useCallback } from 'react';
import {
  Trophy, Users, Calendar, Swords, BarChart3, Wallet,
  Download, Settings, LayoutDashboard, Menu, X,
  ArrowLeft, ChevronRight,
} from 'lucide-react';
import { AccountDropdown } from './Layout';
import { Sun, Moon } from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   TOURNAMENT SIDEBAR NAV
════════════════════════════════════════════════════════════ */
const T_NAV = [
  { id:'overview',   icon: LayoutDashboard, labelVi:'Tổng Quan',       color:'text-emerald-400' },
  { id:'teams',      icon: Users,           labelVi:'Đội Bóng',         color:'text-blue-400' },
  { id:'groups',     icon: Calendar,        labelVi:'Chia Bảng',        color:'text-purple-400' },
  { id:'schedule',   icon: Calendar,        labelVi:'Lịch Thi Đấu',    color:'text-indigo-400' },
  { id:'scores',     icon: Swords,          labelVi:'Nhập Kết Quả',    color:'text-orange-400' },
  { id:'standings',  icon: BarChart3,       labelVi:'Bảng Xếp Hạng',   color:'text-teal-400' },
  { id:'fund',       icon: Wallet,          labelVi:'Quỹ Giải Đấu',    color:'text-green-400' },
  { id:'export',     icon: Download,        labelVi:'Xuất Ảnh',         color:'text-pink-400' },
  { id:'settings',   icon: Settings,        labelVi:'Cài Đặt',          color:'text-slate-400' },
];

/* ════════════════════════════════════════════════════════════
   FORMAT BADGE
════════════════════════════════════════════════════════════ */
export const FormatBadge = ({ format, dm }) => {
  const cfg = {
    'group':    { label:'Đấu Bảng',        cls:'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    'knockout': { label:'Loại Trực Tiếp',  cls:'bg-orange-500/20 text-orange-400 border-orange-500/20' },
    'league':   { label:'Đường Dài',       cls:'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    'hybrid':   { label:'Hỗn Hợp',        cls:'bg-teal-500/20 text-teal-400 border-teal-500/20' },
  };
  const c = cfg[format] || { label: format || 'Chưa xác định', cls: dm?'bg-white/10 text-slate-400':'bg-slate-100 text-slate-500' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border ${c.cls}`}>{c.label}</span>
  );
};

export const StatusBadge = ({ status, dm }) => {
  const cfg = {
    pending: { label:'Chờ Khởi Động', cls: dm?'bg-slate-700 text-slate-400':'bg-slate-100 text-slate-500' },
    active:  { label:'Đang Diễn Ra',  cls:'bg-emerald-500/20 text-emerald-400 animate-pulse' },
    done:    { label:'Đã Kết Thúc',   cls:'bg-blue-500/20 text-blue-400' },
  };
  const c = cfg[status] || cfg.pending;
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${c.cls}`}>{c.label}</span>;
};

/* ════════════════════════════════════════════════════════════
   TOURNAMENT WORKSPACE — shell for per-tournament dashboard
   Completely isolated from main layout.
   z-index: header=z-30, sidebar=z-20, dropdown=z-50
════════════════════════════════════════════════════════════ */
const TournamentWorkspace = ({
  user, tournament, activeTab, onTab, onExit,
  darkMode, setDarkMode, language, onLogout,
  children,
}) => {
  const [sbOpen, setSbOpen] = useState(false);
  const dm = darkMode;

  const bg   = dm ? 'bg-[#070d1a]'                    : 'bg-slate-50';
  const hBg  = dm ? 'bg-[#0a0f1a]/95 border-white/8'  : 'bg-white/95 border-slate-200';
  const sbBg = dm ? 'bg-[#0a0f1a] border-white/8'     : 'bg-white border-slate-200';
  const dim  = dm ? 'text-slate-500' : 'text-slate-400';

  const handleTab = useCallback(t => { onTab(t); setSbOpen(false); }, [onTab]);

  return (
    <div className={`min-h-screen flex flex-col ${bg}`} style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* HEADER z-30 */}
      <header className={`sticky top-0 z-30 h-14 border-b flex items-center gap-3 px-4 shrink-0 backdrop-blur-xl ${hBg}`}>

        {/* Back button */}
        <button type="button" onClick={onExit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shrink-0
            ${dm?'text-slate-400 hover:text-white hover:bg-white/8':'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Thoát</span>
        </button>

        {/* Tournament info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {tournament.logo ? (
            <img src={tournament.logo} alt="" className="w-7 h-7 rounded-lg object-contain shrink-0" onError={e=>e.target.style.display='none'} />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Trophy size={13} className="text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className={`text-sm font-black truncate leading-tight ${dm?'text-white':'text-slate-900'}`}>{tournament.name}</p>
            <div className="flex items-center gap-1.5">
              <FormatBadge format={tournament.format} dm={dm} />
              <StatusBadge status={tournament.status} dm={dm} />
            </div>
          </div>
        </div>

        {/* Mobile burger */}
        <button type="button" onClick={()=>setSbOpen(o=>!o)}
          className={`md:hidden p-2 rounded-lg transition-colors ${dm?'text-slate-400 hover:text-white hover:bg-white/8':'text-slate-500 hover:bg-slate-200'}`}>
          {sbOpen ? <X size={19}/> : <Menu size={19}/>}
        </button>

        <div className="hidden md:flex items-center gap-2">
          <button type="button" onClick={()=>setDarkMode(!dm)}
            className={`p-2 rounded-lg transition-colors ${dm?'text-yellow-400 hover:bg-white/8':'text-indigo-500 hover:bg-slate-200'}`}>
            {dm?<Sun size={17}/>:<Moon size={17}/>}
          </button>
          <AccountDropdown user={user} dm={dm} lang={language}
            onNavigate={(view, tab) => { onExit(); }}
            onLogout={onLogout}
            onToggleDark={()=>setDarkMode(!dm)} />
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile backdrop */}
        {sbOpen && (
          <div className="fixed inset-0 bg-black/60 z-10 md:hidden" onClick={()=>setSbOpen(false)} aria-hidden />
        )}

        {/* SIDEBAR z-20 */}
        <aside className={[
          'fixed md:sticky top-14 left-0 z-20',
          'w-56 h-[calc(100vh-3.5rem)]',
          'flex flex-col border-r shrink-0 overflow-y-auto',
          'transition-transform duration-300 ease-out',
          sbOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          sbBg,
        ].join(' ')}>

          <nav className="flex-1 px-2.5 py-4 space-y-0.5">
            {T_NAV.filter(item => {
              if (item.id === 'groups') {
                return tournament.format === 'knockout';
              }
              if (item.id === 'fund') {
                return false;
              }
              if (item.id === 'scores') {
                return false;
              }
              return true;
            }).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} type="button" onClick={()=>handleTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all relative group
                    ${isActive
                      ? dm
                        ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/5 text-white border border-emerald-500/20'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : dm
                        ? 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-full" />
                  )}
                  <Icon size={16} className={`shrink-0 ${isActive?(item.color||'text-emerald-400'):(dm?'text-slate-500 group-hover:text-slate-300':'text-slate-400')}`} />
                  <span className="flex-1 text-left">{item.labelVi}</span>
                  {isActive && <ChevronRight size={11} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Teams count */}
          <div className={`p-3 border-t ${dm?'border-white/8':'border-slate-200'}`}>
            <div className={`rounded-xl p-3 ${dm?'bg-white/4':'bg-slate-50'}`}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className={dim}>Đội bóng</span>
                <span className={`font-black ${dm?'text-white':'text-slate-900'}`}>{tournament.teams?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className={dim}>Trận đấu</span>
                <span className={`font-black ${dm?'text-white':'text-slate-900'}`}>{tournament.matches?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={dim}>Hoàn thành</span>
                <span className="font-black text-emerald-400">{tournament.matches?.filter(m=>m.status==='done').length || 0}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden relative">
          {dm && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}} aria-hidden>
              <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/4 rounded-full blur-[100px]" />
            </div>
          )}
          <div className="relative" style={{zIndex:1}}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default TournamentWorkspace;
