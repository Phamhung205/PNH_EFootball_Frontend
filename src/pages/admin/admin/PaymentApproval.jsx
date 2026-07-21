import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Loader2, RefreshCw, AlertTriangle, Undo2, Wallet, Search, Mail, X } from 'lucide-react';
import { tournamentApi } from '../../../services/api';

/**
 * TRANG ADMIN DUYET GIAI DANG KY
 *
 * Quy trinh:
 *   1. BTC tao giai thu 3 tro di -> giai CHUA KICH HOAT, khong bat dau duoc
 *   2. BTC chuyen khoan (noi dung "PNH{id}") roi nhan Zalo bao Admin
 *   3. Admin vao day, TIM theo Gmail hoac ten nguoi dang ky
 *   4. Doi chieu sao ke ngan hang -> bam Duyet -> giai mo khoa ngay
 *
 * Chi Admin vao duoc (backend cung chan bang [Authorize(Roles="Admin")]).
 */
export default function PaymentApproval({ language = 'vi', darkMode = true }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);

  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [err, setErr]         = useState('');
  const [toast, setToast]     = useState('');
  const [q, setQ]             = useState('');        // o tim kiem
  const [status, setStatus]   = useState('pending'); // pending | approved | all

  const load = useCallback((keyword, st) => {
    setLoading(true);
    setErr('');
    tournamentApi.pendingPayments({ q: keyword, status: st })
      .then(res => setList(Array.isArray(res) ? res : []))
      .catch(e => setErr(e?.message || 'Không tải được danh sách.'))
      .finally(() => setLoading(false));
  }, []);

  // Tai lan dau + moi khi doi bo loc trang thai
  useEffect(() => { load(q, status); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const duyet = async (t) => {
    const ok = window.confirm(
      tr(`Xác nhận ĐÃ NHẬN ${Number(t.activationFee || 0).toLocaleString('vi-VN')}đ cho giải:\n\n"${t.name}"\nNgười đăng ký: ${t.ownerEmail || t.ownerName || '?'}\nNội dung CK: ${t.paymentNote}\n\nGiải sẽ được mở khóa ngay.`,
         `Confirm receiving ${Number(t.activationFee || 0).toLocaleString('vi-VN')}đ for:\n\n"${t.name}"\nOwner: ${t.ownerEmail || t.ownerName || '?'}\nNote: ${t.paymentNote}\n\nThe tournament will unlock immediately.`)
    );
    if (!ok) return;
    setBusyId(t.tournamentId);
    try {
      await tournamentApi.confirmPayment(t.tournamentId);
      showToast(tr('Đã cấp phép cho giải!', 'Tournament approved!'));
      load(q, status);
    } catch (e) {
      alert(tr('Lỗi: ', 'Error: ') + (e?.message || ''));
    } finally {
      setBusyId(null);
    }
  };

  const thuHoi = async (t) => {
    const ok = window.confirm(
      tr(`Thu hồi cấp phép của giải "${t.name}"?\n\nGiải sẽ bị khóa lại và không thể bắt đầu.`,
         `Revoke approval for "${t.name}"?\n\nThe tournament will be locked again.`)
    );
    if (!ok) return;
    setBusyId(t.tournamentId);
    try {
      await tournamentApi.revokePayment(t.tournamentId);
      showToast(tr('Đã thu hồi.', 'Revoked.'));
      load(q, status);
    } catch (e) {
      alert(tr('Lỗi: ', 'Error: ') + (e?.message || ''));
    } finally {
      setBusyId(null);
    }
  };

  const money = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
  const card  = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const txt   = darkMode ? 'text-white' : 'text-gray-900';
  const dim   = darkMode ? 'text-white/50' : 'text-gray-500';
  const input = darkMode
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400';

  const TABS = [
    { id: 'pending',  label: tr('Chờ duyệt', 'Pending') },
    { id: 'approved', label: tr('Đã duyệt', 'Approved') },
    { id: 'all',      label: tr('Tất cả', 'All') },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Tieu de */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Wallet size={20} className="text-emerald-400" />
        </div>
        <div className="min-w-0">
          <h2 className={`text-xl font-black ${txt}`}>
            {tr('Duyệt Giải Đăng Ký', 'Tournament Approvals')}
          </h2>
          <p className={`text-xs ${dim}`}>
            {tr('Tìm theo Gmail hoặc tên người đăng ký, đối chiếu rồi cấp phép',
                'Search by Gmail or owner name, verify, then approve')}
          </p>
        </div>
      </div>

      {/* O tim kiem */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dim}`} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(q, status); }}
            placeholder={tr('Gmail, tên người đăng ký, tên giải hoặc mã PNH12...',
                            'Gmail, owner name, tournament name or PNH12...')}
            className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm outline-none focus:border-cyan-400/50 transition-all ${input}`}
          />
          {q && (
            <button type="button" onClick={() => { setQ(''); load('', status); }}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 ${dim}`}>
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => load(q, status)} disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-black transition-all active:scale-95">
          {tr('Tìm', 'Search')}
        </button>
        <button onClick={() => load(q, status)} disabled={loading}
          className="px-3 py-2.5 rounded-xl border border-white/15 text-white/50 hover:bg-white/5 disabled:opacity-50 transition-all"
          title={tr('Tải lại', 'Refresh')}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bo loc trang thai */}
      <div className={`inline-flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setStatus(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              status === t.id
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : `${dim} hover:text-white`}`}>
            {t.label}
          </button>
        ))}
      </div>

      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
          <AlertTriangle size={15} />{err}
        </div>
      )}

      {/* Huong dan */}
      <div className={`text-xs leading-relaxed px-4 py-3 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'} ${dim}`}>
        <p className="font-bold mb-1">{tr('Trước khi duyệt:', 'Before approving:')}</p>
        <p>{tr('Mở app ngân hàng, tìm giao dịch có nội dung đúng bằng mã PNH bên dưới.',
               'Open your banking app and find the transfer with the exact PNH code shown below.')}</p>
        <p className="text-amber-400/90 font-semibold mt-1">
          {tr('Chỉ bấm Duyệt khi tiền đã thực sự vào tài khoản.',
              'Only approve once the money has actually arrived.')}
        </p>
      </div>

      {/* Danh sach */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
          <Loader2 size={16} className="animate-spin" />
          {tr('Đang tải...', 'Loading...')}
        </div>
      ) : list.length === 0 ? (
        <div className={`text-center py-16 rounded-3xl border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <CheckCircle2 size={32} className="text-emerald-400/60 mx-auto mb-3" />
          <p className={`font-bold ${txt}`}>
            {q ? tr('Không tìm thấy giải nào', 'No tournaments found')
               : tr('Không có giải nào chờ duyệt', 'No tournaments awaiting approval')}
          </p>
          {q && (
            <p className={`text-xs mt-1 ${dim}`}>
              {tr('Không có kết quả cho', 'No results for')} "{q}"
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className={`text-xs font-bold uppercase tracking-widest ${dim}`}>
            {list.length} {tr('giải', 'tournaments')}
          </p>

          {list.map(t => (
            <div key={t.tournamentId} className={`rounded-2xl border p-4 ${card}`}>
              {/* Ten giai + so tien */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-black truncate ${txt}`}>{t.name}</p>
                    {t.isPaid && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {tr('ĐÃ DUYỆT', 'APPROVED')}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${dim}`}>
                    {t.maxTeams} {tr('đội', 'teams')} · {t.format} · {t.status}
                  </p>
                </div>
                <p className="text-lg font-black text-amber-400 shrink-0">{money(t.activationFee)}</p>
              </div>

              {/* Nguoi dang ky — Gmail + ten */}
              <div className={`mt-3 px-3 py-2.5 rounded-xl space-y-1 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 text-xs">
                  <Mail size={12} className={dim} />
                  <span className={`font-bold truncate ${txt}`}>
                    {t.ownerEmail || tr('Không rõ', 'Unknown')}
                  </span>
                </div>
                <div className={`text-xs pl-5 ${dim}`}>
                  {tr('Tên tài khoản', 'Account name')}: <span className="font-semibold">{t.ownerName || '—'}</span>
                </div>
              </div>

              {/* Ma doi soat */}
              <div className="mt-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] uppercase tracking-wide ${dim}`}>
                    {tr('Nội dung CK', 'Transfer note')}
                  </span>
                  <code className="font-black text-amber-300 text-sm break-all">{t.paymentNote}</code>
                </div>
                {t.shortCode && (
                  <p className={`text-[10px] mt-1 ${dim}`}>
                    {tr('Tìm nhanh trong sao kê bằng', 'Search your statement for')}{' '}
                    <code className="font-bold text-amber-300/80">{t.shortCode}</code>
                  </p>
                )}
              </div>

              {/* Nut hanh dong */}
              <div className="flex gap-2 mt-3">
                {!t.isPaid ? (
                  <button onClick={() => duyet(t)} disabled={busyId === t.tournamentId}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-black transition-all active:scale-[0.98]">
                    {busyId === t.tournamentId
                      ? <Loader2 size={15} className="animate-spin" />
                      : <CheckCircle2 size={15} />}
                    {tr('Duyệt — Cấp phép giải', 'Approve — Unlock')}
                  </button>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 size={15} />
                      {tr('Đã cấp phép', 'Approved')}
                      {t.paidAt && (
                        <span className="opacity-60 font-normal text-xs">
                          · {new Date(t.paidAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <button onClick={() => thuHoi(t)} disabled={busyId === t.tournamentId}
                      className="px-3.5 py-2.5 rounded-xl border border-white/15 text-white/50 hover:bg-white/5 disabled:opacity-50 transition-all"
                      title={tr('Thu hồi (nếu duyệt nhầm)', 'Revoke (if approved by mistake)')}>
                      <Undo2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xl">
          <CheckCircle2 size={14} />{toast}
        </div>
      )}
    </div>
  );
}