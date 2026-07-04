import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Zap, Play, ArrowRight, Crown, Mail, Phone } from 'lucide-react';
import { tournamentApi, standingApi, knockoutApi } from '../../services/api';

/* ════════════════════════════════════════════════════════════
   HOME PAGE — Cinematic football hero
════════════════════════════════════════════════════════════ */
const HomePage = ({ darkMode, onNavigate }) => {
  const [videoError, setVideoError] = useState(false);
  const [champions, setChampions] = useState([]); // [{tournamentName, championName, championLogo}]
  const [expandedIdx, setExpandedIdx] = useState(null); // id giải đang mở Top 3
  const [activeIdx, setActiveIdx] = useState(0);   // card dang xem (cho dot indicator mobile)
  const scrollRef = useRef(null);
  const scrollRefDesktop = useRef(null);

  const VIDEO_SOURCES = [
    '/Video.mp4',
  ];

  // Bỏ 2 card "Xuất ảnh chất lượng cao" + "Phân quyền rõ ràng"
  const FEATURES = [
    { icon: '🏆', title: 'Quản lý giải đấu', desc: 'Tạo và quản lý nhiều giải đấu bóng đá cùng lúc.' },
    { icon: '⚽', title: 'Chia bảng tự động', desc: 'Chia đội vào bảng, tạo lịch đấu round-robin tự động.' },
    { icon: '📊', title: 'Bảng xếp hạng live', desc: 'Tính điểm, hiệu số, form 5 trận theo thời gian thực.' },
    { icon: '💰', title: 'Quản lý quỹ', desc: 'Theo dõi thu chi, lệ phí, tiền thưởng giải đấu.' },
  ];

  // Load nha vo dich: CHI giai "Hoan thanh". Goi API song song cho nhanh.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tournaments = await tournamentApi.getAll();
        // CHI lay giai da "Hoan thanh" (khong hien giai sap dien ra / dang dien ra)
        const finished = (tournaments || []).filter(t =>
          (t.status || '').toLowerCase().includes('hoàn thành') ||
          (t.status || '').toLowerCase().includes('hoan thanh') ||
          (t.status || '').toLowerCase() === 'completed'
        );
        if (finished.length === 0) { if (mounted) setChampions([]); return; }

        // Xu ly TAT CA giai SONG SONG (Promise.all) thay vi tuan tu -> nhanh hon nhieu
        const tasks = finished.map(async (t) => {
          try {
            const standings = await standingApi.get(t.id);
            const top3 = (standings || []).slice(0, 3).map(s => ({ name: s.name, logo: s.logo, points: s.Pts, played: s.P }));
            if (top3.length === 0) return null;

            let champName = top3[0].name;
            let champLogo = top3[0].logo;

            const fmt = (t.format || '').toLowerCase();
            if (fmt.includes('knockout') || fmt.includes('group')) {
              try {
                const koMatches = await knockoutApi.get(t.id);
                if (koMatches && koMatches.length > 0) {
                  const maxRound = Math.max(...koMatches.map(m => m.round));
                  const final = koMatches.find(m => m.round === maxRound
                    && m.homeScore != null && m.awayScore != null && m.homeScore !== m.awayScore);
                  if (final) {
                    const win = final.homeScore > final.awayScore
                      ? { name: final.homeName, logo: final.homeLogo }
                      : { name: final.awayName, logo: final.awayLogo };
                    if (win.name) { champName = win.name; champLogo = win.logo; }
                  }
                }
              } catch { /* giu dau BXH */ }
            }

            return {
              tournamentId: t.id,
              tournamentName: t.name,
              tournamentStatus: t.status,
              tournamentLogo: t.logo,
              championName: champName,
              championLogo: champLogo,
              points: top3[0].points,
              played: top3[0].played,
              top3,
            };
          } catch { return null; }
        });

        const settled = await Promise.all(tasks);
        const results = settled.filter(Boolean); // bo cac giai loi/khong co BXH
        if (mounted) setChampions(results);
      } catch (err) {
        console.warn('Load champions error:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Theo doi vi tri cuon de cap nhat dot indicator (mobile)
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / champions.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.min(idx, champions.length - 1));
  };

  // Bam dot -> cuon toi card do
  const scrollToCard = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / champions.length;
    el.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
  };

  const renderLogo = (logo) => {
    if (!logo) return <span style={{ fontSize: 28 }}>⚽</span>;
    if (logo.startsWith('http') || logo.startsWith('data:')) {
      return <img src={logo} alt="" className="w-full h-full object-cover rounded-full" />;
    }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: '100%', fontSize: 28, lineHeight: 1,
      }}>{logo}</span>
    );
  };

  // ── 1 the nha vo dich (dung chung cho carousel mobile + grid desktop) ──
  const ChampionCard = ({ c, i }) => {
    const isOpen = expandedIdx === c.tournamentId;
    const medal = ['🥇', '🥈', '🥉'];
    return (
    <div
      onClick={() => setExpandedIdx(isOpen ? null : c.tournamentId)}
      className="group relative p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 overflow-hidden cursor-pointer"
      style={{ animation: `fadeUp .5s ease-out ${i * 0.08 + 0.1}s both` }}>
      {/* Logo GIAI o goc phai (thay vuong mien) */}
      <div className="absolute top-3 right-3 w-11 h-11 rounded-xl bg-black/30 border border-amber-500/20 flex items-center justify-center overflow-hidden">
        {c.tournamentLogo && (String(c.tournamentLogo).startsWith('http') || String(c.tournamentLogo).startsWith('data:'))
          ? <img src={c.tournamentLogo} alt="" className="w-full h-full object-cover" />
          : c.tournamentLogo
            ? <span className="text-2xl">{c.tournamentLogo}</span>
            : <Crown size={24} className="text-amber-400/50" />}
      </div>

      {/* Ten giai */}
      <p className="text-xs uppercase tracking-widest text-amber-400/80 font-bold mb-3 pr-12">{c.tournamentName}</p>

      {/* Nha vo dich */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
          {renderLogo(c.championLogo)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-lg truncate">{c.championName}</p>
          <p className="text-amber-300/70 text-xs font-bold">🥇 Nhà Vô Địch</p>
        </div>
      </div>

      {/* Top 1/2/3 (hien khi bam vao) */}
      {isOpen && c.top3 && c.top3.length > 0 && (
        <div className="mb-4 space-y-1.5 rounded-xl bg-black/25 p-3 border border-amber-500/10" style={{ animation: 'fadeUp .25s ease-out both' }}>
          <p className="text-[10px] uppercase tracking-wider text-amber-400/60 font-bold mb-2">Bảng vinh danh</p>
          {c.top3.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="text-base w-6 text-center">{medal[idx]}</span>
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0">
                {renderLogo(t.logo)}
              </div>
              <span className="text-sm font-bold text-white truncate flex-1">{t.name}</span>
              <span className="text-xs font-black text-amber-400 shrink-0">{t.points} đ</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-amber-500/10">
        <div>
          <p className="text-amber-400 font-black text-lg leading-none">{c.points}</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wider">Điểm</p>
        </div>
        <div>
          <p className="text-white font-black text-lg leading-none">{c.played}</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wider">Trận</p>
        </div>
        {c.tournamentStatus && (
          <div className="ml-auto">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
              c.tournamentStatus === 'Hoàn thành'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              {c.tournamentStatus}
            </span>
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── VIDEO / HERO BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!videoError ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted loop playsInline
            onError={() => setVideoError(true)}
            style={{ filter: 'brightness(0.45) saturate(1.2)' }}
          >
            {VIDEO_SOURCES.map((src, i) => <source key={i} src={src} />)}
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#030810] via-[#051a0e] to-[#060d1f]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 40%, rgba(16,185,129,0.12) 0%, transparent 60%),
                               radial-gradient(ellipse 60% 80% at 80% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)`,
            }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#070d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-8"
          style={{ animation: 'fadeUp .6s ease-out both' }}>
          <Zap size={13} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Football Tournament Manager</span>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6" style={{ animation: 'fadeUp .7s ease-out .1s both' }}>
          <div className="relative">
            <img src="/logo.webp" alt="PNH Football"
              className="w-28 h-28 rounded-3xl object-cover shadow-2xl shadow-emerald-500/40"
              onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 items-center justify-center shadow-2xl shadow-emerald-500/40" style={{ display: 'none' }}>
              <Trophy size={48} className="text-white" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
              PNH <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">FOOTBALL</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 mt-2 font-light tracking-wide">
              Nền tảng quản lý giải đấu bóng đá chuyên nghiệp
            </p>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400 text-base md:text-lg leading-relaxed mb-10"
          style={{ animation: 'fadeUp .7s ease-out .2s both' }}>
          Tạo giải đấu, quản lý đội bóng, theo dõi kết quả và bảng xếp hạng — tất cả trong một hệ thống thống nhất, hiện đại.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4"
          style={{ animation: 'fadeUp .7s ease-out .35s both' }}>
          <button onClick={() => onNavigate('create')}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105">
            <Trophy size={20} />Tạo Giải Đấu
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onNavigate('tournaments')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/14 backdrop-blur-sm text-white font-black text-base transition-all hover:scale-105">
            <Play size={18} />Xem Giải Đấu
          </button>
          <button onClick={() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-base transition-all">
            <Mail size={18} />Liên Hệ
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-16"
          style={{ animation: 'fadeUp .7s ease-out .5s both' }}>
          {[['100+', 'Giải Đấu'], ['2.4K+', 'Đội Bóng'], ['15K+', 'Trận Đấu'], ['Free', 'Bắt Đầu']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{n}</p>
              <p className="text-sm text-slate-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-2 opacity-50" style={{ animation: 'fadeUp .7s ease-out .7s both' }}>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
          <span className="text-xs text-slate-500">Cuộn xuống</span>
        </div>
      </section>

      {/* ── FEATURES SECTION (4 cards, không có Xuất ảnh/Phân quyền) ── */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Tính Năng Nổi Bật</h2>
          <p className="text-slate-400">Mọi thứ bạn cần để điều hành một giải đấu bóng đá chuyên nghiệp</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="group p-6 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm hover:bg-white/8 hover:border-emerald-500/20 transition-all duration-300 cursor-default"
              style={{ animation: `fadeUp .5s ease-out ${i * 0.08 + 0.2}s both` }}>
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="text-white font-black mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHAMPIONS SECTION (carousel vuot tren mobile, grid tren desktop) ── */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm mb-4">
            <Crown size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Hall of Champions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">🏆 Nhà Vô Địch</h2>
          <p className="text-slate-400">Những đội bóng dẫn đầu các giải đấu trên hệ thống</p>
        </div>

        {champions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
            <Trophy size={42} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Chưa có nhà vô địch nào. Hãy tạo giải đấu đầu tiên!</p>
          </div>
        ) : (
          <>
            {/* MOBILE: carousel vuot ngang (1 the/man hinh, scroll-snap) */}
            <div className="md:hidden">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-6 px-6 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {champions.map((c, i) => (
                  <div key={c.tournamentId} className="snap-center shrink-0 w-[85%]">
                    <ChampionCard c={c} i={i} />
                  </div>
                ))}
              </div>
              {/* Dot indicator */}
              {champions.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {champions.map((_, i) => (
                    <button key={i} onClick={() => scrollToCard(i)}
                      className={`h-2 rounded-full transition-all ${activeIdx === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600'}`}
                      aria-label={`Xem nhà vô địch ${i + 1}`} />
                  ))}
                </div>
              )}
              <p className="text-center text-slate-500 text-xs mt-3">← Vuốt để xem nhà vô địch các giải →</p>
            </div>

            {/* DESKTOP: carousel vuot ngang (3 the/man hinh) */}
            <div className="hidden md:block">
              <div
                ref={scrollRefDesktop}
                className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {champions.map((c, i) => (
                  <div key={c.tournamentId} className="snap-start shrink-0 w-[calc(33.333%-14px)]">
                    <ChampionCard c={c} i={i} />
                  </div>
                ))}
              </div>
              {champions.length > 3 && (
                <p className="text-center text-slate-500 text-xs mt-3">← Vuốt / cuộn ngang để xem thêm →</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* ── FOOTER ĐA CỘT (phong cách chuyên nghiệp) ── */}
      <footer id="footer-contact" className="relative z-10 mt-10 border-t border-white/10 bg-[#070d1a]/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Cột 1: Thương hiệu */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.webp" alt="PNH" className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <div>
                  <p className="text-white font-black text-base leading-tight">PNH FOOTBALL</p>
                  <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">Tournament Manager</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nền tảng quản lý giải đấu bóng đá chuyên nghiệp — tạo giải, quản lý đội, theo dõi BXH trực tuyến.
              </p>
            </div>

            {/* Cột 2: Tính năng */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Tính Năng</h4>
              <ul className="space-y-2.5">
                {['Quản lý giải đấu', 'Chia bảng tự động', 'Bảng xếp hạng live', 'Xuất ảnh kết quả'].map(item => (
                  <li key={item}>
                    <span className="text-slate-400 text-sm hover:text-emerald-400 transition-colors cursor-default">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 3: Hỗ trợ */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Hướng dẫn sử dụng', action: () => onNavigate('home') },
                  { label: 'Tạo giải đấu mới', action: () => onNavigate('create') },
                  { label: 'Xem giải đấu', action: () => onNavigate('tournaments') },
                  { label: 'Đăng nhập / Đăng ký', action: () => onNavigate('auth') },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action} className="text-slate-400 text-sm hover:text-emerald-400 transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 4: Theo dõi / Liên hệ */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Theo Dõi & Liên Hệ</h4>

              {/* Icon mạng xã hội */}
              <div className="flex items-center gap-3 mb-5">
                {/* Facebook */}
                <a href="https://www.facebook.com/share/18bsC4tVEk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-blue-600/30"
                  title="Facebook">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Email */}
                <a href="mailto:phamngochung11012005@gmail.com"
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-emerald-600/30"
                  title="Email">
                  <Mail size={18} className="text-white" />
                </a>
                {/* Phone */}
                <a href="tel:0355382937"
                  className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-amber-500/30"
                  title="Gọi điện">
                  <Phone size={18} className="text-white" />
                </a>
              </div>

              {/* Thông tin chi tiết */}
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-400">
                  <Mail size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="break-all">phamngochung11012005@gmail.com</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone size={14} className="text-amber-400 shrink-0" />
                  <span>0355 382 937</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bản quyền */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-sm">© 2026 PNH Football Manager · Phạm Ngọc Hùng</p>
            <p className="text-slate-600 text-xs">Được xây dựng với ❤️ tại Việt Nam</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
};

export default HomePage;