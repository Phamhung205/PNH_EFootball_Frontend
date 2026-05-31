import React, { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Building2,
  Tag,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Thanh Toán Phí Tham Gia',
    tournament: 'Giải đấu',
    entryFee: 'Phí tham gia',
    teams: 'đội',
    paymentMethod: 'Phương Thức Thanh Toán',
    bankTransfer: 'Chuyển Khoản',
    eWallet: 'Ví Điện Tử',
    creditCard: 'Thẻ Tín Dụng',
    promoCode: 'Mã Giảm Giá',
    apply: 'Áp Dụng',
    orderSummary: 'Tổng Đơn Hàng',
    subtotal: 'Tạm Tính',
    discount: 'Giảm Giá',
    total: 'Tổng Cộng',
    payNow: 'Thanh Toán Ngay',
    secure: 'Giao dịch được bảo mật SSL 256-bit',
    bankDesc: 'Vietcombank, Techcombank, MB Bank...',
    eWalletDesc: 'Momo, ZaloPay, VNPay',
    creditDesc: 'Visa, Mastercard, JCB',
    tournamentName: 'PNH Championship Season 3',
    promoPlaceholder: 'Nhập mã giảm giá',
    promoApplied: 'Đã áp dụng mã giảm giá!',
    promoInvalid: 'Mã không hợp lệ',
    selectPayment: 'Chọn phương thức thanh toán',
  },
  en: {
    title: 'Tournament Entry Payment',
    tournament: 'Tournament',
    entryFee: 'Entry Fee',
    teams: 'teams',
    paymentMethod: 'Payment Method',
    bankTransfer: 'Bank Transfer',
    eWallet: 'E-Wallet',
    creditCard: 'Credit Card',
    promoCode: 'Promo Code',
    apply: 'Apply',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'Total',
    payNow: 'Pay Now',
    secure: 'Transaction secured with 256-bit SSL',
    bankDesc: 'Vietcombank, Techcombank, MB Bank...',
    eWalletDesc: 'Momo, ZaloPay, VNPay',
    creditDesc: 'Visa, Mastercard, JCB',
    tournamentName: 'PNH Championship Season 3',
    promoPlaceholder: 'Enter promo code',
    promoApplied: 'Promo code applied!',
    promoInvalid: 'Invalid code',
    selectPayment: 'Select payment method',
  },
};

const paymentMethods = (t) => [
  {
    id: 'bank',
    label: t.bankTransfer,
    desc: t.bankDesc,
    icon: Building2,
    color: 'text-blue-400',
    glow: 'border-blue-500/40 shadow-blue-500/10',
  },
  {
    id: 'ewallet',
    label: t.eWallet,
    desc: t.eWalletDesc,
    icon: Wallet,
    color: 'text-pink-400',
    glow: 'border-pink-500/40 shadow-pink-500/10',
  },
  {
    id: 'credit',
    label: t.creditCard,
    desc: t.creditDesc,
    icon: CreditCard,
    color: 'text-amber-400',
    glow: 'border-amber-500/40 shadow-amber-500/10',
  },
];

function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + ' VND';
}

export default function Payment({ darkMode = true, language = 'vi' }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // 'applied' | 'invalid' | null
  const [isProcessing, setIsProcessing] = useState(false);

  const t = translations[language] || translations.vi;

  const entryFee = 500000;
  const discount = promoStatus === 'applied' ? 50000 : 0;
  const total = entryFee - discount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'PNH2026') {
      setPromoStatus('applied');
    } else {
      setPromoStatus('invalid');
    }
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} p-4 md:p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-8">
          {t.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tournament Info & Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Info */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">
                {t.tournament}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-emerald-400 font-bold text-xl">
                    {t.tournamentName}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">16 {t.teams}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">{t.entryFee}</p>
                  <p className="text-white font-black text-2xl">
                    {formatVND(entryFee)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">
                {t.paymentMethod}
              </h2>
              <div className="space-y-3">
                {paymentMethods(t).map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                        isSelected
                          ? `border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10`
                          : 'border-slate-700/50 bg-slate-950/30 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-emerald-500/20' : 'bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {method.label}
                        </p>
                        <p className="text-slate-500 text-sm">{method.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h2 className="text-white font-bold text-lg">{t.promoCode}</h2>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoStatus(null);
                  }}
                  placeholder={t.promoPlaceholder}
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.apply}
                </button>
              </div>
              {promoStatus === 'applied' && (
                <p className="text-emerald-400 text-sm mt-2 animate-pulse">
                  ✅ {t.promoApplied}
                </p>
              )}
              {promoStatus === 'invalid' && (
                <p className="text-red-400 text-sm mt-2">❌ {t.promoInvalid}</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sticky top-8">
              <h2 className="text-white font-bold text-lg mb-6">
                {t.orderSummary}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>{t.subtotal}</span>
                  <span className="text-white">{formatVND(entryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>{t.discount}</span>
                    <span className="text-emerald-400">
                      -{formatVND(discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-700/50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">
                      {t.total}
                    </span>
                    <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {formatVND(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={!selectedMethod || isProcessing}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] ${
                  !selectedMethod || isProcessing
                    ? 'opacity-50 cursor-not-allowed hover:scale-100'
                    : ''
                }`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t.payNow}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {!selectedMethod && (
                <p className="text-slate-500 text-xs text-center mt-3">
                  {t.selectPayment}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.secure}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
