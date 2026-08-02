import React, { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle2, Copy, RefreshCw, MessageCircle, Users, AlertTriangle } from 'lucide-react';
import { tournamentApi } from '../../services/api';

/**
 * MAN HINH DANG KY KICH HOAT GIAI
 *
 * Quy tac:
 *   - 2 giai dau tien cua moi tai khoan: MIEN PHI tron doi
 *   - Tu giai thu 3: phai tra phi moi mo khoa chia bang / xep lich / nhap ti so
 *     va moi chuyen duoc trang thai sang "Dang dien ra"
 *   - Muc phi: 32 doi tro xuong = 30.000d, tren 32 doi = 35.000d
 *
 * LUU Y: khong co nut "gia lap thanh toan". Viec mo khoa CHI Admin lam duoc
 * qua trang Duyet Giai Dang Ky, sau khi da doi chieu tien vao tai khoan.
 */
export default function ActivationGate({ tournamentId, language = 'vi', darkMode = true, onUnlocked }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [claiming, setClaiming] = useState(false);

  const load = React.useCallback(() => {
    if (!tournamentId) { setLoading(false); return; }
    setLoading(true);
    tournamentApi.getActivation(tournamentId)
      .then(res => {
        setInfo(res);
        // Da duoc Admin cap phep -> bao len cho tab tu mo khoa
        if ((res?.isPaid || res?.isFree) && onUnlocked) onUnlocked();
      })
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [tournamentId, onUnlocked]);

  useEffect(() => { load(); }, [load]);

  // BTC bam "Toi da chuyen khoan" -> ghi nhan de Admin uu tien kiem tra.
  // KHONG mo khoa giai, chi Admin duyet moi mo khoa duoc.
  const baoDaChuyen = async () => {
    setClaiming(true);
    try {
      await tournamentApi.claimPayment(tournamentId);
      setInfo(prev => prev ? { ...prev, claimed: true } : prev);
    } catch (e) {
      alert(tr('Lỗi: ', 'Error: ') + (e?.message || ''));
    } finally {
      setClaiming(false);
    }
  };

  const copy = (text, what) => {
    navigator.clipboard?.writeText(String(text));
    setCopied(what);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/50">
        <Loader2 size={16} className="animate-spin" />
        {tr('Đang kiểm tra...', 'Checking...')}
      </div>
    );
  }

  // Da mo khoa -> khong hien gi
  if (!info || info.isPaid || info.isFree) return null;

  const money = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
  const box = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const txt = darkMode ? 'text-white' : 'text-gray-900';
  const dim = darkMode ? 'text-white/50' : 'text-gray-500';
  // Mau cam/vang: nen toi dung sac nhat, nen sang dung sac dam de khoi choi
  const amber    = darkMode ? 'text-amber-400' : 'text-amber-700';
  const amberBg  = darkMode ? 'bg-amber-500/15' : 'bg-amber-100';
  const amberBox = darkMode
    ? 'bg-amber-500/10 border-amber-500/25'
    : 'bg-amber-50 border-amber-300';
  // Nut phu: nen toi dung lop trang mo, nen sang dung xam nhat
  const softBtn = darkMode
    ? 'bg-white/8 hover:bg-white/12 text-white/70'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200';

  // ── CHUA NHAP DOI NAO -> chua tinh duoc phi ──
  // Phi phu thuoc so doi (duoi 32 = 15k, tu 32 tro len = 25k) nen phai co doi
  // truoc. Hien QR luc nay se ra so tien 0d, quet vao la sai.
  if (!info.hasTeams) {
    return (
      <div className={`rounded-3xl border p-5 md:p-6 space-y-4 ${box}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl ${amberBg} flex items-center justify-center shrink-0`}>
            <Users size={18} className={amber} />
          </div>
          <div>
            <h3 className={`font-black text-lg ${txt}`}>
              {tr('Cần nhập đội tham dự trước', 'Add teams first')}
            </h3>
            <p className={`text-xs mt-0.5 ${dim}`}>
              {tr('Phí kích hoạt tính theo số đội, nên bạn cần thêm đội vào giải trước khi đăng ký.',
                  'The activation fee depends on the number of teams, so please add teams before registering.')}
            </p>
          </div>
        </div>

        {/* Bang gia de nguoi dung biet truoc */}
        <div className={`rounded-2xl p-4 space-y-2 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <p className={`text-xs font-black ${txt}`}>{tr('Bảng phí', 'Pricing')}</p>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={dim}>{tr('Giải dưới 32 đội', 'Under 32 teams')}</span>
            <span className={`font-black ${amber}`}>15.000đ</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={dim}>{tr('Giải từ 32 đội trở lên', '32 teams or more')}</span>
            <span className={`font-black ${amber}`}>25.000đ</span>
          </div>
        </div>

        <p className={`text-[11px] ${dim}`}>
          {tr('Vào tab Đội Bóng để thêm đội, sau đó quay lại đây để lấy mã QR thanh toán.',
              'Go to the Teams tab to add teams, then come back here to get the payment QR code.')}
        </p>

        <button onClick={load}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${softBtn}`}>
          <RefreshCw size={14} />
          {tr('Đã thêm đội — Kiểm tra lại', 'Teams added — Check again')}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-5 md:p-6 space-y-5 ${box}`}>
      {/* Tieu de */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-2xl ${amberBg} flex items-center justify-center shrink-0`}>
          <Lock size={18} className={amber} />
        </div>
        <div>
          <h3 className={`font-black text-lg ${txt}`}>
            {tr('Đăng ký kích hoạt giải', 'Activate this tournament')}
          </h3>
          <p className={`text-xs mt-0.5 ${dim}`}>
            {tr('Kích hoạt xong là mở khóa toàn bộ: chia bảng, xếp lịch, nhập tỉ số, sơ đồ và bắt đầu giải.',
                'Once activated, everything unlocks: groups, schedule, scores, bracket and starting the tournament.')}
          </p>
        </div>
      </div>

      {/* So tien */}
      <div className={`flex items-baseline gap-2 px-4 py-3 rounded-2xl border ${amberBox}`}>
        <span className={`text-3xl font-black ${amber}`}>{money(info.fee)}</span>
        <span className={`text-xs ${dim}`}>
          {tr(`cho ${info.teamCount} đội đã nhập`, `for ${info.teamCount} teams entered`)}
        </span>
      </div>

      {/* ════ CANH BAO KHI BI TU CHOI ════
          info.rejected co gia tri khi Admin bam "Tu choi" o trang duyet.
          Tu dong bien mat khi BTC bam "Toi da chuyen khoan" lai (backend xoa
          cot PaymentRejectedAt trong ClaimPayment). */}
      {info.rejected && (
        <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-300 mb-1">
              {tr('Chưa xác nhận được chuyển khoản', 'Payment not confirmed')}
            </p>
            <p className="text-xs text-red-200/80 leading-relaxed">
              {tr('Quản trị viên chưa tìm thấy giao dịch phù hợp. Vui lòng kiểm tra lại và chuyển khoản, hoặc liên hệ Zalo nếu bạn đã chuyển.',
                  'The admin could not find a matching transaction. Please check and transfer again, or contact via Zalo if you already paid.')}
            </p>
            {info.rejectedAt && (
              <p className="text-[10px] text-red-300/50 mt-1.5">
                {tr('Kiểm tra lúc', 'Checked at')} {new Date(info.rejectedAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* QR + thong tin chuyen khoan */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start">
        {info.qrUrl ? (
          <div className="bg-white rounded-2xl p-2 mx-auto sm:mx-0">
            <img src={info.qrUrl} alt="QR" className="w-44 h-44 object-contain" />
          </div>
        ) : (
          <div className={`w-44 h-44 rounded-2xl flex items-center justify-center text-xs text-center px-3 mx-auto sm:mx-0 ${dim} border border-dashed border-white/15`}>
            {tr('Chưa cấu hình tài khoản nhận tiền', 'Payment account not configured')}
          </div>
        )}

        <div className="space-y-2 text-sm">
          <Row label={tr('Ngân hàng', 'Bank')} value={info.bankName} dim={dim} txt={txt} />
          <Row label={tr('Số tài khoản', 'Account')} value={info.accountNumber} dim={dim} txt={txt}
            onCopy={() => copy(info.accountNumber, 'acc')} copied={copied === 'acc'} language={language} />
          <Row label={tr('Chủ tài khoản', 'Holder')} value={info.accountName} dim={dim} txt={txt} />
          <Row label={tr('Số tiền', 'Amount')} value={money(info.fee)} dim={dim} txt={txt}
            onCopy={() => copy(info.fee, 'amt')} copied={copied === 'amt'} language={language} />
          <Row label={tr('Nội dung', 'Note')} value={info.paymentNote} dim={dim} txt={txt} highlight amber={amber}
            onCopy={() => copy(info.paymentNote, 'note')} copied={copied === 'note'} language={language} />
        </div>
      </div>

      {/* Huong dan */}
      <div className={`text-xs leading-relaxed px-4 py-3 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'} ${dim}`}>
        <p className="font-bold mb-1">{tr('Cách kích hoạt:', 'How to activate:')}</p>
        <p>{tr('1. Quét mã QR bằng app ngân hàng (số tiền và nội dung tự điền sẵn)',
               '1. Scan the QR code with your banking app (amount and note are pre-filled)')}</p>
        <p>{tr('2. Nhắn Zalo cho quản trị viên kèm ảnh chuyển khoản để được duyệt nhanh',
               '2. Message the admin on Zalo with your transfer receipt for faster approval')}</p>
      </div>

      {/* Nut BAO DA CHUYEN KHOAN — dat TREN nut Zalo */}
      {info.claimed ? (
        <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-500 text-sm font-black">
          <CheckCircle2 size={16} />
          {tr('Đã báo chuyển khoản — Đang chờ duyệt', 'Payment reported — Awaiting approval')}
        </div>
      ) : (
        <button onClick={baoDaChuyen} disabled={claiming}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-black transition-all active:scale-[0.98]">
          {claiming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {tr('Tôi đã chuyển khoản — Báo quản trị viên', 'I have paid — Notify admin')}
        </button>
      )}

      {/* Nut lien he Zalo */}
      {info.zaloPhone && (
        <a href={`https://zalo.me/${info.zaloPhone}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-sm font-black transition-all active:scale-[0.98]">
          <MessageCircle size={16} />
          {tr('Nhấn vào đây liên hệ Zalo để đăng ký', 'Contact via Zalo to register')}
        </a>
      )}

      <p className={`text-[11px] text-center ${dim}`}>
        {tr('Giải mở khóa ngay sau khi quản trị viên xác nhận đã nhận được tiền.',
            'The tournament unlocks as soon as an admin confirms your payment.')}
      </p>

      <button onClick={load}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${softBtn}`}>
        <RefreshCw size={14} />
        {tr('Đã chuyển khoản — Kiểm tra lại', 'I have paid — Check again')}
      </button>
    </div>
  );
}

// 1 dong thong tin chuyen khoan
function Row({ label, value, onCopy, copied, dim, txt, highlight, amber = 'text-amber-400', language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs shrink-0 ${dim}`}>{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`font-bold truncate ${highlight ? amber : txt}`}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-all"
            title={tr('Sao chép', 'Copy')}>
            {copied
              ? <CheckCircle2 size={13} className="text-emerald-400" />
              : <Copy size={13} className={dim} />}
          </button>
        )}
      </div>
    </div>
  );
}