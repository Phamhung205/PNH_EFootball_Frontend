import { useState, useEffect } from 'react';
import {
  Crown, Eye, Check, X, Shield, Trash2, RefreshCw,
  Users, AlertCircle, Search, User as UserIcon, Wrench, UserPlus, Mail
} from 'lucide-react';
import { userApi } from '../../../services/api';

// ───────────────────────────────────────────────────────────────────────────
// Tu dien song ngu
// ───────────────────────────────────────────────────────────────────────────
const translations = {
  vi: {
    title: 'Phân Quyền & Vai Trò',
    subtitle: 'Nhập Gmail để tìm và phân quyền cho thành viên',
    rolesTitle: 'Vai Trò Trong Hệ Thống',
    membersTitle: 'Danh Sách Thành Viên',
    grantTitle: 'Phân Quyền Cho Người Dùng',
    emailLabel: 'Gmail của người cần phân quyền',
    emailPlaceholder: 'nhapemail@gmail.com',
    findBtn: 'Tìm',
    finding: 'Đang tìm...',
    notFound: 'Chưa có tài khoản này',
    foundUser: 'Đã tìm thấy người dùng',
    currentRole: 'Quyền hiện tại',
    chooseRole: 'Chọn quyền mới để gán',
    assign: 'Gán quyền',
    assigning: 'Đang gán...',
    assignSuccess: 'Đã gán quyền thành công!',
    member: 'Thành viên',
    role: 'Vai Trò',
    joined: 'Ngày tham gia',
    members: 'thành viên',
    admin: 'Admin',
    btc: 'Ban Tổ Chức',
    user: 'Người dùng',
    adminDesc: 'Toàn quyền kiểm soát hệ thống',
    btcDesc: 'Tạo & quản lý giải của mình',
    userDesc: 'Chỉ xem thông tin giải đấu',
    fullAccess: 'Toàn quyền truy cập',
    createTournament: 'Tạo giải đấu',
    manageOwnTournament: 'Quản lý giải mình tạo',
    manageMatches: 'Quản lý trận đấu, đội bóng',
    manageUsers: 'Phân quyền người dùng',
    approvePayments: 'Duyệt gói đăng ký',
    uiSettings: 'Cài đặt giao diện',
    viewOnly: 'Chỉ xem',
    loading: 'Đang tải...',
    error: 'Lỗi tải dữ liệu',
    retry: 'Tải lại',
    empty: 'Chưa có người dùng nào',
    confirmDelete: 'Bạn có chắc muốn xóa người dùng này?',
    you: 'Bạn',
  },
  en: {
    title: 'Permissions & Roles',
    subtitle: 'Enter Gmail to find and assign roles to members',
    rolesTitle: 'System Roles',
    membersTitle: 'Member List',
    grantTitle: 'Assign Role to User',
    emailLabel: 'Gmail of the user to assign',
    emailPlaceholder: 'enteremail@gmail.com',
    findBtn: 'Find',
    finding: 'Finding...',
    notFound: 'No account with this email',
    foundUser: 'User found',
    currentRole: 'Current role',
    chooseRole: 'Choose new role to assign',
    assign: 'Assign',
    assigning: 'Assigning...',
    assignSuccess: 'Role assigned successfully!',
    member: 'Member',
    role: 'Role',
    joined: 'Joined',
    members: 'members',
    admin: 'Admin',
    btc: 'Organizer',
    user: 'User',
    adminDesc: 'Full system control',
    btcDesc: 'Create & manage own tournaments',
    userDesc: 'View tournament info only',
    fullAccess: 'Full access',
    createTournament: 'Create tournaments',
    manageOwnTournament: 'Manage own tournaments',
    manageMatches: 'Manage matches & teams',
    manageUsers: 'Manage user roles',
    approvePayments: 'Approve subscriptions',
    uiSettings: 'UI settings',
    viewOnly: 'View only',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Reload',
    empty: 'No users yet',
    confirmDelete: 'Are you sure you want to delete this user?',
    you: 'You',
  }
};

// Mau avatar tao tu ten
const AVATAR_COLORS = [
  'from-red-500 to-rose-600', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-green-600', 'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600', 'from-pink-500 to-fuchsia-600',
  'from-teal-500 to-cyan-600', 'from-indigo-500 to-blue-600',
];

function getInitials(name, email) {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function colorFor(id) {
  const n = Number(id) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '—'; }
}

// Chuan hoa role ve 1 trong 3: admin | btc | user
function normRole(role) {
  const r = (role || '').toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'btc') return 'btc';
  return 'user';
}

