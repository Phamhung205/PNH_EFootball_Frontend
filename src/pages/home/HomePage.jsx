import React, { useState } from 'react';
import { Trophy, Zap, ChevronRight, Play, ArrowRight } from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   HOME PAGE — Cinematic football hero with video bg
════════════════════════════════════════════════════════════ */
const HomePage = ({ darkMode, onNavigate }) => {
  const [videoError, setVideoError] = useState(false);

  // Public domain football footage sources (multiple fallbacks)
  const VIDEO_SOURCES = [
    'https://www.w3schools.com/html/mov_bbb.mp4', // fallback test video
  ];

  const FEATURES = [
    { icon:'🏆', title:'Quản lý giải đấu', desc:'Tạo và quản lý nhiều giải đấu bóng đá cùng lúc.' },
    { icon:'⚽', title:'Chia bảng tự động', desc:'Chia đội vào bảng, tạo lịch đấu round-robin tự động.' },
    { icon:'📊', title:'Bảng xếp hạng live', desc:'Tính điểm, hiệu số, form 5 trận theo thời gian thực.' },
    { icon:'💰', title:'Quản lý quỹ', desc:'Theo dõi thu chi, lệ phí, tiền thưởng giải đấu.' },
    { icon:'🖼️', title:'Xuất ảnh chất lượng cao', desc:'Export BXH, kết quả, banner dưới dạng PNG/JPG.' },
    { icon:'🔐', title:'Phân quyền rõ ràng', desc:'Admin/User với quyền khác nhau cho từng giải đấu.' },
  ];

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
          /* Fallback: CSS animated gradient */
          <div className="absolute inset-0 bg-gradient-to-br from-[#030810] via-[#051a0e] to-[#060d1f]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 40%, rgba(16,185,129,0.12) 0%, transparent 60%),
                               radial-gradient(ellipse 60% 80% at 80% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)`,
            }} />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#070d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-14">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-8"
          style={{ animation: 'fadeUp .6s ease-out both' }}>
          <Zap size={13} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Football Tournament Manager</span>
        </div>

        {/* Logo + Name */}
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

        {/* Description */}
        <p className="max-w-2xl text-slate-400 text-base md:text-lg leading-relaxed mb-10"
          style={{ animation: 'fadeUp .7s ease-out .2s both' }}>
          Tạo giải đấu, quản lý đội bóng, theo dõi kết quả và bảng xếp hạng — tất cả trong một hệ thống thống nhất, hiện đại.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4"
          style={{ animation: 'fadeUp .7s ease-out .35s both' }}>
          <button onClick={() => onNavigate('create')}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105">
            <Trophy size={20} />
            Tạo Giải Đấu
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onNavigate('tournaments')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/14 backdrop-blur-sm text-white font-black text-base transition-all hover:scale-105">
            <Play size={18} />
            Xem Giải Đấu
          </button>
          <button onClick={() => onNavigate('auth')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-base transition-all">
            Đăng Nhập
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16"
          style={{ animation: 'fadeUp .7s ease-out .5s both' }}>
          {[['100+','Giải Đấu'],['2.4K+','Đội Bóng'],['15K+','Trận Đấu'],['Free','Bắt Đầu']].map(([n,l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{n}</p>
              <p className="text-sm text-slate-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-50" style={{ animation: 'fadeUp .7s ease-out .7s both' }}>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
          <span className="text-xs text-slate-500">Cuộn xuống</span>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Tính Năng Nổi Bật</h2>
          <p className="text-slate-400">Mọi thứ bạn cần để điều hành một giải đấu bóng đá chuyên nghiệp</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* ── PLANS PREVIEW ── */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2">Chọn Gói Phù Hợp</h2>
          <p className="text-slate-400">Bắt đầu miễn phí, nâng cấp khi cần</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { plan:'FREE',  price:'0đ/tháng',    color:'border-slate-700 bg-slate-800/50', accent:'text-slate-300',  features:['1 giải đấu','8 đội tối đa','Export có watermark'] },
            { plan:'PRO',   price:'50.000đ/tháng', color:'border-blue-500/40 bg-blue-600/10', accent:'text-blue-400', popular:true, features:['10 giải đấu','32 đội','Export không watermark','Themes nâng cao'] },
            { plan:'ULTRA', price:'100.000đ/tháng',color:'border-amber-500/40 bg-amber-600/10', accent:'text-amber-400', features:['Không giới hạn','Export 4K','Custom banner','Thống kê nâng cao','Badge ULTRA ⚡'] },
          ].map(p => (
            <div key={p.plan} className={`relative rounded-2xl border p-6 ${p.color} ${p.popular?'scale-105 shadow-2xl shadow-blue-500/20':''}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500 text-white">PHỔ BIẾN NHẤT</div>}
              <p className={`text-xl font-black ${p.accent} mb-1`}>{p.plan}</p>
              <p className="text-white font-bold text-lg mb-4">{p.price}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><span className="text-emerald-400">✓</span>{f}</li>)}
              </ul>
              <button onClick={() => onNavigate('auth')}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${p.popular ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border border-white/10 text-white hover:bg-white/8'}`}>
                {p.plan === 'FREE' ? 'Bắt Đầu Ngay' : `Nâng Cấp ${p.plan}`}
              </button>
            </div>
          ))}
        </div>
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
