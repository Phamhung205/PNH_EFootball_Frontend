import { useState, useEffect } from 'react';
import {
  Crown, Settings, Eye, Check, X, UserPlus, Mail,
  ChevronDown, Shield, Clock, Trash2, RefreshCw,
  Users, AlertCircle, Activity, LogIn, Edit, Plus
} from 'lucide-react';

const translations = {
  vi: {
    title: 'Phân Quyền & Vai Trò',
    subtitle: 'Quản lý vai trò và quyền truy cập của thành viên',
    rolesTitle: 'Vai Trò Trong Hệ Thống',
    membersTitle: 'Danh Sách Thành Viên',
    inviteTitle: 'Mời Thành Viên',
    activityTitle: 'Nhật Ký Hoạt Động',
    inviteEmail: 'Địa chỉ email',
    inviteEmailPlaceholder: 'vd: user@email.com',
    selectRole: 'Chọn vai trò',
    inviteBtn: 'Gửi Lời Mời',
    inviteSent: 'Đã gửi!',
    member: 'Thành viên',
    email: 'Email',
    role: 'Vai Trò',
    lastActive: 'Hoạt Động Cuối',
    remove: 'Xóa',
    permissions: 'Quyền hạn',
    members: 'thành viên',
    admin: 'Admin',
    organizer: 'Ban Tổ Chức',
    viewer: 'Người Xem',
    adminDesc: 'Toàn quyền kiểm soát hệ thống',
    organizerDesc: 'Quản lý trận đấu và dữ liệu',
    viewerDesc: 'Chỉ xem thông tin',
    fullAccess: 'Toàn quyền truy cập',
    manageMatches: 'Quản lý trận đấu',
    manageTeams: 'Quản lý đội bóng',
    viewStats: 'Xem thống kê',
    exportData: 'Xuất dữ liệu',
    moderateComments: 'Kiểm duyệt bình luận',
    manageUsers: 'Quản lý người dùng',
    systemSettings: 'Cài đặt hệ thống',
    viewOnly: 'Chỉ xem',
    loading: 'Đang tải...',
    error: 'Lỗi tải dữ liệu',
    retry: 'Thử lại',
    justNow: 'Vừa xong',
    minutesAgo: 'phút trước',
    hoursAgo: 'giờ trước',
    daysAgo: 'ngày trước',
  },
  en: {
    title: 'Permissions & Roles',
    subtitle: 'Manage member roles and access permissions',
    rolesTitle: 'System Roles',
    membersTitle: 'Member List',
    inviteTitle: 'Invite Member',
    activityTitle: 'Activity Log',
    inviteEmail: 'Email address',
    inviteEmailPlaceholder: 'e.g. user@email.com',
    selectRole: 'Select role',
    inviteBtn: 'Send Invite',
    inviteSent: 'Sent!',
    member: 'Member',
    email: 'Email',
    role: 'Role',
    lastActive: 'Last Active',
    remove: 'Remove',
    permissions: 'Permissions',
    members: 'members',
    admin: 'Admin',
    organizer: 'Organizer',
    viewer: 'Viewer',
    adminDesc: 'Full system control',
    organizerDesc: 'Manage matches and data',
    viewerDesc: 'View information only',
    fullAccess: 'Full access',
    manageMatches: 'Manage matches',
    manageTeams: 'Manage teams',
    viewStats: 'View statistics',
    exportData: 'Export data',
    moderateComments: 'Moderate comments',
    manageUsers: 'Manage users',
    systemSettings: 'System settings',
    viewOnly: 'View only',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    justNow: 'Just now',
    minutesAgo: 'min ago',
    hoursAgo: 'hr ago',
    daysAgo: 'days ago',
  }
};

const sampleMembers = [
  { id: 1, name: 'Phạm Văn Hùng', email: 'hung@pnh.vn', role: 'admin', avatar: 'PH', color: 'from-red-500 to-rose-600', lastActive: '2 phút trước' },
  { id: 2, name: 'Nguyễn Thị Mai', email: 'mai@pnh.vn', role: 'organizer', avatar: 'NM', color: 'from-blue-500 to-cyan-600', lastActive: '15 phút trước' },
  { id: 3, name: 'Trần Minh Khoa', email: 'khoa@pnh.vn', role: 'organizer', avatar: 'TK', color: 'from-emerald-500 to-green-600', lastActive: '1 giờ trước' },
  { id: 4, name: 'Lê Thanh Tâm', email: 'tam@gmail.com', role: 'viewer', avatar: 'LT', color: 'from-purple-500 to-violet-600', lastActive: '3 giờ trước' },
  { id: 5, name: 'Bùi Quốc Anh', email: 'anh@gmail.com', role: 'viewer', avatar: 'BQ', color: 'from-amber-500 to-orange-600', lastActive: '1 ngày trước' },
];

