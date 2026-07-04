import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, QrCode, Check, X, Loader2, Trophy, Users, Coins, Settings, CheckCircle2 } from 'lucide-react';
import { feeApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// TRANG DONG PHI GIAI DAU
// - Hien QR chuyen khoan (tao tu VietQR)
// - Danh sach ai da dong / chua (admin xac nhan)
// - Tien thuong top 1-2-3
// - Admin: cau hinh phi + ngan hang + thuong
// Props: tournamentId, tournament, currentUser, darkMode
// ─────────────────────────────────────────────────────────────

// Map ten ngan hang -> ma BIN cho VietQR (cac ngan hang pho bien VN)
const BANK_BINS = {
  'vietcombank': '970436', 'vcb': '970436',
  'techcombank': '970407', 'tcb': '970407',
  'mbbank': '970422', 'mb': '970422',
  'vietinbank': '970415', 'ctg': '970415',
  'bidv': '970418',
  'agribank': '970405',
  'acb': '970416',
  'vpbank': '970432', 'vpb': '970432',
  'tpbank': '970423', 'tpb': '970423',
  'sacombank': '970403', 'stb': '970403',
  'vib': '970441',
  'shb': '970443',
  'mbank': '970422',
  'momo': '970422',
};

function getBankBin(bankName) {
  if (!bankName) return null;
  const key = bankName.toLowerCase().replace(/\s+/g, '');
  for (const [name, bin] of Object.entries(BANK_BINS)) {
    if (key.includes(name)) return bin;
  }
  return null;
}

const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

export default function FeePage({ tournamentId, tournament, currentUser, darkMode = true }) {
  const dm = darkMode;
  const tid = tournamentId ?? tournament?.id;

  const [info, setInfo] = useState(null);
  const [payList, setPayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const isAdminBtc = ['admin', 'btc'].includes((currentUser?.role || '').toLowerCase());

  // Tai thong tin phi + danh sach
  const loadData = useCallback(async () => {
    if (!tid) return;
    try {
      const inf = await feeApi.getInfo(tid);
      setInfo(inf);
      if (inf?.isAdminBtc) {
        const list = await feeApi.getList(tid);
        setPayList(list);
      }
      setError(null);
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('403') || msg.includes('chua dang ky')) {
        setError('Bạn cần đăng ký giải này để xem trang đóng phí.');
      } else {
        setError('Không tải được thông tin phí.');
      }
    } finally {
      setLoading(false);
    }
  }, [tid]);

  useEffect(() => { loadData(); }, [loadData]);

  // Admin xac nhan dong phi
  const handleToggle = async (regId) => {
    try {
      await feeApi.togglePaid(regId);
      await loadData();
    } catch { /* im lang */ }
  };

  // Tao URL QR tu VietQR (mien phi, khong can dang ky)
  const qrUrl = (() => {
    if (!info?.bankAccount) return null;
    const bin = getBankBin(info.bankName);
    if (!bin) return null;
    const amount = info.entryFee || 0;
    const desc = encodeURIComponent(`Dong phi ${(tournament?.name || '').slice(0, 20)}`);
    // VietQR API: https://img.vietqr.io/image/{BIN}-{ACCOUNT}-{template}.png?amount=&addInfo=&accountName=
    return `https://img.vietqr.io/image/${bin}-${info.bankAccount}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${encodeURIComponent(info.bankHolder || '')}`;
  })();

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';

  if (loading) {
    return (
      <div className={`rounded-2xl border-2 p-8 flex items-center justify-center gap-2 ${dm ? 'border-white/10 bg-white/3 text-slate-400' : 'border-gray-200 bg-white text-slate-500'}`}>
        <Loader2 size={18} className="animate-spin" /> Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border-2 p-8 flex flex-col items-center gap-3 text-center ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`}>
        <Wallet size={32} className="text-amber-400 opacity-60" />
        <p className={`font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Thong tin phi + tong quy ── */}
      <div className={`rounded-2xl border-2 p-5 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-black flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-900'}`}>
            <Wallet size={20} className="text-emerald-400" /> Phí Giải Đấu
          </h2>
          {isAdminBtc && (
            <button onClick={() => setShowConfig(!showConfig)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dm ? 'bg-white/8 text-slate-200 hover:bg-white/12' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Settings size={13} /> Cấu hình
            </button>
          )}
        </div>

        {/* So lieu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Phí / người" value={fmtMoney(info?.entryFee)} icon={Coins} color="text-cyan-400" dm={dm} />
          <StatBox label="Đã đóng" value={`${info?.paidCount || 0}/${info?.totalReg || 0}`} icon={Users} color="text-emerald-400" dm={dm} />
          <StatBox label="Tổng quỹ" value={fmtMoney(info?.totalFund)} icon={Wallet} color="text-violet-400" dm={dm} />
          <StatBox label="Sau phí BTC" value={fmtMoney(info?.afterAdmin)} icon={Trophy} color="text-amber-400" dm={dm} />
        </div>
      </div>

      {/* ── Cau hinh phi (admin) ── */}
      {isAdminBtc && showConfig && (
        <FeeConfig tid={tid} info={info} dm={dm} onSaved={() => { setShowConfig(false); loadData(); }} />
      )}

      {/* ── Tien thuong top 1-2-3 ── */}
      {(info?.prize1 > 0 || info?.prize2 > 0 || info?.prize3 > 0) && (
        <div className={`rounded-2xl border-2 p-5 ${card}`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
            <Trophy size={16} className="text-amber-400" /> Cơ Cấu Giải Thưởng
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <PrizeBox rank="🥇" label="Vô địch" value={fmtMoney(info?.prize1)} color="from-amber-500/20 to-yellow-500/10 border-amber-500/30" dm={dm} />
            <PrizeBox rank="🥈" label="Á quân" value={fmtMoney(info?.prize2)} color="from-slate-400/20 to-slate-300/10 border-slate-400/30" dm={dm} />
            <PrizeBox rank="🥉" label="Hạng 3" value={fmtMoney(info?.prize3)} color="from-orange-600/20 to-orange-500/10 border-orange-600/30" dm={dm} />
          </div>
        </div>
      )}

      {/* ── QR chuyen khoan + trang thai dong phi cua toi ── */}
      {info?.entryFee > 0 && (
        <div className={`rounded-2xl border-2 p-5 ${card}`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
            <QrCode size={16} className="text-cyan-400" /> Đóng Phí Tham Dự
          </h3>

          {info?.iPaid ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-bold">Bạn đã đóng phí!</p>
              <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Cảm ơn bạn đã tham dự giải đấu.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {qrUrl ? (
                <>
                  <div className="bg-white p-3 rounded-2xl">
                    <img src={qrUrl} alt="QR chuyển khoản" className="w-56 h-56 object-contain" />
                  </div>
                  <div className={`text-center text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                    <p className="font-bold">{info.bankName} · {info.bankAccount}</p>
                    <p>{info.bankHolder}</p>
                    <p className="mt-1">Số tiền: <span className="font-black text-emerald-400">{fmtMoney(info.entryFee)}</span></p>
                  </div>
                  <p className={`text-xs text-center ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                    Quét mã để chuyển khoản. Sau khi chuyển, chờ ban tổ chức xác nhận.
                  </p>
                </>
              ) : (
                <div className={`text-center py-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  {info?.bankAccount
                    ? <p>STK: <b>{info.bankName} · {info.bankAccount}</b><br/>{info.bankHolder}<br/>Số tiền: {fmtMoney(info.entryFee)}</p>
                    : <p className="text-amber-400">Ban tổ chức chưa cấu hình thông tin chuyển khoản.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Danh sach dong phi (admin) ── */}
      {isAdminBtc && (
        <div className={`rounded-2xl border-2 p-5 ${card}`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dm ? 'text-white' : 'text-gray-800'}`}>
            <Users size={16} className="text-emerald-400" /> Danh Sách Đóng Phí
            <span className={`text-xs font-normal ${dm ? 'text-slate-500' : 'text-slate-400'}`}>· Bấm để xác nhận</span>
          </h3>
          {payList.length === 0 ? (
            <p className={`text-sm text-center py-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Chưa có ai đăng ký.</p>
          ) : (
            <div className="space-y-2">
              {payList.map((p, i) => (
                <div key={p.registrationId}
                  className={`flex items-center gap-3 p-3 rounded-xl ${dm ? 'bg-white/4' : 'bg-slate-50'}`}>
                  <span className={`text-xs font-black w-6 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}</span>
                  <span className={`flex-1 text-sm font-semibold ${dm ? 'text-white' : 'text-gray-800'}`}>{p.fullName}</span>
                  <button onClick={() => handleToggle(p.registrationId)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${p.hasPaid
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : dm ? 'bg-white/8 text-slate-300 hover:bg-white/12' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                    {p.hasPaid ? <><Check size={13} /> Đã đóng</> : <><X size={13} /> Chưa đóng</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cac component nho ──
function StatBox({ label, value, icon: Icon, color, dm }) {
  return (
    <div className={`rounded-xl p-3 ${dm ? 'bg-white/4' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={color} />
        <span className={`text-[11px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
      <p className={`text-base font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function PrizeBox({ rank, label, value, color, dm }) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-3 text-center ${color}`}>
      <div className="text-2xl mb-1">{rank}</div>
      <p className={`text-[11px] ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{label}</p>
      <p className={`text-sm font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

// ── Cau hinh phi (admin nhap) ──
function FeeConfig({ tid, info, dm, onSaved }) {
  const [entryFee, setEntryFee] = useState(info?.entryFee || 0);
  const [adminFee, setAdminFee] = useState(info?.adminFee || 0);
  const [bankName, setBankName] = useState(info?.bankName || '');
  const [bankAccount, setBankAccount] = useState(info?.bankAccount || '');
  const [bankHolder, setBankHolder] = useState(info?.bankHolder || '');
  const [prize1, setPrize1] = useState(info?.prize1 || 0);
  const [prize2, setPrize2] = useState(info?.prize2 || 0);
  const [prize3, setPrize3] = useState(info?.prize3 || 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await feeApi.setConfig(tid, {
        entryFee: parseInt(entryFee, 10) || 0,
        adminFee: parseInt(adminFee, 10) || 0,
        bankName, bankAccount, bankHolder,
        prize1: parseInt(prize1, 10) || 0,
        prize2: parseInt(prize2, 10) || 0,
        prize3: parseInt(prize3, 10) || 0,
      });
      onSaved();
    } catch { /* im lang */ }
    finally { setSaving(false); }
  };

  const inp = dm ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900';
  const lbl = dm ? 'text-slate-300' : 'text-slate-600';

  const Field = ({ label, value, onChange, type = 'number', placeholder = '' }) => (
    <div>
      <label className={`block text-xs font-bold mb-1 ${lbl}`}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${inp}`} />
    </div>
  );

  return (
    <div className={`rounded-2xl border-2 p-5 space-y-3 ${dm ? 'bg-white/5 border-emerald-500/20' : 'bg-white border-emerald-200'}`}>
      <h3 className={`text-sm font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>⚙️ Cấu Hình Phí & Giải Thưởng</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phí / người (đ)" value={entryFee} onChange={setEntryFee} placeholder="20000" />
        <Field label="Phí BTC cắt (đ)" value={adminFee} onChange={setAdminFee} placeholder="15000" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Field label="Ngân hàng" value={bankName} onChange={setBankName} type="text" placeholder="Vietcombank, MB, Techcombank..." />
        <Field label="Số tài khoản" value={bankAccount} onChange={setBankAccount} type="text" placeholder="0123456789" />
        <Field label="Tên chủ tài khoản" value={bankHolder} onChange={setBankHolder} type="text" placeholder="NGUYEN VAN A" />
      </div>
      <p className={`text-xs font-bold ${lbl}`}>Tiền thưởng (nhập tay):</p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="🥇 Top 1" value={prize1} onChange={setPrize1} placeholder="200000" />
        <Field label="🥈 Top 2" value={prize2} onChange={setPrize2} placeholder="120000" />
        <Field label="🥉 Top 3" value={prize3} onChange={setPrize3} placeholder="80000" />
      </div>
      <button onClick={save} disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm disabled:opacity-60">
        {saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
      </button>
    </div>
  );
}