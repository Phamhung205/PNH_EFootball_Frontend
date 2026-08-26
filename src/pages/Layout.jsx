import React, { useState, useRef, useEffect } from 'react';
import {
  Trophy, ChevronDown, User, LogOut, Moon, Sun, Home, Plus,
  KeyRound, Shield, Crown, CreditCard, Palette, LayoutDashboard, Globe, Menu, X, BarChart2
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border ${c.cls} uppercase tracking-wider`}>
      {plan === 'ultra' && '⚡'}{plan === 'pro' && '⭐'} {c.label}
    </span>
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
        ${danger ? 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
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
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[1px]">
          <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
            ) : (
              <span className="text-white font-black text-lg">{(user?.name?.[0]||'A').toUpperCase()}</span>
            )}
          </div>
        </div>
        
        <div className="hidden sm:flex flex-col text-left justify-center">
          <span className={`text-sm font-bold leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{user?.name||'Administrator'}</span>
          <div className="flex items-center mt-1">
            <PlanBadge plan={user?.plan||'free'} />
          </div>
        </div>
        
        <ChevronDown size={16} className={`hidden sm:block transition-transform ${open?'rotate-180':''} ${dm?'text-slate-400 group-hover:text-white':'text-slate-500 group-hover:text-slate-800'}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden z-50 ${dm?'bg-slate-900 border-white/10':'bg-white border-slate-200'}`}
          style={{ animation: 'dropdownIn .15s ease-out both' }}>
          
          <div className="bg-gradient-to-br from-emerald-700 to-cyan-800 px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl shrink-0 overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
                : (user?.name?.[0]||'A').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-emerald-200 truncate">{user?.email || 'admin@pnh.com'}</p>
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
   MAIN LAYOUT — Navbar chuẩn thiết kế (Ngôn ngữ + Sáng tối trên Header Mobile, Đăng xuất ở Menu Mobile)
════════════════════════════════════════════════════════════ */
const Layout = ({ user, currentView, onNavigate, onLogout, darkMode, setDarkMode, language, setLanguage, children }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);
  
  const isLoggedIn = !!user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bg  = dm ? 'bg-[#050914]' : 'bg-slate-50'; 
  const hBg = dm ? 'bg-[#050914]/95 border-white/5' : 'bg-white/95 border-slate-200';

  const NAV_ITEMS = [
    { id:'home',        label: tr('TRANG CHỦ','HOME') },
    { id:'tournaments', label: tr('GIẢI ĐẤU','TOURNAMENTS') },
    { id:'standings',   label: tr('BẢNG XẾP HẠNG','STANDINGS'), soon: true },
    { id:'news',        label: tr('TIN TỨC','NEWS'), soon: true },
    { id:'guide',       label: tr('HƯỚNG DẪN','GUIDE'), soon: true },
    { id:'contact',     label: tr('LIÊN HỆ','CONTACT'), isContact: true },
  ];

  const handleNavClick = (item) => {
    if (item.soon) return;
    if (item.isContact) {
      const footerElement = document.getElementById('footer-contact');
      if (footerElement) {
        footerElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('home');
        setTimeout(() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
      }
      setIsMobileMenuOpen(false);
      return;
    }
    onNavigate(item.id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      
      {/* ─── HEADER TOP (PC & Mobile) ─── */}
      <header className={`fixed top-0 left-0 w-full z-50 h-[64px] lg:h-[72px] border-b flex items-center justify-between px-4 lg:px-8 transition-all backdrop-blur-md ${hBg}`}>
        
        {/* BÊN TRÁI: LOGO */}
        <div className="flex items-center gap-3 lg:gap-4 lg:w-[25%] cursor-pointer group" onClick={() => onNavigate('home')}>
          <img 
            src="/logo.webp" 
            alt="PNH Football Logo" 
            className="w-10 h-10 object-contain rounded-xl hidden sm:block group-hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col shrink-0">
            <span className="text-[18px] lg:text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 leading-none group-hover:scale-105 transition-transform origin-left">
              PNH
            </span>
            <span className={`text-[10px] lg:text-[11px] font-bold tracking-[2px] leading-none mt-1 transition-colors ${dm ? 'text-white' : 'text-slate-900'}`}>
              FOOTBALL
            </span>
          </div>
        </div>

        {/* Ở GIỮA: MENU (Chỉ hiện trên PC khi ĐÃ ĐĂNG NHẬP) */}
        {isLoggedIn && (
          <nav className="hidden lg:flex flex-1 items-center justify-center h-full gap-2 xl:gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative h-full px-2 xl:px-3 text-[11px] xl:text-[12px] font-bold uppercase tracking-wider transition-colors flex items-center
                    ${item.soon ? 'text-slate-400 cursor-default' : isActive ? 'text-cyan-400' : (dm ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                >
                  {item.label}
                  {item.soon && (
                    <span className={`absolute top-4 -right-2 text-[8px] px-1 py-0.5 rounded border leading-none tracking-tighter 
                      ${dm ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200'}`}>
                      SOON
                    </span>
                  )}
                  {isActive && !item.soon && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_-2px_10px_rgba(34,211,238,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* BÊN PHẢI: TÍNH NĂNG & TÀI KHOẢN */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-6 lg:w-[25%]">
          {!isLoggedIn ? (
            /* KHUNG BAO QUANH 2 NÚT ĐĂNG NHẬP / ĐĂNG KÝ (Hiển thị khi CHƯA đăng nhập) */
            <div className={`flex items-center p-1 rounded-[16px] border ${dm ? 'border-white/10 bg-[#0f172a]/60' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => onNavigate('auth')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-[12px] text-[10px] lg:text-xs font-bold uppercase tracking-wide transition-all ${dm ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm'}`}>
                {tr('Đăng Nhập', 'Login')}
              </button>
              <button onClick={() => onNavigate('auth', 'register')}
                className="px-3 lg:px-5 py-1.5 lg:py-2 rounded-[12px] bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 text-[10px] lg:text-xs font-black uppercase tracking-wide hover:opacity-90 transition-opacity ml-1 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {tr('Đăng Ký', 'Register')}
              </button>
            </div>
          ) : (
            /* HIỂN THỊ ĐẦY ĐỦ CÁC TÍNH NĂNG KHI ĐÃ ĐĂNG NHẬP */
            <>
              {/* Ngôn ngữ - HIỂN THỊ TRÊN CẢ MOBILE VÀ PC */}
              <button type="button" onClick={() => setLanguage && setLanguage(language === 'vi' ? 'en' : 'vi')}
                className={`flex items-center gap-1 transition-colors ${dm ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-[10px] sm:text-xs font-black uppercase mt-0.5">{language === 'vi' ? 'VI' : 'EN'}</span>
              </button>

              {/* Sáng tối - HIỂN THỊ TRÊN CẢ MOBILE VÀ PC */}
              <button type="button" onClick={() => setDarkMode(!dm)}
                className={`flex p-1 sm:p-1.5 rounded-lg border transition-colors ${dm ? 'bg-amber-400/10 border-amber-400/20 text-amber-400 hover:text-amber-300' : 'bg-slate-100 border-slate-200 text-indigo-500 hover:bg-slate-200'}`}>
                {dm ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>

              {/* Dấu gạch chia cách (chỉ hiện PC) */}
              <div className={`w-[1px] h-6 hidden lg:block ${dm ? 'bg-white/10' : 'bg-slate-300'}`} />

              {/* Nút Account chỉ hiện trên PC */}
              <div className="hidden lg:flex items-center gap-2 lg:gap-3">
                 <AccountDropdown user={user} dm={dm} lang={language}
                  onNavigate={(view, tab) => { if (tab) onNavigate('account', tab); else onNavigate(view); }}
                  onLogout={onLogout}
                  onToggleDark={() => setDarkMode(!dm)} />
              </div>

              {/* Hamburger Mobile */}
              <button 
                className={`lg:hidden p-1 ml-1 ${dm ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>

        {/* Menu Dropdown Hamburger (Mobile) */}
        {isMobileMenuOpen && isLoggedIn && (
          <div className={`absolute top-[64px] left-0 w-full border-b flex flex-col p-4 shadow-2xl lg:hidden
            ${dm ? 'bg-[#050914] border-white/10' : 'bg-white border-slate-200'}`}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`py-3 text-left text-sm font-bold uppercase tracking-wider flex items-center gap-2
                  ${item.soon ? 'text-slate-500' : currentView === item.id ? 'text-cyan-400' : (dm ? 'text-slate-300' : 'text-slate-600')}`}
              >
                {item.label}
                {item.soon && <span className={`text-[9px] px-1.5 py-0.5 rounded border ${dm ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200'}`}>SOON</span>}
              </button>
            ))}

            {/* Nút Đăng xuất ở Mobile Menu */}
            <div className={`mt-2 pt-2 border-t ${dm ? 'border-white/10' : 'border-slate-200'}`}>
              <button 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} 
                className={`w-full py-3 text-left text-sm font-bold uppercase tracking-wider flex items-center gap-2 
                ${dm ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
              >
                <LogOut size={18} /> {tr('Đăng Xuất', 'Logout')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── BOTTOM APP BAR (Chỉ hiển thị khi ĐÃ ĐĂNG NHẬP trên Mobile) ─── */}
      {isLoggedIn && (
        <nav className={`lg:hidden fixed bottom-0 left-0 w-full z-50 h-[68px] border-t flex items-center justify-around px-2 pb-safe transition-colors duration-300
          ${dm ? 'bg-[#060b14]/95 border-white/10 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'}`}>
          
          <button onClick={() => onNavigate('home')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${currentView === 'home' ? 'text-cyan-500' : 'text-slate-400'}`}>
            <Home size={20} className={currentView === 'home' ? 'fill-cyan-500/20' : ''} />
            <span className="text-[10px] font-bold">Trang chủ</span>
          </button>

          <button onClick={() => onNavigate('tournaments')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${currentView === 'tournaments' ? 'text-cyan-500' : 'text-slate-400'}`}>
            <Trophy size={20} className={currentView === 'tournaments' ? 'fill-cyan-500/20' : ''} />
            <span className="text-[10px] font-bold">Giải đấu</span>
          </button>

          {/* Nút Tạo giải */}
          <div className="relative -top-5 w-16 flex justify-center">
            <button 
              onClick={() => onNavigate('create')}
              className={`w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center border-[4px] shadow-[0_4px_15px_rgba(6,182,212,0.5)] text-white hover:scale-105 transition-transform ${dm ? 'border-[#050914]' : 'border-white'}`}
            >
              <Plus size={24} strokeWidth={3} />
            </button>
            <span className={`absolute -bottom-4 text-[10px] font-bold ${dm ? 'text-slate-300' : 'text-slate-500'}`}>Tạo giải</span>
          </div>

          <button className={`flex flex-col items-center gap-1 w-16 opacity-60 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            <BarChart2 size={20} />
            <span className="text-[10px] font-bold">BXH</span>
          </button>

          {/* Nút Tài khoản ở Bottom Nav */}
          <button onClick={() => onNavigate('account', 'profile')} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${currentView === 'account' ? 'text-cyan-500' : (dm ? 'text-slate-400' : 'text-slate-500')}`}>
            
            <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-500 ${currentView === 'account' ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-[#060b14]' : ''}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
              ) : (
                <span className="text-white font-black text-[11px]">{(user?.name?.[0]||'A').toUpperCase()}</span>
              )}
            </div>
            <span className="text-[10px] font-bold">Tài khoản</span>
          </button>
        </nav>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className={`flex-1 min-w-0 overflow-x-hidden pt-[64px] lg:pt-[72px] ${isLoggedIn ? 'pb-[68px] lg:pb-0' : ''}`}>
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
      `}</style>
    </div>
  );
};

export default Layout;