const activityLog = [
  { user: 'Phạm Văn Hùng', action: language => language === 'vi' ? 'đã xóa bình luận spam' : 'deleted a spam comment', time: '5 phút trước', icon: Trash2, color: 'text-red-400' },
  { user: 'Nguyễn Thị Mai', action: language => language === 'vi' ? 'đã cập nhật kết quả trận đấu' : 'updated match result', time: '23 phút trước', icon: Edit, color: 'text-blue-400' },
  { user: 'Trần Minh Khoa', action: language => language === 'vi' ? 'đã thêm đội bóng mới' : 'added a new team', time: '1 giờ trước', icon: Plus, color: 'text-emerald-400' },
  { user: 'Phạm Văn Hùng', action: language => language === 'vi' ? 'đã mời Lê Thanh Tâm' : 'invited Lê Thanh Tâm', time: '2 giờ trước', icon: UserPlus, color: 'text-purple-400' },
  { user: 'Nguyễn Thị Mai', action: language => language === 'vi' ? 'đã xuất lịch thi đấu' : 'exported schedule', time: '3 giờ trước', icon: Activity, color: 'text-cyan-400' },
  { user: 'Trần Minh Khoa', action: language => language === 'vi' ? 'đã đăng nhập' : 'logged in', time: '4 giờ trước', icon: LogIn, color: 'text-slate-400' },
  { user: 'Phạm Văn Hùng', action: language => language === 'vi' ? 'đã cập nhật cài đặt giải đấu' : 'updated tournament settings', time: '5 giờ trước', icon: Settings, color: 'text-yellow-400' },
  { user: 'Bùi Quốc Anh', action: language => language === 'vi' ? 'đã xem bảng xếp hạng' : 'viewed standings', time: '6 giờ trước', icon: Eye, color: 'text-slate-400' },
  { user: 'Lê Thanh Tâm', action: language => language === 'vi' ? 'đã đăng nhập' : 'logged in', time: '8 giờ trước', icon: LogIn, color: 'text-slate-400' },
  { user: 'Nguyễn Thị Mai', action: language => language === 'vi' ? 'đã duyệt 5 bình luận' : 'approved 5 comments', time: '1 ngày trước', icon: Check, color: 'text-emerald-400' },
];

