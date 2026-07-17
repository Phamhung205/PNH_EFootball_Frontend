import React, { useState, useRef, useEffect } from 'react';
import {
  Trophy, ChevronDown, User, LogOut, Moon, Sun, Home, Plus,
  KeyRound, Shield, Crown, CreditCard, Palette, LayoutDashboard, Globe,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   PLAN BADGE
════════════════════════════════════════════════════════════ */
export const PlanBadge = ({ plan }) => {
  const cfg = {
    free:  { label:'FREE',  cls:'bg-slate-700/80 text-slate-300 border-slate-600' },
    pro:   { label:'PRO',   cls:'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-transparent' },
    ultra: { label:'ULTRA', cls:'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent' },
  };
  const c = cfg[plan] || cfg.free;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${c.cls}`}>
      {plan === 'ultra' && '⚡'}{plan === 'pro' && '⭐'} {c.label}
    </span>
  );
};

/* ════════════════════════════════════════════════════════════
   LOGO — dùng ảnh logo.png, fallback Trophy nếu ảnh lỗi
════════════════════════════════════════════════════════════ */
const LogoMark = ({ size = 32, customUrl = '' }) => {
  const [err, setErr] = useState(false);
  // Uu tien logo nguoi dung tai len (customUrl). Neu khong co hoac loi -> /logo.webp -> Trophy
  const src = customUrl || '/logo.webp';
  if (err) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
        style={{ width: size, height: size }}>
        <Trophy size={size * 0.5} className="text-white" />
      </div>
    );
  }
  return (
    <img src={src} alt="PNH Football" onError={() => setErr(true)}
      className="rounded-lg object-cover shadow-lg shadow-emerald-500/30"
      style={{ width: size, height: size }} />
  );
};

/* ════════════════════════════════════════════════════════════
   ACCOUNT DROPDOWN
════════════════════════════════════════════════════════════ */
export const AccountDropdown = ({ user, dm, lang, onNavigate, onLogout, onToggleDark }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = user?.role === 'admin';
  const tr = (vi, en) => (lang === 'en' ? en : vi);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const go = (view, tab) => { onNavigate(view, tab); setOpen(false); };

  const Row = ({ icon: Icon, label, onClick, accent, danger }) => (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
        ${danger ? 'text-red-400 hover:bg-red-500/10'
        : accent ? (dm ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-700 hover:bg-emerald-50')
        : (dm ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100')}`}>
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
  const Hr = () => <div className={`my-1 border-t ${dm ? 'border-white/8' : 'border-slate-200'}`} />;
  const Lbl = ({ t }) => <p className={`px-4 pt-3 pb-1 text-[10px] font-black tracking-[2px] ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{t}</p>;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all
          ${open ? (dm?'bg-white/10':'bg-slate-200') : (dm?'hover:bg-white/6':'hover:bg-slate-100')}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow shrink-0 overflow-hidden">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
            : (user?.name?.[0]||'U').toUpperCase()}
        </div>
        <div className="hidden md:block text-left leading-none">
          <p className={`text-xs font-bold ${dm?'text-white':'text-slate-900'}`}>{user?.name||'User'}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <PlanBadge plan={user?.plan||'free'} />
          </div>
        </div>
        <ChevronDown size={13} className={`hidden md:block shrink-0 transition-transform ${open?'rotate-180':''} ${dm?'text-slate-500':'text-slate-400'}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-1.5 w-72 rounded-2xl shadow-2xl border overflow-hidden z-50 ${dm?'bg-slate-900 border-white/10':'bg-white border-slate-200'}`}
          style={{ animation: 'dropdownIn .15s ease-out both' }}>
          <div className="bg-gradient-to-br from-emerald-700 to-cyan-800 px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl shrink-0 overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
                : (user?.name?.[0]||'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user?.name}</p>
              <p className="text-xs text-emerald-200 truncate">{user?.email}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                <PlanBadge plan={user?.plan||'free'} />
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-500/30">
                    <Crown size={9}/> ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[72vh]">
            <Lbl t={tr("TÀI KHOẢN", "ACCOUNT")} />
            <Row icon={User}       label={tr("Hồ Sơ Cá Nhân", "My Profile")} onClick={()=>go('account','profile')} />
            <Row icon={KeyRound}   label={tr("Đổi Mật Khẩu", "Change Password")}  onClick={()=>go('account','change-pwd')} />
            <Row icon={CreditCard} label={tr("Gói Đăng Ký", "Subscription")}   onClick={()=>go('account','subscription')} />

            {isAdmin && (<>
              <Hr />
              <Lbl t={tr("QUẢN TRỊ HỆ THỐNG", "SYSTEM ADMIN")} />
              <Row icon={LayoutDashboard} label={tr("Tổng Quan", "Overview")}  onClick={()=>go('tournaments',null)} accent />
              <Row icon={Shield}          label={tr("Phân Quyền", "Permissions")} onClick={()=>go('account','permissions')} accent />
              <Row icon={Palette}         label={tr("Giao Diện", "Interface")}  onClick={()=>go('account','ui-settings')} accent />
            </>)}

            <Hr />
            <Lbl t={tr("HIỂN THỊ", "DISPLAY")} />
            <button type="button" onClick={onToggleDark}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${dm?'text-slate-300 hover:bg-white/5 hover:text-white':'text-slate-700 hover:bg-slate-100'}`}>
              {dm ? <Sun size={15} className="text-yellow-400 shrink-0"/> : <Moon size={15} className="text-indigo-500 shrink-0"/>}
              <span className="flex-1 text-left">{dm?tr('Chế Độ Sáng','Light Mode'):tr('Chế Độ Tối','Dark Mode')}</span>
            </button>

            <Hr />
            <Row icon={LogOut} label={tr("Đăng Xuất", "Logout")} onClick={onLogout} danger />
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN LAYOUT
════════════════════════════════════════════════════════════ */
const Layout = ({ user, currentView, onNavigate, onLogout, darkMode, setDarkMode, language, setLanguage, children, customLogoUrl = '' }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);

  const bg  = dm ? 'bg-[#070d1a]' : 'bg-slate-50';
  const hBg = dm ? 'bg-[#0a0f1a]/95 border-white/8' : 'bg-white/95 border-slate-200';

  const NAV_ITEMS = [
    { id:'home',        icon: Home,   label: tr('Trang Chủ','Home') },
    { id:'tournaments', icon: Trophy, label: tr('Giải Đấu','Tournaments') },
    { id:'create',      icon: Plus,   label: tr('Tạo Giải','Create'), accent: true },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      <header className={`sticky top-0 z-30 h-14 border-b flex items-center gap-3 px-4 shrink-0 backdrop-blur-xl ${hBg}`}>
        {/* Logo — dùng ảnh logo.png */}
        <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group shrink-0">
          <div className="group-hover:scale-105 transition-transform">
            <LogoMark size={34} customUrl={customLogoUrl} />
          </div>
          <div className="hidden sm:block">
            <p className={`text-sm font-black leading-tight ${dm?'text-white':'text-slate-900'}`}>
              PNH <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">FOOTBALL</span>
            </p>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button key={item.id} type="button" onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all
                  ${item.accent
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-cyan-600'
                    : isActive
                      ? (dm?'bg-white/10 text-white':'bg-slate-200 text-slate-900')
                      : (dm?'text-slate-400 hover:text-white hover:bg-white/6':'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                  }`}>
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* #75: Nut chuyen ngon ngu VI/EN */}
        <button type="button" onClick={() => setLanguage && setLanguage(language === 'vi' ? 'en' : 'vi')}
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${dm?'text-cyan-300 hover:bg-white/8':'text-cyan-600 hover:bg-slate-200'}`}>
          <Globe size={15} />
          {language === 'vi' ? 'VI' : 'EN'}
        </button>

        <button type="button" onClick={() => setDarkMode(!dm)}
          className={`p-2 rounded-lg transition-colors ${dm?'text-yellow-400 hover:bg-white/8':'text-indigo-500 hover:bg-slate-200'}`}>
          {dm ? <Sun size={17}/> : <Moon size={17}/>}
        </button>

        <AccountDropdown user={user} dm={dm} lang={language}
          onNavigate={(view, tab) => { if (tab) onNavigate('account', tab); else onNavigate(view); }}
          onLogout={onLogout}
          onToggleDark={() => setDarkMode(!dm)} />
      </header>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        {dm && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}} aria-hidden>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px]" />
          </div>
        )}
        <div className="relative" style={{zIndex:1}}>{children}</div>
      </main>

      <style>{`
        @keyframes dropdownIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
};

export default Layout;