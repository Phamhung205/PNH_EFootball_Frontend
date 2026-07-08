import React, { useState, useCallback } from 'react';
import {
  Trophy, Users, Calendar, Swords, BarChart3, Wallet,
  Download, Settings, LayoutDashboard, Menu, X,
  ArrowLeft, ChevronRight, GitMerge,
} from 'lucide-react';
import { AccountDropdown } from './Layout';
import { Sun, Moon } from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   THEME NEN THEO TEN GIAI (tu thiet ke - KHONG dung logo ban quyen)
   - Ten co "C1"/"Champions" -> nen xanh dem phong cach cup chau Au
   - "World Cup"/"WC"        -> nen vang le hoi
   - "Ngoai Hang"/"Premier"  -> nen tim
   - Con lai                 -> null (dung nen mac dinh nhu cu)
   Logo that cua cac giai la nhan hieu dang ky -> nguoi dung tu tai logo rieng qua LogoUrl.
════════════════════════════════════════════════════════════ */
function getTournamentTheme(name) {
  const s = (name || '').toString().toLowerCase();

  // Cup chau Au (C1 / Champions League)
  if (/(^|[^a-z])c1([^a-z]|$)|champion|cúp c1|cup c1|uefa|c\.1/.test(s)) {
    return {
      id: 'champions',
      label: 'Cúp Châu Âu',
      bg: 'radial-gradient(1000px 480px at 50% -12%, #1a2f66 0%, transparent 60%),'
        + ' radial-gradient(2px 2px at 18% 22%, rgba(255,255,255,.45), transparent),'
        + ' radial-gradient(1.5px 1.5px at 72% 30%, rgba(255,255,255,.35), transparent),'
        + ' radial-gradient(1.5px 1.5px at 40% 48%, rgba(255,255,255,.3), transparent),'
        + ' radial-gradient(2px 2px at 85% 60%, rgba(255,255,255,.3), transparent),'
        + ' linear-gradient(180deg, #060c22 0%, #030614 100%)',
      accent: '#8fb4ff',
    };
  }
  // World Cup (vang le hoi)
  if (/world\s*cup|worldcup|(^|[^a-z])wc([^a-z]|$)|fifa|world\b/.test(s)) {
    return {
      id: 'worldcup',
      label: 'World Cup',
      bg: 'radial-gradient(1000px 480px at 50% -12%, #4a3410 0%, transparent 60%),'
        + ' radial-gradient(900px 400px at 80% 110%, #1f3d1a 0%, transparent 55%),'
        + ' linear-gradient(180deg, #1b1305 0%, #0a0803 100%)',
      accent: '#f5c451',
    };
  }
  // Ngoai Hang Anh (tim)
  if (/ngoại hạng|ngoai hang|premier|(^|[^a-z])nha([^a-z]|$)|(^|[^a-z])epl([^a-z]|$)/.test(s)) {
    return {
      id: 'premier',
      label: 'Ngoại Hạng',
      bg: 'radial-gradient(1000px 480px at 50% -12%, #3d1166 0%, transparent 60%),'
        + ' radial-gradient(800px 400px at 15% 100%, #5a1d7a 0%, transparent 55%),'
        + ' linear-gradient(180deg, #1c0836 0%, #0b0418 100%)',
      accent: '#e56ff0',
    };
  }
  return { id: 'default', label: '', bg: null, accent: '#34d399' };
}

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
  { id:'knockout',   icon: GitMerge,        labelVi:'Sơ Đồ Loại',       color:'text-cyan-400' },
  { id:'qualified',  icon: Trophy,          labelVi:'Đội Vào Vòng',     color:'text-yellow-400' },
  { id:'fund',       icon: Wallet,          labelVi:'Đóng Phí & Quỹ',    color:'text-green-400' },
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
    'GroupStage_Knockout': { label:'Vòng Bảng + Knockout', cls:'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    'Knockout': { label:'Loại Trực Tiếp',  cls:'bg-orange-500/20 text-orange-400 border-orange-500/20' },
    'League':   { label:'Đường Dài',       cls:'bg-purple-500/20 text-purple-400 border-purple-500/20' },
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
    // Trang thai tieng Viet tu backend
    'Sắp khởi tranh': { label:'Sắp Khởi Tranh', cls: dm?'bg-slate-700 text-slate-400':'bg-slate-100 text-slate-500' },
    'Đang diễn ra':   { label:'Đang Diễn Ra',  cls:'bg-emerald-500/20 text-emerald-400 animate-pulse' },
    'Hoàn thành':     { label:'Đã Kết Thúc',   cls:'bg-blue-500/20 text-blue-400' },
  };
  const c = cfg[status] || cfg.pending;
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${c.cls}`}>{c.label}</span>;
};

/* ════════════════════════════════════════════════════════════
   TOURNAMENT WORKSPACE — shell for per-tournament dashboard
════════════════════════════════════════════════════════════ */
const TournamentWorkspace = ({
  user, tournament, activeTab, onTab, onExit,
  darkMode, setDarkMode, language, onLogout,
  children,
}) => {
  const [sbOpen, setSbOpen] = useState(false);
  const dm = darkMode;

  // Nen theo giai (C1 / World Cup / Ngoai Hang...). Chi ap khi che do toi (dark).
  const theme = getTournamentTheme(tournament?.name);

  const bg   = dm ? 'bg-[#070d1a]'                    : 'bg-slate-50';
  const hBg  = dm ? 'bg-[#0a0f1a]/95 border-white/8'  : 'bg-white/95 border-slate-200';
  const sbBg = dm ? 'bg-[#0a0f1a] border-white/8'     : 'bg-white border-slate-200';
  const dim  = dm ? 'text-slate-500' : 'text-slate-400';

  const handleTab = useCallback(t => { onTab(t); setSbOpen(false); }, [onTab]);

  // Style nen: neu co theme + dark thi dung nen theme, khong thi giu nen mac dinh
  const wrapperStyle = {
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    ...(dm && theme.bg ? { background: theme.bg, backgroundAttachment: 'fixed' } : {}),
  };

  return (
    <div className={`min-h-screen flex flex-col ${bg}`} style={wrapperStyle}>

      {/* HEADER z-30 */}
      <header className={`sticky top-0 z-30 h-14 border-b flex items-center gap-3 px-4 shrink-0 backdrop-blur-xl ${hBg}`}>

        <button type="button" onClick={onExit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shrink-0
            ${dm?'text-slate-400 hover:text-white hover:bg-white/8':'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Thoát</span>
        </button>

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
              {theme.id !== 'default' && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0"
                  style={{ background: `${theme.accent}22`, color: theme.accent }}>
                  {theme.label}
                </span>
              )}
            </div>
          </div>
        </div>

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
              // Chuan hoa format ve chu thuong de so khop moi kieu backend tra
              // ('League' / 'GroupStage_Knockout' / 'Knockout' hoac 'league'/'group'/'knockout')
              const fmt = (tournament.format || '').toString().toLowerCase();
              const isGroupStage = fmt.includes('group'); // giai chia bang

              // Chia Bang: CHI hien voi giai chia bang (GroupStage)
              if (item.id === 'groups') {
                return isGroupStage;
              }
              // So Do Loai (Knockout): CHI hien voi giai co vong bang + knockout
              if (item.id === 'knockout') {
                return isGroupStage;
              }
              // Doi Vao Vong: CHI hien voi giai co knockout (giong tab knockout)
              if (item.id === 'qualified') {
                return isGroupStage;
              }
              // Xuat Anh: an o ca League lan GroupStage (theo yeu cau)
              if (item.id === 'export') {
                return false;
              }
              // Quy giai + Nhap KQ rieng: an (giu nhu cu)
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