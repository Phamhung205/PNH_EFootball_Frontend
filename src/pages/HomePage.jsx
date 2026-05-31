import React from 'react';
import { Trophy, Zap, Users, BarChart3, ArrowRight, Gamepad2, Star, Shield } from 'lucide-react';

const T = {
  vi: {
    badge: '⚡ E-SPORTS PLATFORM',
    h1a: 'QUẢN LÝ GIẢI ĐẤU', h1b: 'CHUYÊN NGHIỆP',
    sub: 'Nền tảng tổ chức và quản lý giải đấu bóng đá E-sports hàng đầu. Dễ sử dụng, hiệu quả, chuyên nghiệp.',
    createBtn: 'Tạo Giải Đấu', dashBtn: '🎮 Admin Panel',
    stat1: 'Giải Đấu', stat2: 'Đội Tham Dự', stat3: 'Trận Đấu',
    f1t: 'Thiết Lập Nhanh',       f1d: 'Tạo giải đấu chỉ trong vài phút với giao diện trực quan.',
    f2t: 'Bốc Thăm Thông Minh',   f2d: 'Hệ thống bốc thăm chia bảng tự động, công bằng và minh bạch.',
    f3t: 'Cập Nhật Thời Gian Thực',f3d: 'Kết quả và bảng xếp hạng cập nhật ngay sau mỗi trận.',
    f4t: 'Báo Cáo Chuyên Nghiệp', f4d: 'Xuất báo cáo PDF/Excel đẹp mắt cho mọi giải đấu.',
    ctaT: 'Sẵn sàng bắt đầu?', ctaS: 'Tạo giải đấu đầu tiên của bạn ngay hôm nay — hoàn toàn miễn phí.', ctaBtn: 'Bắt Đầu Ngay',
  },
  en: {
    badge: '⚡ E-SPORTS PLATFORM',
    h1a: 'TOURNAMENT', h1b: 'MANAGEMENT PRO',
    sub: 'The leading platform for organizing and managing e-sports football tournaments.',
    createBtn: 'Create Tournament', dashBtn: '🎮 Admin Panel',
    stat1: 'Tournaments', stat2: 'Teams', stat3: 'Matches',
    f1t: 'Quick Setup',    f1d: 'Create a tournament in minutes with an intuitive interface.',
    f2t: 'Smart Draw',     f2d: 'Automatic group draw system — fair and transparent.',
    f3t: 'Real-time',      f3d: 'Results and standings updated immediately after each match.',
    f4t: 'Pro Reports',    f4d: 'Export beautiful PDF/Excel reports for every tournament.',
    ctaT: 'Ready to start?', ctaS: 'Create your first tournament today — completely free.', ctaBtn: 'Get Started',
  },
};

const features = [
  { key:'f1', icon: Zap,       color:'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', bgLight: 'bg-emerald-50 border-emerald-200' },
  { key:'f2', icon: Gamepad2,  color:'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',       bgLight: 'bg-cyan-50 border-cyan-200' },
  { key:'f3', icon: BarChart3, color:'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20',   bgLight: 'bg-purple-50 border-purple-200' },
  { key:'f4', icon: Star,      color:'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     bgLight: 'bg-amber-50 border-amber-200' },
];

const HomePage = ({ darkMode = true, language = 'vi', onNavigate }) => {
  const t = T[language] || T.vi;
  const dm = darkMode;

  return (
    <div className={`min-h-[calc(100vh-4rem)] transition-colors duration-300 ${dm ? 'text-white' : 'text-slate-900'}`}>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[130px] pointer-events-none ${dm ? 'bg-emerald-500/15' : 'bg-emerald-300/20'}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[130px] pointer-events-none ${dm ? 'bg-cyan-500/15' : 'bg-blue-300/20'}`} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-8 border ${dm ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'}`}>
            {t.badge}
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">{t.h1a}</span>
            <br />
            <span className={dm ? 'text-white' : 'text-slate-900'}>{t.h1b}</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{t.sub}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('create')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 active:scale-95 text-base">
              <Trophy size={20} />{t.createBtn}<ArrowRight size={18} />
            </button>
            <button onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 font-bold px-8 py-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-base ${dm ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-emerald-500/50' : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 hover:border-emerald-400'}`}>
              {t.dashBtn}
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { v:'61,381',  k:'stat1', grad:'from-emerald-400 to-cyan-400' },
            { v:'341,683', k:'stat2', grad:'from-cyan-400 to-blue-400' },
            { v:'2.04M+',  k:'stat3', grad:'from-purple-400 to-pink-400' },
          ].map(s => (
            <div key={s.k} className={`rounded-2xl p-6 text-center border transition-all hover:scale-[1.02] ${dm ? 'bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
              <p className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-1`}>{s.v}</p>
              <p className={`text-sm font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t[s.k]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto mb-16">
        <div className={`rounded-3xl overflow-hidden border shadow-2xl p-1.5 ${dm ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/50' : 'bg-gradient-to-b from-slate-200 to-slate-300 border-slate-300'}`}>
          <video controls autoPlay muted playsInline className="w-full aspect-video rounded-[1.4rem] bg-black"
            src="/AQO6ok1GMVaFRytRPjWwqp91tYpnmWRJeSumZccTxitWxKLFUBVJOglH-JZtBGHMlLPg5S8ayJPpvGl7vKGlLHf0sKtu-VpN23b5b7lMQA.mp4" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.key} className={`border rounded-2xl p-6 hover:scale-[1.03] transition-all duration-200 ${dm ? `${f.bg} backdrop-blur-sm` : `${f.bgLight} bg-white shadow-sm hover:shadow-md`}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${dm ? f.bg : f.bgLight}`}>
                  <Icon size={22} className={f.color} />
                </div>
                <h3 className={`font-bold mb-2 text-base ${dm ? 'text-white' : 'text-slate-900'}`}>{t[`${f.key}t`]}</h3>
                <p className={`text-sm leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{t[`${f.key}d`]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto mb-16">
        <div className={`relative rounded-3xl p-10 text-center overflow-hidden border ${dm ? 'bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200'}`}>
          <Trophy size={40} className="text-emerald-400 mx-auto mb-4" />
          <h2 className={`text-3xl font-black mb-3 ${dm ? 'text-white' : 'text-slate-900'}`}>{t.ctaT}</h2>
          <p className={`mb-8 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{t.ctaS}</p>
          <button onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
            {t.ctaBtn} <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
