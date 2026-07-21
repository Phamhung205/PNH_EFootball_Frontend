import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Sparkles, Hourglass, Calendar, Wrench, X } from 'lucide-react';
import { PlanBadge } from '../Layout';

const Subscription = ({ user, darkMode, language }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);

  // Modal thong bao "dang phat trien" khi bam nang cap
  const [devPlan, setDevPlan] = useState(null);

  const card = dm ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-800';
  const dim = dm ? 'text-slate-400' : 'text-slate-500';

  /* ── BANG GIA ──
     Gia dat theo dung nhung gi web LAM DUOC hien tai (khong hua tinh nang chua co).
     Doi gia: sua 'price' + 'yearly' ben duoi. */
  const PLANS = [
    {
      id: 'free',
      name: 'FREE',
      price: '0đ',
      period: tr('trọn đời', 'forever'),
      yearly: null,
      color: 'from-slate-600 to-slate-700 text-slate-300',
      border: dm ? 'border-slate-800 bg-slate-800/20' : 'border-slate-300 bg-slate-100/50',
      badge: tr('Gói Cơ Bản', 'Basic Plan'),
      accent: 'text-slate-400',
      features: [
        { label: tr('2 giải đấu hoạt động cùng lúc', '2 active tournaments at a time'), ok: true },
        { label: tr('Tối đa 16 đội mỗi giải', 'Up to 16 teams per tournament'), ok: true },
        { label: tr('Đủ 4 thể thức thi đấu', 'All 4 tournament formats'), ok: true },
        { label: tr('Lịch thi đấu & BXH tự động', 'Auto schedule & standings'), ok: true },
        { label: tr('Sơ đồ loại trực tiếp', 'Knockout bracket'), ok: true },
        { label: tr('Xuất ảnh (kèm logo PNH Football)', 'Image export (with PNH Football logo)'), ok: true },
        { label: tr('Chat trong giải & đăng ký tham dự', 'Tournament chat & registration'), ok: true },
        { label: tr('Trợ lý AI (20 tin nhắn/ngày)', 'AI assistant (20 messages/day)'), ok: true },
        { label: tr('Sao lưu & khôi phục dữ liệu giải', 'Backup & restore tournament data'), ok: false },
        { label: tr('Hỗ trợ ưu tiên', 'Priority support'), ok: false },
      ],
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '29.000đ',
      period: tr('tháng', 'month'),
      yearly: tr('hoặc 290.000đ/năm — tiết kiệm 2 tháng', 'or 290,000đ/year — save 2 months'),
      color: 'from-blue-600 to-violet-600 text-white shadow-blue-500/20',
      border: dm ? 'border-blue-500/40 bg-blue-900/10 shadow-lg shadow-blue-500/5' : 'border-blue-300 bg-blue-50/50 shadow-md',
      badge: tr('Phù Hợp Giải Lớp / CLB', 'For Class & Club Tournaments'),
      roleNote: tr('Tài khoản nâng lên BTC — được tạo & quản lý giải', 'Account upgraded to Organizer — can create & manage tournaments'),
      accent: 'text-blue-400',
      popular: true,
      features: [
        { label: tr('10 giải đấu hoạt động cùng lúc', '10 active tournaments at a time'), ok: true },
        { label: tr('Tối đa 32 đội mỗi giải', 'Up to 32 teams per tournament'), ok: true },
        { label: tr('Toàn bộ tính năng gói FREE', 'Everything in the FREE plan'), ok: true },
        { label: tr('Xuất ảnh không kèm logo', 'Image export without logo'), ok: true },
        { label: tr('Sao lưu & khôi phục dữ liệu giải', 'Backup & restore tournament data'), ok: true },
        { label: tr('Trợ lý AI không giới hạn', 'Unlimited AI assistant'), ok: true },
        { label: tr('Quản lý phí & quỹ nâng cao', 'Advanced fee & fund management'), ok: true },
        { label: tr('Huy hiệu PRO trên hồ sơ', 'PRO badge on your profile'), ok: true },
        { label: tr('Tùy biến ảnh nền & màu giải', 'Custom tournament background & colors'), ok: false },
        { label: tr('Hỗ trợ ưu tiên', 'Priority support'), ok: false },
      ],
    },
    {
      id: 'ultra',
      name: 'ULTRA',
      price: '59.000đ',
      period: tr('tháng', 'month'),
      yearly: tr('hoặc 590.000đ/năm — tiết kiệm 2 tháng', 'or 590,000đ/year — save 2 months'),
      color: 'from-amber-500 to-orange-500 text-white shadow-amber-500/20',
      border: dm ? 'border-amber-500/40 bg-amber-950/10 shadow-lg shadow-amber-500/10' : 'border-amber-300 bg-amber-50/50 shadow-md',
      badge: tr('Cho Ban Tổ Chức Chuyên', 'For Serious Organizers'),
      roleNote: tr('Tài khoản nâng lên BTC — được tạo & quản lý giải', 'Account upgraded to Organizer — can create & manage tournaments'),
      accent: 'text-amber-400',
      features: [
        { label: tr('Không giới hạn số giải đấu', 'Unlimited tournaments'), ok: true },
        { label: tr('Không giới hạn số đội', 'Unlimited teams'), ok: true },
        { label: tr('Toàn bộ tính năng gói PRO', 'Everything in the PRO plan'), ok: true },
        { label: tr('Tùy biến ảnh nền & màu giải', 'Custom tournament background & colors'), ok: true },
        { label: tr('Huy hiệu ULTRA nổi bật', 'Standout ULTRA badge'), ok: true },
        { label: tr('Ưu tiên dùng thử tính năng mới', 'Early access to new features'), ok: true },
        { label: tr('Hỗ trợ ưu tiên qua chat', 'Priority support via chat'), ok: true },
      ],
    },
  ];

  // Bam nang cap -> chua thanh toan duoc, chi hien thong bao dang phat trien
  const handleUpgradeClick = (plan) => {
    if (plan.id === 'free') return;
    setDevPlan(plan);
  };

  const calculateDaysRemaining = () => {
    if (!user?.planExpiry) return null;
    const diff = new Date(user.planExpiry).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const currentPlan = PLANS.find(p => p.id === (user?.plan || 'free')) || PLANS[0];
  const isPaidPlan = user?.plan && user.plan !== 'free';

  // ── TAM AN GOI DANG KY (COMING SOON) ──
  // Hien tai thu phi THEO TUNG GIAI (15k duoi 32 doi, 25k tu 32 doi tro len),
  // chua ban goi thang/nam. Man hinh goi giu lai nguyen ven ben duoi,
  // chi can doi COMING_SOON = false la bat lai duoc.
  const COMING_SOON = true;

  if (COMING_SOON) {
    return (
      <div className="p-6 max-w-2xl mx-auto" style={{ animation: 'fadeUp .25s ease-out both' }}>
        <div className={`rounded-3xl border p-8 text-center space-y-5 ${dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <CreditCard size={28} className="text-white" />
          </div>

          <div>
            <h1 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
              {tr('Gói Đăng Ký — Sắp Ra Mắt', 'Subscription Plans — Coming Soon')}
            </h1>
            <p className={`text-sm mt-2 ${dim}`}>
              {tr('Chúng tôi đang hoàn thiện các gói dịch vụ theo tháng và theo năm.',
                  'We are still finalising our monthly and yearly plans.')}
            </p>
          </div>

          {/* Cach tinh phi hien tai */}
          <div className={`rounded-2xl p-5 text-left space-y-3 ${dm ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
              {tr('Hiện tại tính phí theo từng giải', 'For now we charge per tournament')}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className={`text-xs ${dm ? 'text-white/70' : 'text-slate-600'}`}>
                  {tr('2 giải đầu tiên', 'First 2 tournaments')}
                </span>
                <span className="font-black text-emerald-400 text-sm">{tr('Miễn phí', 'Free')}</span>
              </div>

              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className={`text-xs ${dm ? 'text-white/70' : 'text-slate-600'}`}>
                  {tr('Giải dưới 32 đội', 'Under 32 teams')}
                </span>
                <span className="font-black text-amber-400 text-sm">15.000đ</span>
              </div>

              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className={`text-xs ${dm ? 'text-white/70' : 'text-slate-600'}`}>
                  {tr('Giải từ 32 đội trở lên', '32 teams or more')}
                </span>
                <span className="font-black text-amber-400 text-sm">25.000đ</span>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed ${dim}`}>
              {tr('Hệ thống tự tính phí theo số đội bạn nhập khi tạo giải. Vào tab Chia Bảng của giải để đăng ký kích hoạt.',
                  'The fee is calculated automatically from the number of teams you enter. Open the Groups tab of your tournament to activate it.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" style={{ animation: 'fadeUp .25s ease-out both' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            {tr('Gói Đăng Ký Dịch Vụ', 'Subscription Plans')}
          </h1>
          <p className={`text-xs ${dim}`}>
            {tr('Chọn gói phù hợp với quy mô giải đấu của bạn', 'Choose the plan that fits your tournament size')}
          </p>
        </div>
      </div>

      {/* ── The goi hien tai ── */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 ${card} flex flex-wrap justify-between items-center gap-6`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-black px-3 py-1 rounded-full bg-white/10 ${dm ? 'text-white' : 'text-slate-700'}`}>
              {tr('GÓI HIỆN TẠI', 'CURRENT PLAN')}
            </span>
            <PlanBadge plan={user?.plan || 'free'} />
          </div>

          <h2 className="text-3xl font-black tracking-tight">
            {tr(`Gói ${currentPlan.name}`, `${currentPlan.name} Plan`)}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {isPaidPlan ? (
              <>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${dim}`}>
                  <Calendar size={15} />
                  <span>
                    {tr('Hạn dùng đến', 'Valid until')}:{' '}
                    {new Date(user.planExpiry).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-xs font-black text-emerald-400">
                  <Hourglass size={12} />
                  <span>{tr(`Còn lại ${daysRemaining} ngày`, `${daysRemaining} days left`)}</span>
                </div>
              </>
            ) : (
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${dim}`}>
                <Sparkles size={15} className="text-amber-400" />
                <span>{tr('Dùng miễn phí, không giới hạn thời gian', 'Free to use, no time limit')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="z-10">
          {isPaidPlan ? (
            <div className="text-right">
              <span className={`text-xs ${dim} block mb-1`}>{tr('Trạng thái gói', 'Plan status')}</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                <ShieldCheck size={13} /> {tr('Đang hoạt động', 'Active')}
              </span>
            </div>
          ) : (
            <a href="#upgrade-section"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-sm hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all block text-center">
              {tr('Xem Các Gói', 'View Plans')}
            </a>
          )}
        </div>
      </div>

      {/* ── Bang gia: MOI nguoi dung deu xem duoc ── */}
      <div id="upgrade-section" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            {tr('Các Gói Dịch Vụ', 'Service Plans')}
          </h2>
          <p className={`text-sm ${dim} max-w-xl mx-auto`}>
            {tr('Gói FREE đã đủ dùng cho giải nhỏ. Nâng cấp khi bạn cần tổ chức nhiều giải hơn.',
                'The FREE plan is enough for small tournaments. Upgrade when you need to run more.')}
          </p>
        </div>

        {/* Bang thong bao: chua mo thanh toan */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold">
            <Wrench size={14} />
            {tr('Thanh toán đang được phát triển — hiện chưa thể nâng cấp',
                'Payment is under development — upgrades are not available yet')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map(p => {
            const isCurrent = (user?.plan || 'free') === p.id;
            return (
              <div key={p.id}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${p.border} ${card}`}>

                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow shadow-blue-500/30">
                    {tr('PHỔ BIẾN NHẤT', 'MOST POPULAR')}
                  </div>
                )}
                {!p.popular && p.id === 'ultra' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow shadow-amber-500/30">
                    {tr('KHÔNG GIỚI HẠN', 'UNLIMITED')}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase opacity-60 block">{p.badge}</span>
                      <span className={`text-2xl font-black ${p.accent}`}>{p.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                        {tr('ĐANG DÙNG', 'IN USE')}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight">{p.price}</span>
                      <span className={`text-xs ${dim}`}>/ {p.period}</span>
                    </div>
                    {p.yearly && <p className={`text-[10px] mt-1 ${dim}`}>{p.yearly}</p>}
                    {p.roleNote && (
                      <div className="mt-3 flex items-start gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                        <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] font-bold text-emerald-400 leading-snug">{p.roleNote}</span>
                      </div>
                    )}
                  </div>

                  <hr className={dm ? 'border-white/8' : 'border-slate-200'} />

                  <ul className="space-y-3">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-semibold">
                        {f.ok
                          ? <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          : <span className="text-red-500 shrink-0 mt-0.5">✕</span>}
                        <span className={f.ok ? (dm ? 'text-slate-300' : 'text-slate-700') : 'opacity-35 line-through'}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrent ? (
                    <button type="button" disabled
                      className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-xs font-bold cursor-not-allowed">
                      {tr('Đang sử dụng gói này', 'Currently using this plan')}
                    </button>
                  ) : p.id === 'free' ? (
                    <button type="button" disabled
                      className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-xs font-bold cursor-not-allowed">
                      {tr('Gói miễn phí mặc định', 'Default free plan')}
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleUpgradeClick(p)}
                      className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all active:scale-[0.97] bg-gradient-to-r ${p.color}`}>
                      {tr(`Nâng Cấp ${p.name}`, `Upgrade to ${p.name}`)}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal: tinh nang thanh toan dang phat trien ── */}
      {devPlan && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ animation: 'fadeIn .25s ease-out both' }}
          onClick={() => setDevPlan(null)}>

          <div className={`w-full max-w-sm rounded-3xl border overflow-hidden p-6 space-y-5 text-center ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            style={{ animation: 'scaleIn .2s ease-out both' }}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-end -mb-2">
              <button type="button" onClick={() => setDevPlan(null)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
                <X size={14} />
              </button>
            </div>

            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center">
                <Wrench size={30} className="text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black">{tr('Đang Phát Triển', 'Under Development')}</h3>
              <p className={`text-sm ${dim}`}>
                {tr('Tính năng thanh toán đang trong quá trình phát triển, hiện chưa thể thanh toán.',
                    'The payment feature is still under development and is not available yet.')}
              </p>
            </div>

            <div className={`space-y-2 px-4 py-3 rounded-xl border text-xs font-bold ${dm ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <div className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-left">{tr('Bạn vẫn dùng đầy đủ tính năng gói FREE', 'You still have full access to the FREE plan')}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-left">
                  {tr(`Khi mở bán, đăng ký ${devPlan.name} sẽ nâng tài khoản lên BTC để tạo giải.`,
                      `When available, subscribing to ${devPlan.name} will upgrade your account to Organizer so you can create tournaments.`)}
                </span>
              </div>
            </div>

            <button type="button" onClick={() => setDevPlan(null)}
              className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
              {tr('Đã Hiểu', 'Got It')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscription;