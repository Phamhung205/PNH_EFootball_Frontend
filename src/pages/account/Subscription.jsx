import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Zap, AlertCircle, Sparkles, QrCode, Hourglass, Calendar, Clock, Lock } from 'lucide-react';
import { PlanBadge } from '../Layout';

const Subscription = ({ user, onUpdateUser, darkMode, language }) => {
  const dm = darkMode;
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);

  // ── Phan biet admin / khach ──
  // Admin moi thay goi nang cap that. Khach -> Coming Soon.
  const roleVal = (user?.role || user?.Role || '').toString().toLowerCase();
  const isAdmin = roleVal === 'admin';

  const card = dm ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-800';
  const dim = dm ? 'text-slate-400' : 'text-slate-500';
  const label = dm ? 'text-slate-300 font-bold' : 'text-slate-700 font-bold';

  const PLANS = [
    {
      id: 'free',
      name: 'FREE',
      price: '0 VNĐ',
      period: 'trọn đời',
      color: 'from-slate-600 to-slate-700 text-slate-300',
      border: dm ? 'border-slate-800 bg-slate-800/20' : 'border-slate-300 bg-slate-100/50',
      badge: 'Gói Cơ Bản',
      accent: 'text-slate-400',
      features: [
        { label: 'Tối đa 1 giải đấu hoạt động', ok: true },
        { label: 'Tối đa 8 đội bóng mỗi giải', ok: true },
        { label: 'Bố cục thi đấu cơ bản', ok: true },
        { label: 'Xuất ảnh bảng xếp hạng (có Watermark)', ok: true },
        { label: 'Theme E-sports mặc định', ok: true },
        { label: 'Quỹ tài chính cơ bản', ok: true },
        { label: 'Upload logo chất lượng tiêu chuẩn', ok: false },
        { label: 'Tùy biến giao diện & Banner riêng', ok: false },
        { label: 'Không giới hạn giải đấu', ok: false },
      ]
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '50.000 VNĐ',
      period: '1 tháng',
      color: 'from-blue-600 to-violet-600 text-white shadow-blue-500/20',
      border: dm ? 'border-blue-500/40 bg-blue-900/10 shadow-lg shadow-blue-500/5' : 'border-blue-300 bg-blue-50/50 shadow-md',
      badge: 'Được Chọn Nhiều Nhất ⭐',
      accent: 'text-blue-400',
      popular: true,
      features: [
        { label: 'Tối đa 10 giải đấu hoạt động', ok: true },
        { label: 'Tối đa 32 đội bóng mỗi giải', ok: true },
        { label: 'Đầy đủ thể thức thi đấu', ok: true },
        { label: 'Xuất ảnh sắc nét không Watermark', ok: true },
        { label: 'Bộ theme E-sports Pro nâng cao', ok: true },
        { label: 'Lưu trữ lịch sử giải đấu lâu hơn', ok: true },
        { label: 'Upload logo chất lượng cao', ok: true },
        { label: 'Tùy biến giao diện & Banner riêng', ok: false },
        { label: 'Hỗ trợ kỹ thuật ưu tiên', ok: false },
      ]
    },
    {
      id: 'ultra',
      name: 'ULTRA',
      price: '100.000 VNĐ',
      period: '1 tháng',
      color: 'from-amber-500 to-orange-500 text-white shadow-amber-500/20',
      border: dm ? 'border-amber-500/40 bg-amber-950/10 shadow-lg shadow-amber-500/10' : 'border-amber-300 bg-amber-50/50 shadow-md',
      badge: 'Trải Nghiệm Đỉnh Cao ⚡',
      accent: 'text-amber-400',
      features: [
        { label: 'Không giới hạn số lượng giải đấu', ok: true },
        { label: 'Không giới hạn đội bóng', ok: true },
        { label: 'Đầy đủ thể thức & chia bảng auto', ok: true },
        { label: 'Xuất ảnh 4K UltraHD siêu nét', ok: true },
        { label: 'Sử dụng Video/Banner background riêng', ok: true },
        { label: 'Thống kê tài chính & quỹ nâng cao', ok: true },
        { label: 'Custom giao diện giải đấu theo ý muốn', ok: true },
        { label: 'Nhận Badge ULTRA tài khoản nổi bật', ok: true },
        { label: 'Máy chủ ưu tiên, hiệu năng tối đa', ok: true },
      ]
    }
  ];

  const handleUpgradeClick = (plan) => {
    if (plan.id === 'free') return;
    setShowPayment(plan);
  };

  const handleConfirmPayment = async () => {
    setConfirmingPayment(true);
    await new Promise(r => setTimeout(r, 1800));

    const newPlan = showPayment.id;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        plan: newPlan,
        planExpiry: expiry.toISOString(),
      });
    }

    setConfirmingPayment(false);
    setSuccessPlan(showPayment);
    setShowPayment(null);
    setTimeout(() => {
      setSuccessPlan(null);
    }, 3000);
  };

  const calculateDaysRemaining = () => {
    if (!user?.planExpiry) return null;
    const exp = new Date(user.planExpiry);
    const today = new Date();
    const diff = exp.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const currentPlan = PLANS.find(p => p.id === (user?.plan || 'free')) || PLANS[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" style={{ animation: 'fadeUp .25s ease-out both' }}>
      
      {/* Toast Success */}
      {successPlan && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-black shadow-2xl animate-bounce">
          <Sparkles size={20} className="animate-spin" />
          Nâng cấp gói thành công lên {successPlan.name}!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Gói Đăng Ký Dịch Vụ</h1>
          <p className={`text-xs ${dim}`}>Nâng tầm giải đấu bóng đá của bạn với các tính năng chuyên nghiệp</p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 ${card} flex flex-wrap justify-between items-center gap-6`}>
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-black px-3 py-1 rounded-full bg-white/10 ${dm ? 'text-white' : 'text-slate-700'}`}>
              GÓI HIỆN TẠI
            </span>
            <PlanBadge plan={user?.plan || 'free'} />
          </div>

          <h2 className="text-3xl font-black tracking-tight">
            Gói {currentPlan.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {user?.plan && user.plan !== 'free' ? (
              <>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${dim}`}>
                  <Calendar size={15} />
                  <span>Hạn dùng đến: {new Date(user.planExpiry).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-xs font-black text-emerald-400">
                  <Hourglass size={12} className="animate-spin" />
                  <span>Còn lại {daysRemaining} ngày</span>
                </div>
              </>
            ) : (
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${dim}`}>
                <Sparkles size={15} className="text-amber-400" />
                <span>Không giới hạn thời gian sử dụng dịch vụ cơ bản</span>
              </div>
            )}
          </div>
        </div>

        <div className="z-10">
          {user?.plan && user.plan !== 'free' ? (
            <div className="text-right">
              <span className={`text-xs ${dim} block mb-1`}>Trạng thái gói</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                <ShieldCheck size={13} /> Đang hoạt động
              </span>
            </div>
          ) : isAdmin ? (
            <a href="#upgrade-section" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-sm hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all block text-center">
              Xem Gói Nâng Cấp
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm">
              <Clock size={15} />
              Sắp Ra Mắt
            </div>
          )}
        </div>
      </div>

      {/* ── KHACH (khong phai admin): hien Coming Soon thay cho Plans ── */}
      {!isAdmin ? (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 via-orange-500/4 to-transparent p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock size={40} className="text-amber-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-black text-amber-400 tracking-widest uppercase">Coming Soon</span>
            </div>
            <h2 className={`text-3xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Gói Nâng Cấp Sắp Ra Mắt</h2>
            <p className={`text-sm max-w-md ${dim}`}>
              Các gói dịch vụ nâng cao (PRO, ULTRA) đang được hoàn thiện và sẽ sớm có mặt.
              Hiện tại bạn đang dùng gói FREE với đầy đủ tính năng cơ bản — hoàn toàn miễn phí!
            </p>
            <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${dm ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} text-sm font-bold`}>
              <Check size={15} className="text-emerald-400" />
              Bạn đang dùng đầy đủ tính năng miễn phí
            </div>
          </div>
        </div>
      ) : (
        /* ── ADMIN: hien day du Plans + nut nang cap ── */
        <div id="upgrade-section" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Các Gói Dịch Vụ Nổi Bật</h2>
            <p className={`text-sm ${dim} max-w-xl mx-auto`}>Chọn gói cước phù hợp nhất với quy mô giải đấu của bạn. Có thể hủy hoặc đổi gói bất cứ lúc nào.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(p => {
              const isCurrent = (user?.plan || 'free') === p.id;
              return (
                <div key={p.id}
                  className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${p.border} ${card}`}>
                  
                  {/* Popular Badge */}
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow shadow-blue-500/30">
                      BÁN CHẠY NHẤT
                    </div>
                  )}
                  {!p.popular && p.id === 'ultra' && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow shadow-amber-500/30">
                      SỨC MẠNH VÔ HẠN
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-black tracking-widest uppercase opacity-60 block`}>{p.badge}</span>
                        <span className={`text-2xl font-black ${p.accent}`}>{p.name}</span>
                      </div>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ĐANG SỬ DỤNG
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight">{p.price}</span>
                      <span className={`text-xs ${dim}`}>/ {p.period}</span>
                    </div>

                    <hr className={dm ? 'border-white/8' : 'border-slate-200'} />

                    {/* Features List */}
                    <ul className="space-y-3">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-semibold">
                          {f.ok ? (
                            <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                          )}
                          <span className={f.ok ? (dm ? 'text-slate-300' : 'text-slate-700') : 'opacity-35 line-through'}>
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upgrade Button */}
                  <div className="mt-8">
                    {isCurrent ? (
                      <button type="button" disabled
                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-xs font-bold cursor-not-allowed">
                        Đang sử dụng gói này
                      </button>
                    ) : p.id === 'free' ? (
                      <button type="button" disabled
                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-xs font-bold cursor-not-allowed">
                        Gói miễn phí mặc định
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleUpgradeClick(p)}
                        className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all active:scale-[0.97] bg-gradient-to-r ${p.color}`}>
                        Nâng Cấp Gói {p.name}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fake Payment QR Modal Overlay - chi admin moi mo duoc (showPayment chi set khi admin bam) */}
      {showPayment && isAdmin && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ animation: 'fadeIn .25s ease-out both' }}>
          
          <div className={`w-full max-w-md rounded-3xl border overflow-hidden p-6 space-y-6 ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            style={{ animation: 'scaleIn .2s ease-out both' }}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400 animate-spin" size={18} />
                <h3 className="text-base font-black">Nâng Cấp Gói {showPayment.name}</h3>
              </div>
              <button onClick={() => setShowPayment(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
                ✕
              </button>
            </div>

            {/* Price Row */}
            <div className={`p-4 rounded-2xl text-center ${dm ? 'bg-white/5' : 'bg-slate-50'}`}>
              <span className={`text-xs uppercase font-bold tracking-widest ${dim}`}>SỐ TIỀN THANH TOÁN</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{showPayment.price}</p>
              <p className={`text-[10px] mt-0.5 ${dim}`}>Hạn dùng: 30 ngày kể từ khi kích hoạt thành công</p>
            </div>

            {/* QR Mockup */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`p-4 rounded-3xl bg-white border border-slate-200 shadow-inner flex flex-col items-center`}>
                {/* Visual SVG QR Code */}
                <svg width="160" height="160" viewBox="0 0 100 100" className="text-slate-900 bg-white">
                  <path fill="currentColor" d="M0 0h30v30H0zm5 5v20h20V5zm45 0h20v20H50zm10 5v10h10V10zM0 50h30v30H0zm5 5v20h20V55zm50 0h20v10H55zm5 15h10v10H60zm20-20h15v15H80zm5 5v5h5v-5zm-75 5h10v10H10zm40 10h10v15H50zm15-40h10v10H65zm15-10h10v10H80zm-5 50h10v10H75zM15 15h5v5h-5zm0-5v5h5V10zm55 45h5v5h-5zm-55-15h5v5h-5z"/>
                  <rect x="38" y="38" width="24" height="24" rx="4" fill="#10b981" />
                  <Trophy x="44" y="44" width="12" height="12" className="text-white" />
                </svg>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                  <QrCode size={12} className="text-emerald-500" />
                  <span>Quét Mã QR Đóng Phí Tự Động</span>
                </div>
              </div>
              <p className={`text-[10px] text-center ${dim} max-w-[280px]`}>
                Mở ứng dụng Ngân hàng/Ví điện tử bất kỳ quét mã QR trên để thanh toán lệ phí nâng cấp.
              </p>
            </div>

            {/* Transfer Details Info */}
            <div className={`text-xs space-y-2 p-4 rounded-2xl border ${dm ? 'bg-white/3 border-white/6' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className={dim}>Ngân Hàng:</span>
                <span className="font-bold">MB Bank (Quân Đội)</span>
              </div>
              <div className="flex justify-between">
                <span className={dim}>Số Tài Khoản:</span>
                <span className="font-black text-cyan-400">0901234567</span>
              </div>
              <div className="flex justify-between">
                <span className={dim}>Chủ Tài Khoản:</span>
                <span className="font-bold">PHAM NGOC HUNG</span>
              </div>
              <div className="flex justify-between">
                <span className={dim}>Nội Dung Chuyển:</span>
                <span className="font-black text-amber-400">PNH UPGRADE {showPayment.name.toUpperCase()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPayment(null)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs border ${dm ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Hủy Giao Dịch
              </button>
              <button type="button" onClick={handleConfirmPayment} disabled={confirmingPayment}
                className="flex-2 flex-1 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20">
                {confirmingPayment ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Đang Xác Nhận...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Đã Chuyển Khoản</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Subscription;
