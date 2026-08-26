import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Trophy, ShieldCheck, Users, Gift, PlayCircle, 
  ChevronRight, ChevronLeft, ArrowUpRight, Crown, Mail, Phone, Zap
} from 'lucide-react';
import { tournamentApi, standingApi, knockoutApi } from '../../services/api';

/* ════════════════════════════════════════════════════════════
   HOME PAGE — Final Layout (Mobile & PC text pushed down, Arrows Fixed)
════════════════════════════════════════════════════════════ */
const HomePage = ({ darkMode, onNavigate, language = 'vi' }) => {
  const dm = darkMode; 
  const tr = (vi, en) => (language === 'en' ? en : vi);
  
  const heroRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const [recentTournaments, setRecentTournaments] = useState([]);
  const [champions, setChampions] = useState([]);
  const tScrollRef = useRef(null);

  // ─── XỬ LÝ 3D PARALLAX ───
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current || window.innerWidth < 1024) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setRotate({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // ─── API: TẢI DANH SÁCH GIẢI ĐẤU THẬT ───
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tournaments = await tournamentApi.getAll();
        if (!mounted) return;
        
        const sortedTournaments = (tournaments || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTournaments(sortedTournaments);

        const finished = sortedTournaments.filter(t =>
          (t.status || '').toLowerCase().includes('hoàn thành') ||
          (t.status || '').toLowerCase().includes('hoan thanh') ||
          (t.status || '').toLowerCase() === 'completed'
        );
        
        if (finished.length === 0) { if (mounted) setChampions([]); return; }

        const tasks = finished.map(async (t) => {
          try {
            let standings = [];
            try { standings = await standingApi.get(t.id) || []; } catch { standings = []; }

            const top3 = standings.slice(0, 3).map(s => ({ name: s.name, logo: s.logo, points: s.Pts, played: s.P }));
            let champName = top3[0]?.name || null;
            let champLogo = top3[0]?.logo || null;
            let finalTop3 = top3;

            const fmt = (t.format || '').toLowerCase();
            if (fmt.includes('knockout') || fmt.includes('group')) {
              try {
                const koMatches = await knockoutApi.get(t.id);
                if (koMatches && koMatches.length > 0) {
                  const winnerOf = (m) => {
                    if (m.homeScore == null || m.awayScore == null) return null;
                    if (m.homeScore !== m.awayScore) {
                      return m.homeScore > m.awayScore ? { name: m.homeName, logo: m.homeLogo } : { name: m.awayName, logo: m.awayLogo };
                    }
                    if (m.homePenalty != null && m.awayPenalty != null && m.homePenalty !== m.awayPenalty) {
                      return m.homePenalty > m.awayPenalty ? { name: m.homeName, logo: m.homeLogo } : { name: m.awayName, logo: m.awayLogo };
                    }
                    return null;
                  };
                  const loserOf = (m) => {
                    const w = winnerOf(m);
                    if (!w) return null;
                    return w.name === m.homeName ? { name: m.awayName, logo: m.awayLogo } : { name: m.homeName, logo: m.homeLogo };
                  };

                  const mainMatches = koMatches.filter(m => !m.isThirdPlace);
                  const maxRound = mainMatches.length > 0 ? Math.max(...mainMatches.map(m => m.round)) : null;
                  const final = maxRound != null ? mainMatches.find(m => m.round === maxRound) : null;

                  const champ = final ? winnerOf(final) : null;
                  const runnerUp = final ? loserOf(final) : null;
                  const thirdMatch = koMatches.find(m => m.isThirdPlace);
                  const third = thirdMatch ? winnerOf(thirdMatch) : null;

                  if (champ?.name) {
                    champName = champ.name;
                    champLogo = champ.logo;

                    const podium = [
                      { name: champ.name, logo: champ.logo },
                      runnerUp?.name ? { name: runnerUp.name, logo: runnerUp.logo } : null,
                      third?.name ? { name: third.name, logo: third.logo } : null,
                    ].filter(Boolean);

                    finalTop3 = podium.map(p => {
                      const st = (standings || []).find(x => x.name === p.name);
                      return { name: p.name, logo: p.logo, points: st?.Pts, played: st?.P };
                    });
                  }
                }
              } catch { /* ignore */ }
            }

            if (!champName && finalTop3.length === 0) return null;

            return {
              tournamentId: t.id,
              tournamentName: t.name,
              tournamentStatus: t.status,
              tournamentLogo: t.logo,
              organizerName: t.createdByName || '',
              organizerAvatar: t.createdByAvatar || '',
              championName: champName,
              championLogo: champLogo,
              points: finalTop3[0]?.points,
              played: finalTop3[0]?.played,
              top3: finalTop3,
            };
          } catch { return null; }
        });

        const settled = await Promise.all(tasks);
        const results = settled.filter(Boolean);
        if (mounted) setChampions(results);
      } catch (err) {
        console.warn('Load API error:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ─── XỬ LÝ CUỘN THANH GIẢI ĐẤU (Thanh chuyển tiếp) ───
  const scrollTournaments = (dir) => {
    if (tScrollRef.current) {
      const scrollAmount = 280; // Chiều rộng thẻ to + gap
      tScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const features = [
    { icon: Trophy, title: tr('Tạo giải dễ dàng','Easy Creation'), desc: tr('Tạo và quản lý giải đấu chỉ với vài bước đơn giản','Create and manage tournaments in a few simple steps') },
    { icon: ShieldCheck, title: tr('Quản lý minh bạch','Transparent Management'), desc: tr('Hệ thống tự động, chống gian lận tuyệt đối','Automated system, absolute anti-fraud') },
    { icon: Users, title: tr('Cộng đồng lớn mạnh','Strong Community'), desc: tr('Kết nối hàng ngàn game thủ eFootball trên toàn quốc','Connect thousands of eFootball gamers nationwide') },
    { icon: Gift, title: tr('Phần thưởng hấp dẫn','Attractive Rewards'), desc: tr('Giải thưởng giá trị và danh hiệu uy tín','Valuable prizes and prestigious titles') }
  ];

  const stats = [
    { icon: Trophy, value: '1,250+', label: tr('Giải đấu đã tổ chức','Tournaments hosted') },
    { icon: Users, value: '15,680+', label: tr('Game thủ tham gia','Gamers joined') },
    { icon: Gift, value: '250,000,000+', label: tr('Tổng giải thưởng (VND)','Total prize pool (VND)') }
  ];

  return (
    <div className={`relative min-h-screen flex flex-col overflow-x-hidden font-sans pb-20 transition-colors duration-300 ${dm ? 'bg-[#050914] text-white' : 'bg-[#f0f2f5] text-slate-900'}`}>
      
      {/* ─── 1. HERO SECTION (Luôn giữ tông Dark Mode cho ảnh) ─── */}
      <div 
        className="relative w-full h-[100dvh] lg:min-h-[100vh] flex flex-col justify-center overflow-hidden bg-[#050914] text-white"
        ref={heroRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 z-0 pointer-events-none perspective-[1200px]">
          <div 
            className="w-full h-full transition-transform duration-200 ease-out preserve-3d origin-center"
            style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.03)` }}
          >
            <img src="/back mobile.jpg" alt="Mobile Background" className="w-full h-full block lg:hidden opacity-100" style={{ objectFit: 'cover', objectPosition: 'left center' }} />
            <img src="/back 2.jpg" alt="PC Background" className="w-full h-full hidden lg:block opacity-100" style={{ objectFit: 'cover', objectPosition: 'left center' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/60 to-transparent w-[60%] hidden lg:block" />
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#050914] via-[#050914]/80 to-transparent lg:hidden" />
          </div>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full px-4 md:px-12 lg:px-20 h-full flex flex-col justify-end pb-20 lg:justify-end lg:pb-28 items-center lg:items-start text-center lg:text-left max-w-full">
          <div className="w-full max-w-[96vw] sm:max-w-[92vw] lg:max-w-[620px] text-center lg:text-left">
            <div className="text-slate-200 font-medium tracking-[3px] uppercase text-[10px] md:text-sm italic flex items-center justify-center lg:justify-start gap-2 mb-2 lg:mb-5">
              <span className="w-6 h-[1px] bg-cyan-400 hidden lg:block" />
              PNH FOOTBALL
            </div>
            <h1 className="text-[clamp(2.1rem,5vw,5.4rem)] leading-[0.94] tracking-[-0.05em] uppercase mb-2 lg:mb-5 max-w-full break-words font-black">
              <span className="block text-white drop-shadow-md">{tr('BỨT PHÁ GIỚI HẠN','BREAK LIMITS')}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ textShadow: '0 0 30px rgba(34,211,238,0.5)' }}>
                {tr('CHINH PHỤC ĐỈNH CAO','CONQUER THE PEAK')}
              </span>
            </h1>
            <p className="text-slate-100 text-xs sm:text-sm md:text-base lg:text-lg max-w-[90vw] sm:max-w-md lg:max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-md">
              {tr('Nền tảng tổ chức & quản lý giải đấu eFootball chuyên nghiệp, minh bạch và hấp dẫn nhất dành cho cộng đồng game thủ.', 'A professional, transparent, and engaging eFootball tournament platform for the gaming community.')}
            </p>
          </div>
          <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-3 pt-4 lg:pt-8">
            <button 
              onClick={() => onNavigate('create')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 lg:py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-sm uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95"
            >
              {tr('Tạo Giải Đấu Ngay', 'Create Tournament Now')} <ArrowUpRight size={18} strokeWidth={3} />
            </button>
            <button 
              onClick={() => onNavigate('tournaments')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 lg:py-4 rounded-xl bg-[#0f172a]/60 border border-slate-400 hover:bg-[#1e293b]/90 text-white font-bold text-sm uppercase transition-all active:scale-95 backdrop-blur-md"
            >
              {tr('Khám Phá Giải Đấu', 'Explore Tournaments')} <PlayCircle size={18} />
            </button>
          </div>
          <div className="flex lg:hidden items-center justify-center gap-2 pt-4">
             <span className="w-4 h-1.5 rounded-full bg-cyan-500" />
             <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* ─── 2. FEATURES GRID ─── */}
      <div className="relative z-20 px-4 md:px-12 lg:px-20 mb-16 mt-8 lg:-mt-16 pt-4 lg:pt-0">
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {features.map((feat, idx) => (
            <div key={idx} className={`snap-start shrink-0 w-[80vw] sm:w-[45vw] lg:w-auto flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-4 p-5 rounded-2xl backdrop-blur-md transition-all group cursor-pointer shadow-lg
              ${dm ? 'bg-[#0b1221]/90 border border-white/10 hover:border-cyan-500/50 hover:bg-[#131c33]' : 'bg-white border border-slate-200 hover:border-cyan-500 hover:bg-slate-50'}
            `}>
              <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 
                ${dm ? 'bg-transparent border border-white/10 group-hover:border-cyan-500/50 text-slate-300 group-hover:text-cyan-400' : 'bg-cyan-50 text-cyan-600 border border-cyan-100'}
              `}>
                <feat.icon size={26} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs md:text-[13px] font-black tracking-wide mb-1.5 mt-2 lg:mt-0 uppercase ${dm ? 'text-white' : 'text-slate-800'}`}>{feat.title}</h3>
                <p className={`text-[11px] md:text-xs leading-relaxed font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. MAIN CONTENT (GIẢI ĐẤU NỔI BẬT LỚN & CÓ MŨI TÊN TRƯỢT NGANG) ─── */}
      <div className="relative z-20 px-4 md:px-12 lg:px-20 flex flex-col lg:flex-row gap-6 mb-16 items-stretch min-w-0">
        
        {/* KHOI GIẢI ĐẤU NỔI BẬT */}
        <div className={`flex-1 min-w-0 rounded-[24px] p-5 md:p-7 flex flex-col relative shadow-lg
          ${dm ? 'bg-[#0b1221]/90 border border-white/5' : 'bg-white border border-slate-200'}
        `}>
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className={`text-base md:text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('GIẢI ĐẤU NỔI BẬT', 'FEATURED TOURNAMENTS')}</h2>
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-500 text-[10px] font-black tracking-widest uppercase">LIVE</span>
            </div>
          </div>

          {/* Wrapper chứa thanh trượt và nút điều hướng */}
          <div className="relative flex-1 flex items-center min-w-0 group/slider">
            
            {/* Nút mũi tên Trái / Phải trượt card */}
            <button onClick={() => scrollTournaments(-1)} className={`absolute left-0 lg:left-[-16px] top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-100 lg:opacity-0 group-hover/slider:opacity-100 shadow-xl
              ${dm ? 'bg-[#152033] border border-white/10 text-white hover:bg-cyan-500' : 'bg-white border border-slate-200 text-slate-800 hover:bg-cyan-500 hover:text-white'}
            `}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollTournaments(1)} className={`absolute right-0 lg:right-[-16px] top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-100 lg:opacity-0 group-hover/slider:opacity-100 shadow-xl
              ${dm ? 'bg-[#152033] border border-white/10 text-white hover:bg-cyan-500' : 'bg-white border border-slate-200 text-slate-800 hover:bg-cyan-500 hover:text-white'}
            `}>
              <ChevronRight size={20} />
            </button>

            {/* Danh sách thẻ giải đấu */}
            <div ref={tScrollRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide w-full pb-2 px-2 lg:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {recentTournaments.length > 0 ? (
                recentTournaments.map((t) => {
                  const statusStr = (t.status || '').toLowerCase();
                  const isOngoing = statusStr.includes('đang');
                  const isCompleted = statusStr.includes('hoàn');
                  
                  const hasLogo = t.logo && t.logo.trim().length > 0;
                  const isUrl = hasLogo && (t.logo.includes('http') || t.logo.includes('data:') || t.logo.includes('/'));
                  const fallbackText = (hasLogo && !isUrl && t.logo.length <= 6) ? t.logo : (t.shortName || t.name.substring(0, 3)).toUpperCase();

                  return (
                    <div key={t.id} onClick={() => onNavigate('tournaments')} 
                      className={`snap-start shrink-0 w-[240px] lg:w-[280px] rounded-[16px] transition-all cursor-pointer flex flex-col overflow-hidden group/card
                        ${dm ? 'border border-white/5 bg-[#0f172a] hover:border-cyan-500/30' : 'border border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-white shadow-sm'}
                      `}>
                      
                      <div className="h-[150px] w-full relative flex flex-col items-center justify-center bg-[#060b14] overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-t z-10 opacity-90 ${dm ? 'from-[#0f172a] to-transparent' : 'from-slate-50 to-transparent'}`} />
                        
                        {isUrl ? (
                          <>
                            <img 
                              src={t.logo} 
                              alt={t.name} 
                              className="w-full h-full object-cover relative z-0 group-hover/card:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full absolute inset-0 hidden flex-col items-center justify-center z-0 p-2">
                              <Trophy size={44} className={`mb-2 transition-colors ${dm ? 'text-slate-700 group-hover/card:text-cyan-500/50' : 'text-slate-300 group-hover/card:text-cyan-400'}`} />
                              <span className={`text-2xl font-black uppercase truncate max-w-full px-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{fallbackText}</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center z-0 p-2">
                            <Trophy size={44} className={`mb-2 transition-colors ${dm ? 'text-slate-700 group-hover/card:text-cyan-500/50' : 'text-slate-300 group-hover/card:text-cyan-400'}`} />
                            <span className={`text-2xl font-black uppercase truncate max-w-full px-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{fallbackText}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 pt-4 flex-1 flex flex-col relative z-20">
                        <h3 className={`text-sm font-black mb-3 truncate uppercase tracking-wide ${dm ? 'text-white' : 'text-slate-900'}`}>{t.name}</h3>
                        
                        <div className={`flex items-center justify-between text-xs font-medium mb-5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1.5"><Users size={16} className="text-cyan-500" /> {t.participantCount || t.teams?.length || 0} đội</span>
                          <span className="flex items-center gap-1.5"><Gift size={16} className="text-cyan-500" /> {t.fee === 0 ? 'Miễn phí' : (t.prize || 'Cúp vô địch')}</span>
                        </div>

                        <div className="mt-auto">
                          <span className={`inline-block px-3 py-1.5 rounded text-[11px] font-bold tracking-wider ${
                            isOngoing ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' :
                            isCompleted ? 'text-slate-500 bg-slate-500/10 border border-slate-500/20' :
                            'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            {t.status || 'Sắp khởi tranh'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-10 text-slate-500 text-sm">
                  {tr('Chưa có giải đấu nào trong hệ thống.', 'No tournaments available in the system.')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KHỐI THỐNG KÊ NỔI BẬT */}
        <div className={`w-full lg:w-[320px] shrink-0 rounded-[24px] p-6 md:p-8 flex flex-col shadow-lg
          ${dm ? 'bg-[#0b1320] border border-white/5' : 'bg-white border border-slate-200'}
        `}>
          <h2 className="text-base font-black uppercase tracking-wider text-cyan-500 mb-8">{tr('THỐNG KÊ NỔI BẬT', 'KEY STATISTICS')}</h2>
          <div className="space-y-7 flex-1 flex flex-col justify-center">
            {stats.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0
                  ${dm ? 'border-white/5 bg-[#0f172a] text-cyan-400' : 'border-cyan-100 bg-cyan-50 text-cyan-500'}
                `}>
                  <s.icon size={20} />
                </div>
                <div>
                  <div className={`text-xl md:text-2xl font-black tracking-tight leading-none mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
                  <div className={`text-[11px] font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 4. CHAMPIONS SECTION (TẠM ẨN) ─── */}

      {/* ─── 5. FOOTER ĐA CỘT ─── */}
      <footer id="footer-contact" className={`relative z-10 mt-10 border-t backdrop-blur-sm
        ${dm ? 'border-white/10 bg-[#070d1a]/60 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}
      `}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.webp" alt="PNH" className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <div>
                  <p className={`font-black text-base leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>PNH FOOTBALL</p>
                  <p className="text-cyan-500 text-[10px] font-bold tracking-widest uppercase">Tournament Manager</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                {tr('Nền tảng quản lý giải đấu bóng đá chuyên nghiệp — tạo giải, quản lý đội, theo dõi BXH trực tuyến.','A professional football tournament platform — create tournaments, manage teams, track standings online.')}
              </p>
            </div>

            <div>
              <h4 className={`font-black text-sm uppercase tracking-wider mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Tính Năng','Features')}</h4>
              <ul className="space-y-2.5">
                {[tr('Quản lý giải đấu','Tournament management'), tr('Chia bảng tự động','Auto group draw'), tr('Bảng xếp hạng live','Live standings'), tr('Xuất ảnh kết quả','Export result image')].map(item => (
                  <li key={item}>
                    <span className="text-sm hover:text-cyan-500 transition-colors cursor-default">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-black text-sm uppercase tracking-wider mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Hỗ Trợ','Support')}</h4>
              <ul className="space-y-2.5">
                {[
                  { label: tr('Hướng dẫn sử dụng','User guide'), action: () => onNavigate('home') },
                  { label: tr('Tạo giải đấu mới','Create new tournament'), action: () => onNavigate('create') },
                  { label: tr('Xem giải đấu','View tournaments'), action: () => onNavigate('tournaments') },
                  { label: tr('Đăng nhập / Đăng ký','Log in / Sign up'), action: () => onNavigate('auth') },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action} className="text-sm hover:text-cyan-500 transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-black text-sm uppercase tracking-wider mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Theo Dõi & Liên Hệ','Follow & Contact')}</h4>
              <div className="flex items-center gap-3 mb-5">
                <a href="https://www.facebook.com/share/18bsC4tVEk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  title="Facebook">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="mailto:phamngochung11012005@gmail.com"
                  className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  title="Email">
                  <Mail size={18} />
                </a>
                <a href="tel:0355382937"
                  className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  title={tr('Gọi điện','Call')}>
                  <Phone size={18} />
                </a>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Mail size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                  <span className="break-all">phamngochung11012005@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-cyan-500 shrink-0" />
                  <span>0355 382 937</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs
            ${dm ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-500'}
          `}>
            <p>© 2026 PNH Football Manager · Phạm Ngọc Hùng</p>
            <p>{tr('Được xây dựng với ❤️ tại Việt Nam','Built with ❤️ in Vietnam')}</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default HomePage;