export default function Permissions({ darkMode = true, language = 'vi' }) {
  const dm = darkMode;
  const t = translations[language] || translations.vi;

  const [members, setMembers] = useState(sampleMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteSent, setInviteSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://localhost:7051/api/permissions');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch {
      // keep sample data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await fetch('https://localhost:7051/api/permissions/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
    } catch {}
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
    setInviteEmail('');
  };

  const changeRole = (id, newRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const card = dm
    ? 'bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';
  const text = dm ? 'text-white' : 'text-slate-900';
  const sub = dm ? 'text-slate-400' : 'text-slate-500';
  const input = dm ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const tblRow = dm ? 'border-slate-700/40 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50';
  const tblHead = dm ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500';

  const roles = [
    {
      id: 'admin',
      label: t.admin,
      desc: t.adminDesc,
      icon: Crown,
      color: 'from-red-500 to-rose-600',
      glow: 'shadow-red-500/20',
      bg: dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200',
      count: members.filter(m => m.role === 'admin').length,
      perms: [
        { label: t.fullAccess, ok: true },
        { label: t.manageMatches, ok: true },
        { label: t.manageTeams, ok: true },
        { label: t.exportData, ok: true },
        { label: t.moderateComments, ok: true },
        { label: t.manageUsers, ok: true },
        { label: t.systemSettings, ok: true },
      ],
    },
    {
      id: 'organizer',
      label: t.organizer,
      desc: t.organizerDesc,
      icon: Settings,
      color: 'from-blue-500 to-cyan-600',
      glow: 'shadow-blue-500/20',
      bg: dm ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
      count: members.filter(m => m.role === 'organizer').length,
      perms: [
        { label: t.fullAccess, ok: false },
        { label: t.manageMatches, ok: true },
        { label: t.manageTeams, ok: true },
        { label: t.exportData, ok: true },
        { label: t.moderateComments, ok: true },
        { label: t.manageUsers, ok: false },
        { label: t.systemSettings, ok: false },
      ],
    },
    {
      id: 'viewer',
      label: t.viewer,
      desc: t.viewerDesc,
      icon: Eye,
      color: 'from-slate-500 to-slate-600',
      glow: 'shadow-slate-500/20',
      bg: dm ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-50 border-slate-200',
      count: members.filter(m => m.role === 'viewer').length,
      perms: [
        { label: t.fullAccess, ok: false },
        { label: t.manageMatches, ok: false },
        { label: t.manageTeams, ok: false },
        { label: t.exportData, ok: false },
        { label: t.moderateComments, ok: false },
        { label: t.manageUsers, ok: false },
        { label: t.viewOnly, ok: true },
      ],
    },
  ];

  const roleLabel = { admin: t.admin, organizer: t.organizer, viewer: t.viewer };
  const roleColor = {
    admin: 'bg-red-500/20 text-red-400',
    organizer: 'bg-blue-500/20 text-blue-400',
    viewer: dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600',
  };

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
          onClick={fetchPermissions}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t.loading : t.retry}
        </button>
      </div>

      {/* Invite Form */}
      <div className={`${card} p-5 mb-6`}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className={`w-4 h-4 ${sub}`} />
          <h2 className={`text-sm font-bold uppercase tracking-wider ${sub}`}>{t.inviteTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder={t.inviteEmailPlaceholder}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-emerald-500 ${input}`}
            />
          </div>
          <div className="relative">
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className={`px-4 py-3 rounded-xl border text-sm appearance-none pr-10 ${dm ? 'bg-slate-950/70 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            >
              <option value="admin">{t.admin}</option>
              <option value="organizer">{t.organizer}</option>
              <option value="viewer">{t.viewer}</option>
            </select>
            <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${sub}`} />
          </div>
          <button
            onClick={handleInvite}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${inviteSent
              ? 'bg-emerald-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25'
            }`}
          >
            {inviteSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {inviteSent ? t.inviteSent : t.inviteBtn}
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="mb-6">
        <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.rolesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(role => {
            const Icon = role.icon;
            return (
              <div key={role.id} className={`border-2 rounded-2xl p-5 shadow-xl ${role.bg} ${role.glow}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`font-black text-base ${text}`}>{role.label}</div>
                    <div className={`text-xs ${sub}`}>{role.desc}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  {role.perms.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {p.ok
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      }
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Members Table */}
        <div className="xl:col-span-3">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.membersTitle}</h2>
          <div className={`${card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={tblHead}>
                    <th className="px-4 py-3 text-left">{t.member}</th>
                    <th className="px-4 py-3 text-left">{t.role}</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">{t.lastActive}</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id} className={`border-t ${tblRow} transition-colors`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center font-black text-white text-xs flex-shrink-0`}>
                            {member.avatar}
                          </div>
                          <div>
                            <div className={`font-semibold text-sm ${text}`}>{member.name}</div>
                            <div className={`text-xs ${sub}`}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <select
                            value={member.role}
                            onChange={e => changeRole(member.id, e.target.value)}
                            className={`appearance-none text-xs font-bold px-3 py-1.5 rounded-lg pr-7 border-0 focus:outline-none cursor-pointer ${roleColor[member.role]} ${dm ? 'bg-opacity-20' : ''}`}
                          >
                            <option value="admin">{t.admin}</option>
                            <option value="organizer">{t.organizer}</option>
                            <option value="viewer">{t.viewer}</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className={`px-4 py-4 hidden md:table-cell text-xs ${sub}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {member.lastActive}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {member.role !== 'admin' && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="xl:col-span-2">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${sub} mb-4`}>{t.activityTitle}</h2>
          <div className={`${card} p-4`}>
            <div className="flex flex-col gap-0">
              {activityLog.map((log, i) => {
                const Icon = log.icon;
                return (
                  <div key={i} className="flex items-start gap-3 py-3 relative">
                    {/* Timeline line */}
                    {i < activityLog.length - 1 && (
                      <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${dm ? 'bg-slate-700/50' : 'bg-slate-200'}`} />
                    )}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Icon className={`w-3.5 h-3.5 ${log.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span className="font-bold">{log.user}</span> {log.action(language)}
                      </div>
                      <div className={`text-xs ${sub} mt-0.5 flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {log.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
