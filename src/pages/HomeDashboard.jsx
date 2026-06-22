import React, { useState } from 'react';
import { 
  Trophy, Users, ChevronRight, ChevronDown, User, LogOut, UserCog, Gamepad2, Moon, Sun,
  Settings, HelpCircle, ShieldCheck, Swords, Wand2, Settings2, Medal, 
  Zap, MonitorSmartphone, Database, LayoutList, CheckCircle2, Crown, Search, Globe
} from 'lucide-react';

const HomeDashboard = ({ onNavigate, darkMode: initialDarkMode, language: initialLanguage, setDarkMode, setLanguage }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkModeLocal] = useState(initialDarkMode ?? true);
  const [language, setLanguageLocal] = useState(initialLanguage ?? 'vi');

  const handleDarkModeChange = (newMode) => {
    setDarkModeLocal(newMode);
    if (setDarkMode) setDarkMode(newMode);
  };

  const handleLanguageChange = (newLang) => {
    setLanguageLocal(newLang);
    if (setLanguage) setLanguage(newLang);
    setShowUserMenu(false);
  };

  const tournaments = [
    { id: 1, name: "Premier League (NHA)", type: "League", teams: 20, status: "Đang diễn ra" },
    { id: 2, name: "Champions League (C1)", type: "Knockout", teams: 32, status: "Sắp khởi tranh" },
    { id: 3, name: "La Liga", type: "League", teams: 20, status: "Đang diễn ra" }
  ];

  const translations = {
    vi: {
      home: 'Trang Chủ',
      tournaments: 'Giải Đấu',
      create: 'Tạo Giải Đấu',
      manage: 'Quản Lý Giải',
      find: 'Tìm Giải',
      pricing: 'Bảng Giá',
      myTournaments: 'Giải Đấu Của Tôi',
      darkMode: 'Chế Độ Tối',
      lightMode: 'Chế Độ Sáng',
      language: 'Ngôn Ngữ',
      logout: 'Đăng Xuất',
      vietnamese: 'Tiếng Việt',
      english: 'English'
    },
    en: {
      home: 'Home',
      tournaments: 'Tournaments',
      create: 'Create Tournament',
      manage: 'Manage Tournament',
      find: 'Find Tournament',
      pricing: 'Pricing',
      myTournaments: 'My Tournaments',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      logout: 'Logout',
      vietnamese: 'Tiếng Việt',
      english: 'English'
    }
  };

  const t = translations[language];

  return (
    <div className={`${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-900'} min-h-screen scroll-smooth overflow-x-hidden transition-colors duration-300`}>
      
      {/* NAVBAR */}
      <nav className={`flex items-center justify-between px-4 md:px-8 py-3 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className={`${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} p-2 rounded-lg group-hover:${darkMode ? 'bg-emerald-500/30' : 'bg-emerald-200'} transition-colors`}>
            <Trophy className="text-emerald-500" size={24} />
          </div>
          <span className={`text-xl font-black tracking-wider hidden sm:block ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            PNH <span className="text-emerald-500">FOOTBALL</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <button onClick={() => onNavigate('home')} className="text-emerald-500 font-bold border-b-2 border-emerald-500 py-2">
            {t.home}
          </button>
          
          <div className="relative group py-2">
            <button className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'} font-bold flex items-center gap-1 transition-colors`}>
              {t.tournaments} <ChevronDown size={16} />
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
              <button onClick={() => onNavigate('create')} className={`w-full text-left px-5 py-3.5 text-sm font-semibold ${darkMode ? 'text-slate-300 hover:bg-slate-800 border-slate-800' : 'text-slate-700 hover:bg-slate-100 border-slate-200'} flex items-center gap-3 border-b transition-colors`}><Wand2 size={16} className="text-emerald-500" /> {t.create}</button>
              <button onClick={() => onNavigate('manage')} className={`w-full text-left px-5 py-3.5 text-sm font-semibold ${darkMode ? 'text-slate-300 hover:bg-slate-800 border-slate-800' : 'text-slate-700 hover:bg-slate-100 border-slate-200'} flex items-center gap-3 border-b transition-colors`}><Settings2 size={16} className="text-blue-500" /> {t.manage}</button>
              <button className={`w-full text-left px-5 py-3.5 text-sm font-semibold ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'} flex items-center gap-3 transition-colors`}><Search size={16} className="text-amber-500" /> {t.find}</button>
            </div>
          </div>
          <button className={`${darkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-600'} font-bold flex items-center gap-2 transition-colors`}>
            {t.pricing} <Crown size={16} />
          </button>
        </div>

        {/* USER ACCOUNT MENU */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-11 h-11 rounded-full ${darkMode ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' : 'bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600'} flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg`}
          >
            <User size={20} className="text-white" />
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} border rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
              
              {/* Header */}
              <div className={`${darkMode ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'} px-6 py-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-white/30'} flex items-center justify-center`}>
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Phạm Ngọc Hùng</p>
                    <p className="text-emerald-100 text-xs">admin@pnhfootball.com</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className={`${darkMode ? 'border-slate-800' : 'border-slate-200'} border-b`}>
                {/* My Tournaments */}
                <button className={`w-full text-left px-6 py-3 flex items-center gap-3 ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'} transition-colors font-medium text-sm`}>
                  <Trophy size={18} className="text-emerald-500" />
                  <span>{t.myTournaments}</span>
                  <ChevronRight size={16} className="ml-auto text-slate-500" />
                </button>
              </div>

              {/* Settings Section */}
              <div className={`${darkMode ? 'border-slate-800' : 'border-slate-200'} border-b`}>
                {/* Dark Mode Toggle */}
                <button 
                  onClick={() => handleDarkModeChange(!darkMode)}
                  className={`w-full text-left px-6 py-3 flex items-center gap-3 ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'} transition-colors font-medium text-sm`}
                >
                  {darkMode ? (
                    <>
                      <Sun size={18} className="text-yellow-400" />
                      <span>{t.lightMode}</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} className="text-blue-400" />
                      <span>{t.darkMode}</span>
                    </>
                  )}
                </button>

                {/* Language Submenu */}
                <div className="relative group">
                  <button className={`w-full text-left px-6 py-3 flex items-center gap-3 ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'} transition-colors font-medium text-sm`}>
                    <Globe size={18} className="text-blue-500" />
                    <span>{t.language}</span>
                    <ChevronRight size={16} className="ml-auto text-slate-500" />
                  </button>
                  
                  {/* Language Submenu Dropdown */}
                  <div className={`absolute left-full top-0 ml-2 w-56 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}>
                    <button 
                      onClick={() => handleLanguageChange('vi')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 ${language === 'vi' ? 'bg-emerald-500 text-white' : darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'} transition-colors font-medium text-sm border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}
                    >
                      <span className="text-lg">🇻🇳</span>
                      <span>{t.vietnamese}</span>
                      {language === 'vi' && <CheckCircle2 size={16} className="ml-auto" />}
                    </button>
                    <button 
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 ${language === 'en' ? 'bg-emerald-500 text-white' : darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'} transition-colors font-medium text-sm`}
                    >
                      <span className="text-lg">🇬🇧</span>
                      <span>{t.english}</span>
                      {language === 'en' && <CheckCircle2 size={16} className="ml-auto" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={() => { setShowUserMenu(false); onNavigate('auth'); }}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 ${darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'} transition-colors font-bold text-sm`}
              >
                <LogOut size={18} />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className={`relative w-full pt-16 pb-32 flex flex-col items-center justify-center text-center px-4 ${darkMode ? 'bg-slate-950' : 'bg-gradient-to-b from-slate-50 to-slate-100'} transition-colors duration-300`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[10%] left-[20%] w-72 h-72 ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-300/20'} rounded-full blur-[100px]`} />
          <div className={`absolute bottom-[10%] right-[20%] w-72 h-72 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-300/20'} rounded-full blur-[100px]`} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-7xl font-black mb-6 tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            PNH <span className="text-emerald-500">FOOTBALL</span>
          </h1>
          <p className={`text-lg md:text-xl mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {language === 'vi' ? 'Nền tảng quản lý giải đấu bóng đá hàng đầu' : 'Leading football tournament management platform'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => onNavigate('create')} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {language === 'vi' ? 'Tạo Giải Đấu Ngay' : 'Create Tournament Now'}
            </button>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg border border-slate-700 hover:border-emerald-500/50"
            >
              {language === 'vi' ? '🎮 Quản Lý Giải Đấu' : '🎮 Manage Tournament'}
            </button>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className={`relative z-20 w-full px-4 md:px-12 -mt-20 mb-8 transition-colors duration-300`}>
        <div className={`p-1.5 rounded-[2rem] ${darkMode ? 'bg-gradient-to-b from-slate-700 to-slate-900' : 'bg-gradient-to-b from-slate-300 to-slate-400'}`}>
           <video 
             controls 
             autoPlay 
             playsInline 
             className="w-full aspect-video rounded-[1.7rem] bg-black shadow-2xl"
             src="/AQO6ok1GMVaFRytRPjWwqp91tYpnmWRJeSumZccTxitWxKLFUBVJOglH-JZtBGHMlLPg5S8ayJPpvGl7vKGlLHf0sKtu-VpN23b5b7lMQA.mp4"
           ></video>
        </div>
      </section>

      {/* STATS */}
      <section className={`px-4 md:px-12 max-w-7xl mx-auto mb-24 -mt-2 transition-colors duration-300`}>
        <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className={`p-6 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-colors duration-200 transform hover:scale-105`}>
            <h3 className={`text-4xl font-black mb-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>61.381</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'vi' ? 'Giải Đấu' : 'Tournaments'}
            </p>
          </div>
          <div className={`p-6 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-colors duration-200 transform hover:scale-105`}>
            <h3 className={`text-4xl font-black mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>341.683</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'vi' ? 'Đội Đấu' : 'Teams'}
            </p>
          </div>
          <div className={`p-6 ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-colors duration-200 transform hover:scale-105`}>
            <h3 className={`text-4xl font-black mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>2.035M+</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'vi' ? 'Trận Đấu' : 'Matches'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeDashboard;