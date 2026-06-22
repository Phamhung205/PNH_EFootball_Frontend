import React, { useState } from 'react';
import { Crown, Zap, Rocket, Check, X, Sparkles } from 'lucide-react';

const translations = {
  vi: {
    title: 'Nâng Cấp Gói Của Bạn',
    subtitle: 'Chọn gói phù hợp để mở khóa toàn bộ tính năng',
    monthly: 'Hàng Tháng',
    yearly: 'Hàng Năm',
    yearlyDiscount: 'Tiết kiệm 20%',
    month: '/tháng',
    year: '/năm',
    free: 'Miễn Phí',
    pro: 'Pro',
    premium: 'Premium',
    currentPlan: 'Gói Hiện Tại',
    upgradePro: 'Nâng Cấp Pro',
    upgradePremium: 'Nâng Cấp Premium',
    popularLabel: 'Phổ Biến Nhất',
    features: {
      free: [
        { text: '1 giải đấu', included: true },
        { text: '8 đội tối đa', included: true },
        { text: 'Bảng xếp hạng cơ bản', included: true },
        { text: 'Hỗ trợ email', included: true },
        { text: 'Bốc thăm tự động', included: false },
        { text: 'Xuất báo cáo PDF', included: false },
      ],
      pro: [
        { text: '5 giải đấu', included: true },
        { text: '32 đội tối đa', included: true },
        { text: 'Bảng xếp hạng nâng cao', included: true },
        { text: 'Bốc thăm tự động', included: true },
        { text: 'Xuất báo cáo PDF', included: true },
        { text: 'Hỗ trợ ưu tiên', included: true },
      ],
      premium: [
        { text: 'Unlimited giải đấu', included: true },
        { text: 'Unlimited đội', included: true },
        { text: 'Tất cả tính năng Pro', included: true },
        { text: 'API access', included: true },
        { text: 'Hỗ trợ 24/7', included: true },
        { text: 'Custom branding', included: true },
      ],
    },
  },
  en: {
    title: 'Upgrade Your Plan',
    subtitle: 'Choose the right plan to unlock all features',
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyDiscount: 'Save 20%',
    month: '/month',
    year: '/year',
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
    currentPlan: 'Current Plan',
    upgradePro: 'Upgrade to Pro',
    upgradePremium: 'Upgrade to Premium',
    popularLabel: 'Most Popular',
    features: {
      free: [
        { text: '1 tournament', included: true },
        { text: 'Max 8 teams', included: true },
        { text: 'Basic standings', included: true },
        { text: 'Email support', included: true },
        { text: 'Auto draw', included: false },
        { text: 'PDF export', included: false },
      ],
      pro: [
        { text: '5 tournaments', included: true },
        { text: 'Max 32 teams', included: true },
        { text: 'Advanced standings', included: true },
        { text: 'Auto draw', included: true },
        { text: 'PDF report export', included: true },
        { text: 'Priority support', included: true },
      ],
      premium: [
        { text: 'Unlimited tournaments', included: true },
        { text: 'Unlimited teams', included: true },
        { text: 'All Pro features', included: true },
        { text: 'API access', included: true },
        { text: '24/7 support', included: true },
        { text: 'Custom branding', included: true },
      ],
    },
  },
};

const prices = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 199000, yearly: 199000 * 12 * 0.8 },
  premium: { monthly: 499000, yearly: 499000 * 12 * 0.8 },
};

function formatVND(amount) {
  if (amount === 0) return '0';
  return Math.round(amount).toLocaleString('vi-VN');
}

export default function Upgrade({ darkMode = true, language = 'vi' }) {
  const [isYearly, setIsYearly] = useState(false);
  const t = translations[language] || translations.vi;

  const plans = [
    {
      key: 'free',
      name: t.free,
      icon: Zap,
      iconColor: 'text-slate-400',
      price: isYearly ? prices.free.yearly : prices.free.monthly,
      features: t.features.free,
      cta: t.currentPlan,
      isPopular: false,
      isPremium: false,
      disabled: true,
      cardBorder: 'border-slate-700/50',
      btnClass:
        'bg-slate-800 text-slate-400 cursor-default font-bold px-6 py-3 rounded-xl',
    },
    {
      key: 'pro',
      name: t.pro,
      icon: Crown,
      iconColor: 'text-emerald-400',
      price: isYearly ? prices.pro.yearly : prices.pro.monthly,
      features: t.features.pro,
      cta: t.upgradePro,
      isPopular: true,
      isPremium: false,
      disabled: false,
      cardBorder:
        'border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      btnClass:
        'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]',
    },
    {
      key: 'premium',
      name: t.premium,
      icon: Rocket,
      iconColor: 'text-purple-400',
      price: isYearly ? prices.premium.yearly : prices.premium.monthly,
      features: t.features.premium,
      cta: t.upgradePremium,
      isPopular: false,
      isPremium: true,
      disabled: false,
      cardBorder: 'border-purple-500/40',
      btnClass:
        'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]',
    },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-slate-400">{t.subtitle}</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span
              className={`text-sm font-semibold transition-colors ${
                !isYearly ? 'text-white' : 'text-slate-500'
              }`}
            >
              {t.monthly}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isYearly
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  isYearly ? 'left-8' : 'left-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${
                isYearly ? 'text-white' : 'text-slate-500'
              }`}
            >
              {t.yearly}
            </span>
            {isYearly && (
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full animate-pulse">
                {t.yearlyDiscount}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  plan.cardBorder
                } ${plan.isPopular ? 'md:-mt-4 md:pb-9' : ''}`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm px-4 py-1 rounded-full whitespace-nowrap shadow-lg">
                    {t.popularLabel}
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      plan.isPopular
                        ? 'bg-emerald-500/20'
                        : plan.isPremium
                          ? 'bg-purple-500/20'
                          : 'bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-white">
                      {formatVND(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-500 text-sm">
                        {' '}
                        VND{isYearly ? t.year : t.month}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feat.included ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feat.included ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  disabled={plan.disabled}
                  className={`w-full ${plan.btnClass}`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro card glow animation */}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 50px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.2); }
        }
      `}</style>
    </div>
  );
}
