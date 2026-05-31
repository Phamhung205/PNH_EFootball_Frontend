import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Play, ArrowRight, Crown } from 'lucide-react';
import { tournamentApi, standingApi } from '../services/api';

/* ════════════════════════════════════════════════════════════
   HOME PAGE — Cinematic football hero
════════════════════════════════════════════════════════════ */
const HomePage = ({ darkMode, onNavigate }) => {
  const [videoError, setVideoError] = useState(false);
  const [champions, setChampions] = useState([]); // [{tournamentName, championName, championLogo}]

  const VIDEO_SOURCES = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
  ];

  // Bỏ 2 card "Xuất ảnh chất lượng cao" + "Phân quyền rõ ràng"
  const FEATURES = [
    { icon: '🏆', title: 'Quản lý giải đấu', desc: 'Tạo và quản lý nhiều giải đấu bóng đá cùng lúc.' },
    { icon: '⚽', title: 'Chia bảng tự động', desc: 'Chia đội vào bảng, tạo lịch đấu round-robin tự động.' },
    { icon: '📊', title: 'Bảng xếp hạng live', desc: 'Tính điểm, hiệu số, form 5 trận theo thời gian thực.' },
    { icon: '💰', title: 'Quản lý quỹ', desc: 'Theo dõi thu chi, lệ phí, tiền thưởng giải đấu.' },
  ];

  // Load tất cả nhà vô địch: với mỗi giải lấy BXH top 1
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tournaments = await tournamentApi.getAll();
        const results = [];
        for (const t of tournaments) {
          try {
            const standings = await standingApi.get(t.id);
            const top = standings?.[0];
            if (top) {
              results.push({
                tournamentId: t.id,
                tournamentName: t.name,
                tournamentStatus: t.status,
                championName: top.name,
                championLogo: top.logo,
                points: top.Pts,
                played: top.P,
              });
            }
          } catch { /* skip */ }
        }
        if (mounted) setChampions(results);
      } catch (err) {
        console.warn('Load champions error:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── VIDEO / HERO BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!videoError ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted loop playsInline
            onError={() => setVideoError(true)}
            style={{ filter: 'brightness(0.25) saturate(1.3)' }}
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
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <Trophy size={44} className="text-white" />
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
          <button onClick={() => onNavigate('auth')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-base transition-all">
            Đăng Nhập
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

      {/* ── CHAMPIONS SECTION (thay cho Plans) ── */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {champions.map((c, i) => (
              <div key={c.tournamentId}
                className="group relative p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-sm hover:border-amber-500/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                style={{ animation: `fadeUp .5s ease-out ${i * 0.08 + 0.1}s both` }}>
                {/* Crown decoration */}
                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Crown size={48} className="text-amber-400" />
                </div>

                {/* Tournament name */}
                <p className="text-xs uppercase tracking-widest text-amber-400/80 font-bold mb-3">{c.tournamentName}</p>

                {/* Champion */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
                    {renderLogo(c.championLogo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-lg truncate">{c.championName}</p>
                    <p className="text-amber-300/70 text-xs font-bold">🥇 Nhà Vô Địch</p>
                  </div>
                </div>

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
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/8 px-6 py-6 text-center">
        <p className="text-slate-500 text-sm">© 2026 PNH Football Manager · Được xây dựng bởi Nhóm 7</p>
      </footer>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
};

export default HomePage;