import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2, X, CheckCircle2 } from 'lucide-react';
import { registrationApi } from '../../services/api';

// ───────────────────────────────────────────────────────────────────────────
// NUT DANG KY THAM DU GIAI
// - Tu kiem tra user da dang ky chua khi mo
// - Bam de dang ky / huy dang ky
// - Chi hien khi giai cho phep dang ky (allowRegistration) va user da dang nhap
// ───────────────────────────────────────────────────────────────────────────
const T = {
  vi: {
    register: 'Đăng ký tham dự',
    registered: 'Đã đăng ký',
    cancel: 'Hủy đăng ký',
    processing: 'Đang xử lý...',
    successReg: 'Đăng ký tham dự thành công!',
    successCancel: 'Đã hủy đăng ký.',
    assigned: 'Bạn đã được xếp đội',
    loginFirst: 'Vui lòng đăng nhập để đăng ký',
    confirmCancel: 'Bạn chắc chắn muốn hủy đăng ký giải này?',
  },
  en: {
    register: 'Register to join',
    registered: 'Registered',
    cancel: 'Cancel registration',
    processing: 'Processing...',
    successReg: 'Registered successfully!',
    successCancel: 'Registration cancelled.',
    assigned: 'You have been assigned a team',
    loginFirst: 'Please log in to register',
    confirmCancel: 'Are you sure you want to cancel?',
  },
};

export default function RegisterButton({ tournament, user, darkMode = true, language = 'vi' }) {
  const t = T[language] || T.vi;
  const dm = darkMode;

  const tournamentId = tournament?.id;
  // Giai co cho phep dang ky khong (backend tra ve allowRegistration)
  const allowReg = tournament?.allowRegistration === true;

  const [loading, setLoading] = useState(true);   // dang kiem tra trang thai ban dau
  const [busy, setBusy] = useState(false);         // dang dang ky/huy
  const [registered, setRegistered] = useState(false);
  const [assigned, setAssigned] = useState(false); // da duoc chia doi chua
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Kiem tra trang thai dang ky khi mo (chi khi co user + giai mo dang ky)
  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!tournamentId || !user || !allowReg) {
        setLoading(false);
        return;
      }
      try {
        const st = await registrationApi.myStatus(tournamentId);
        if (!alive) return;
        setRegistered(st.registered === true);
        setAssigned(st.status === 'Assigned' || st.teamId != null);
      } catch {
        // im lang neu loi - coi nhu chua dang ky
      } finally {
        if (alive) setLoading(false);
      }
    };
    check();
    return () => { alive = false; };
  }, [tournamentId, user, allowReg]);

  // Neu giai khong mo dang ky -> khong hien gi
  if (!allowReg) return null;

  // Chua dang nhap -> hien nut mo, bam thi bao dang nhap
  if (!user) {
    return (
      <button
        onClick={() => showToast(t.loginFirst)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-cyan-600"
      >
        <UserPlus className="w-4 h-4" />
        {t.register}
        {toast && <span className="ml-2 text-xs">({toast})</span>}
      </button>
    );
  }

  const handleRegister = async () => {
    setBusy(true);
    try {
      await registrationApi.register(tournamentId);
      setRegistered(true);
      showToast(t.successReg);
    } catch (err) {
      showToast(err.message || 'Lỗi');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(t.confirmCancel)) return;
    setBusy(true);
    try {
      await registrationApi.unregister(tournamentId);
      setRegistered(false);
      showToast(t.successCancel);
    } catch (err) {
      showToast(err.message || 'Lỗi');
    } finally {
      setBusy(false);
    }
  };

  // Dang tai trang thai
  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ${dm ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {t.processing}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        {registered ? (
          <>
            {/* Da dang ky -> hien badge xanh */}
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              <UserCheck className="w-4 h-4" />
              {assigned ? t.assigned : t.registered}
            </span>
            {/* Cho huy neu chua duoc chia doi */}
            {!assigned && (
              <button
                onClick={handleCancel}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-white/5 text-slate-300 hover:bg-red-500/15 hover:text-red-400' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                {t.cancel}
              </button>
            )}
          </>
        ) : (
          // Chua dang ky -> nut dang ky
          <button
            onClick={handleRegister}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {busy ? t.processing : t.register}
          </button>
        )}
      </div>

      {/* Toast thong bao */}
      {toast && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {toast}
        </div>
      )}
    </div>
  );
}