export default function Permissions({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // ── State cho phan tim Gmail ──
  const [email, setEmail] = useState('');
  const [finding, setFinding] = useState(false);
  const [findError, setFindError] = useState('');
  const [foundUser, setFoundUser] = useState(null); // nguoi tim thay
  const [pickRole, setPickRole] = useState('btc');   // quyen dang chon de gan
  const [assigning, setAssigning] = useState(false);
  const [assignDone, setAssignDone] = useState(false);

  // Email cua chinh minh (danh dau "Ban")
  const myEmail = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return (u?.email || '').toLowerCase();
    } catch { return ''; }
  })();

  // Tai danh sach nguoi dung
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await userApi.list('');
      setUsers(list);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tim nguoi dung theo Gmail
  const handleFind = async (e) => {
    if (e) e.preventDefault();
    const key = email.trim();
    if (!key) return;

    setFinding(true);
    setFindError('');
    setFoundUser(null);
    setAssignDone(false);
    try {
      const u = await userApi.findByEmail(key);
      setFoundUser(u);
      setPickRole(normRole(u.role)); // mac dinh chon dung quyen hien tai
    } catch (err) {
      // Backend tra 404 "Chua co tai khoan nay"
      setFindError(t.notFound);
    } finally {
      setFinding(false);
    }
  };

  // Gan quyen cho nguoi vua tim thay
  const handleAssign = async () => {
    if (!foundUser) return;
    setAssigning(true);
    try {
      // role gui len backend: "Admin" | "BTC" | "User"
      const roleToSend = pickRole === 'admin' ? 'Admin' : pickRole === 'btc' ? 'BTC' : 'User';
      await userApi.changeRole(foundUser.id, roleToSend);

      // Cap nhat lai: nguoi tim thay + danh sach ben duoi
      setFoundUser({ ...foundUser, role: roleToSend });
      setUsers(prev => {
        const exists = prev.some(x => x.id === foundUser.id);
        if (exists) return prev.map(x => x.id === foundUser.id ? { ...x, role: roleToSend } : x);
        return [{ ...foundUser, role: roleToSend }, ...prev]; // neu chua co trong list thi them
      });
      setAssignDone(true);
      setTimeout(() => setAssignDone(false), 2500);
    } catch (err) {
      alert(err.message || t.error);
    } finally {
      setAssigning(false);
    }
  };

  // Xoa 1 nguoi
  const handleDelete = async (u) => {
    const ok = window.confirm(t.confirmDelete + `\n\n${u.fullName} (${u.email})`);
    if (!ok) return;
    setBusyId(u.id);
    try {
      await userApi.remove(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err) {
      alert(err.message || t.error);
    } finally {
      setBusyId(null);
    }
  };

  // ─── Class theo dark mode ───
  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const inputCls = dm ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const tblRow = dm ? 'border-slate-700/40 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50';
  const tblHead = dm ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500';

  // Dem so luong moi vai tro
  const adminCount = users.filter(u => normRole(u.role) === 'admin').length;
  const btcCount = users.filter(u => normRole(u.role) === 'btc').length;
  const userCount = users.filter(u => normRole(u.role) === 'user').length;

  // Mo ta + badge cho 3 vai tro
  const ROLE_META = {
    admin: { label: t.admin, icon: Crown, color: 'from-red-500 to-rose-600', badge: 'bg-red-500/20 text-red-400' },
    btc:   { label: t.btc,   icon: Wrench, color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-400' },
    user:  { label: t.user,  icon: UserIcon, color: 'from-slate-500 to-slate-600', badge: dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600' },
  };

  // The mo ta 3 vai tro (phan tren)
  const roleCards = [
    {
      id: 'admin', count: adminCount, desc: t.adminDesc,
      bg: dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200',
      perms: [
        { label: t.fullAccess, ok: true },
        { label: t.createTournament, ok: true },
        { label: t.manageMatches, ok: true },
        { label: t.manageUsers, ok: true },
        { label: t.approvePayments, ok: true },
        { label: t.uiSettings, ok: true },
      ],
    },
    {
      id: 'btc', count: btcCount, desc: t.btcDesc,
      bg: dm ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200',
      perms: [
        { label: t.createTournament, ok: true },
        { label: t.manageOwnTournament, ok: true },
        { label: t.manageMatches, ok: true },
        { label: t.manageUsers, ok: false },
        { label: t.approvePayments, ok: false },
        { label: t.uiSettings, ok: false },
      ],
    },
    {
      id: 'user', count: userCount, desc: t.userDesc,
      bg: dm ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-50 border-slate-200',
      perms: [
        { label: t.createTournament, ok: false },
        { label: t.manageMatches, ok: false },
        { label: t.manageUsers, ok: false },
        { label: t.viewOnly, ok: true },
      ],
    },
  ];

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className={sub}>{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.loading : t.retry}
        </button>
      </div>

      {/* ═══ KHU VUC PHAN QUYEN BANG GMAIL ═══ */}
      <div className={`${card} p-5 mb-6`}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-emerald-400" />
          <h2 className={`font-black text-base ${text}`}>{t.grantTitle}</h2>
        </div>

        {/* O nhap Gmail + nut Tim */}
        <form onSubmit={handleFind} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{t.emailLabel}</label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFindError(''); }}
                placeholder={t.emailPlaceholder}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-emerald-500 ${inputCls}`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={finding || !email.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25 disabled:opacity-50"
          >
            {finding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {finding ? t.finding : t.findBtn}
          </button>
        </form>

        {/* Bao loi khong tim thay */}
        {findError && (
          <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {findError}
          </div>
        )}

        {/* Hien thong tin nguoi tim thay + chon quyen */}
        {foundUser && (
          <div className={`mt-4 p-4 rounded-xl border ${dm ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
            {/* Thong tin */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorFor(foundUser.id)} flex items-center justify-center font-black text-white text-sm flex-shrink-0 overflow-hidden`}>
                {foundUser.avatarUrl
                  ? <img src={foundUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : getInitials(foundUser.fullName, foundUser.email)}
              </div>
              <div className="min-w-0">
                <div className={`font-bold text-sm ${text} truncate`}>{foundUser.fullName || '—'}</div>
                <div className={`text-xs ${sub} truncate`}>{foundUser.email}</div>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-[10px] ${sub} mb-1`}>{t.currentRole}</div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${ROLE_META[normRole(foundUser.role)].badge}`}>
                  {ROLE_META[normRole(foundUser.role)].label}
                </span>
              </div>
            </div>

            {/* Chon quyen moi (3 nut) */}
            <div className={`text-xs font-semibold mb-2 ${sub}`}>{t.chooseRole}</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['admin', 'btc', 'user'].map(rid => {
                const meta = ROLE_META[rid];
                const Icon = meta.icon;
                const selected = pickRole === rid;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => setPickRole(rid)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${selected
                      ? `bg-gradient-to-br ${meta.color} border-transparent text-white shadow-lg`
                      : dm ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Nut gan quyen */}
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50"
            >
              {assigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {assigning ? t.assigning : t.assign}
            </button>

            {/* Thong bao thanh cong */}
            {assignDone && (
              <div className="flex items-center gap-2 p-3 mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                {t.assignSuccess}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roles Grid (mo ta 3 vai tro) */}
      <div className="mb-6">
        <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.rolesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleCards.map(role => {
            const meta = ROLE_META[role.id];
            const Icon = meta.icon;
            return (
              <div key={role.id} className={`border-2 rounded-2xl p-5 shadow-xl ${role.bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`font-black text-base ${text}`}>{meta.label}</div>
                    <div className={`text-xs ${sub}`}>{role.desc}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  {role.perms.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {p.ok
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <X className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                      <span className={`text-xs ${p.ok ? text : dm ? 'text-slate-600' : 'text-slate-400'}`}>{p.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <Users className={`w-4 h-4 ${sub}`} />
                  <span className={`text-sm font-bold ${text}`}>{role.count}</span>
                  <span className={`text-xs ${sub}`}>{t.members}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Members Table */}
      <div>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.membersTitle}</h2>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className={`${card} overflow-hidden`}>
          {loading ? (
            <div className={`p-10 text-center ${sub}`}>
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
              {t.loading}
            </div>
          ) : users.length === 0 ? (
            <div className={`p-10 text-center ${sub}`}>
              <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
              {t.empty}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={tblHead}>
                    <th className="px-4 py-3 text-left">{t.member}</th>
                    <th className="px-4 py-3 text-left">{t.role}</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">{t.joined}</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const r = normRole(u.role);
                    const meta = ROLE_META[r];
                    const RoleIcon = meta.icon;
                    const isMe = (u.email || '').toLowerCase() === myEmail;
                    const isBusy = busyId === u.id;
                    return (
                      <tr key={u.id} className={`border-t ${tblRow} transition-colors ${isBusy ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorFor(u.id)} flex items-center justify-center font-black text-white text-xs flex-shrink-0 overflow-hidden`}>
                              {u.avatarUrl
                                ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                                : getInitials(u.fullName, u.email)}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-semibold text-sm ${text} flex items-center gap-2`}>
                                <span className="truncate">{u.fullName || '—'}</span>
                                {isMe && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold flex-shrink-0">{t.you}</span>
                                )}
                              </div>
                              <div className={`text-xs ${sub} truncate`}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${meta.badge}`}>
                            <RoleIcon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className={`px-4 py-4 hidden md:table-cell text-xs ${sub}`}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {!isMe && (
                              <button
                                onClick={() => handleDelete(u)}
                                disabled={isBusy}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}