import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout    from './pages/Layout';
import AuthPage  from './pages/AuthPage';

/* ── Level 1 Main Pages ── */
import HomePage             from './pages/home/HomePage';
import TournamentList       from './pages/home/TournamentList';
import CreateTournamentForm from './pages/home/CreateTournamentForm';

/* ── Level 2 Workspace Shell ── */
import TournamentWorkspace  from './pages/TournamentWorkspace';

/* ── Level 2 Tournament Pages ── */
import TournamentOverview  from './pages/tournament/TournamentOverview';
import ChatPage            from './pages/tournament/ChatPage';
import TeamManager         from './pages/tournament/TeamManager';
import GroupSetup          from './pages/dashboard/GroupSetup';
import Schedule            from './pages/tournament/Schedule';
import Standings           from './pages/dashboard/Standings';
import KnockoutBracket     from './pages/tournament/KnockoutBracket';
import ExportPage          from './pages/tournament/ExportPage';
import FeePage             from './pages/tournament/FeePage';
import QualifiedTeams      from './pages/tournament/QualifiedTeams';
import ActivationGate      from './pages/tournament/ActivationGate';
import TournamentSettings  from './pages/tournament/TournamentSettings';

/* ── Account Sub-Pages ── */
import Profile             from './pages/account/Profile';
import ChangePassword      from './pages/account/ChangePassword';
import Subscription        from './pages/account/Subscription';
import MyRegistrations      from './pages/account/MyRegistrations';
import Permissions         from './pages/admin/admin/Permissions';
import UISettings          from './pages/admin/admin/UISettings';
import PaymentApproval     from './pages/admin/admin/PaymentApproval';

import { User, KeyRound, CreditCard, Shield, Palette, ClipboardList, Wallet, Lock } from 'lucide-react';

/* ── API services ── */
import { tournamentApi, teamApi, matchApi, standingApi, warmupServer } from './services/api';
import ChatWidget from './components/ChatWidget';

/* ════════════════════════════════════════════════════════════
   ACCOUNT SIDEBAR LAYOUT
   ════════════════════════════════════════════════════════════ */
const AccountLayout = ({ activeTab, onTab, user, darkMode, language = 'vi', children }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const MENU = [
    { id: 'profile', icon: User, label: tr('Hồ Sơ Cá Nhân','My Profile') },
    { id: 'my-registrations', icon: ClipboardList, label: tr('Giải Đã Đăng Ký','My Registrations') },
    { id: 'change-pwd', icon: KeyRound, label: tr('Đổi Mật Khẩu','Change Password') },
    { id: 'subscription', icon: CreditCard, label: tr('Gói Đăng Ký','Subscription') },
  ];
  if (isAdmin) {
    MENU.push(
      { id: 'payment-approval', icon: Wallet, label: tr('Duyệt Thanh Toán','Payment Approval') },
      { id: 'permissions', icon: Shield, label: tr('Phân Quyền','Permissions') },
      { id: 'ui-settings', icon: Palette, label: tr('Cài Đặt Giao Diện','Interface Settings') }
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 min-h-[calc(100vh-4rem)]" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <aside className={`w-full md:w-60 shrink-0 p-3.5 rounded-2xl border ${dm ? 'bg-white/4 border-white/8' : 'bg-white border-slate-200 shadow-sm'} space-y-1`}>
        <p className={`text-[10px] font-black tracking-widest uppercase px-3 py-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{tr('TÀI KHOẢN','ACCOUNT')}</p>
        {MENU.map(item => {
          const Icon = item.icon;
          const isSel = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => onTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${isSel
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/5 text-white border border-emerald-500/20 shadow-md shadow-emerald-500/5'
                  : dm ? 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}>
              <Icon size={16} className={isSel ? 'text-emerald-400' : 'opacity-60'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   APP CENTRAL CONTROLLER (kết nối backend C#)
   ════════════════════════════════════════════════════════════ */
/**
 * Boc noi dung CAN TRA PHI.
 *
 * Giai da mo khoa -> hien binh thuong.
 * Chua mo khoa -> VAN HIEN giao dien (de nguoi dung xem truoc duoc),
 *   nhung phu mot lop mo + dai bang "Phai tra phi de kich hoat" o tren,
 *   va chan moi thao tac bang lop trong suot.
 *
 * Backend van chan doc lap (tra 402 Payment Required), day chi la lop hien thi.
 */
/**
 * Trang thai kich hoat DUNG CHUNG cho ca app.
 *
 * Truoc day moi LockedTab tu goi API va giu trang thai rieng, nen mo khoa
 * o tab Chia Bang thi tab Lich VAN KHOA (no khong biet). Bay gio tat ca
 * cung doc mot cho, kich hoat xong la MOI TAB tu mo cung luc.
 */
const ActivationContext = React.createContext({ unlocked: true, refresh: () => {} });

const ActivationProvider = ({ tournamentId, children }) => {
  const [unlocked, setUnlocked] = useState(true); // mac dinh mo, tranh nhap nhay
  const [checked, setChecked]   = useState(false);

  const refresh = React.useCallback(() => {
    if (!tournamentId) { setUnlocked(true); setChecked(true); return; }
    tournamentApi.getActivation(tournamentId)
      .then(res => setUnlocked(!!(res?.isPaid || res?.isFree)))
      // Loi mang -> cho qua, de backend chan (402).
      // Khoa oan khi mat ket noi con te hon la de lot roi backend tu choi.
      .catch(() => setUnlocked(true))
      .finally(() => setChecked(true));
  }, [tournamentId]);

  useEffect(() => { setChecked(false); refresh(); }, [refresh]);

  const value = React.useMemo(() => ({ unlocked, checked, refresh }), [unlocked, checked, refresh]);
  return <ActivationContext.Provider value={value}>{children}</ActivationContext.Provider>;
};

/**
 * Boc noi dung CAN TRA PHI.
 * Chua kich hoat -> van hien giao dien (mo 40%) kem dai bang, nhung khong bam duoc.
 * Backend van chan doc lap bang ma 402.
 */
const LockedTab = ({ tournamentId, language, darkMode, children }) => {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const { unlocked, checked, refresh } = React.useContext(ActivationContext);
  const [showPay, setShowPay] = useState(false);
  const [fee, setFee] = useState(0);
  const [hasTeams, setHasTeams] = useState(true);

  // Lay so tien + da co doi chua, de hien dung chu tren dai bang
  useEffect(() => {
    let alive = true;
    if (unlocked || !tournamentId) return;
    tournamentApi.getActivation(tournamentId)
      .then(r => {
        if (!alive) return;
        setFee(Number(r?.fee || 0));
        setHasTeams(r?.hasTeams !== false);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [unlocked, tournamentId]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-white/40">
        {tr('Đang kiểm tra...', 'Checking...')}
      </div>
    );
  }

  if (unlocked) return children;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Dai bang canh bao — bam de mo man hinh dang ky */}
      <button onClick={() => setShowPay(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-500/12 border border-amber-500/35 hover:bg-amber-500/18 transition-all text-left">
        <Lock size={18} className="text-amber-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-amber-300">
            {tr('Tính năng này cần kích hoạt giải', 'This feature requires activation')}
          </p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">
            {!hasTeams
              ? tr('Cần nhập đội tham dự trước mới tính được phí. Nhấn để xem chi tiết.',
                   'Add teams first so the fee can be calculated. Tap for details.')
              : fee > 0
                ? tr(`Phải trả phí ${fee.toLocaleString('vi-VN')}đ để dùng. Nhấn để xem cách đăng ký.`,
                     `Costs ${fee.toLocaleString('vi-VN')}đ to unlock. Tap to see how to register.`)
                : tr('Nhấn để xem cách đăng ký.', 'Tap to see how to register.')}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200">
          {showPay ? tr('Ẩn', 'Hide') : tr('Đăng ký', 'Activate')}
        </span>
      </button>

      {/* Man hinh dang ky */}
      {showPay && (
        <ActivationGate
          tournamentId={tournamentId}
          language={language}
          darkMode={darkMode}
          onUnlocked={refresh}
        />
      )}

      {/* Noi dung that: hien de xem truoc, khong bam duoc */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="opacity-40 pointer-events-none select-none" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 cursor-not-allowed" onClick={() => setShowPay(true)} />
      </div>
    </div>
  );
};

const App = () => {
  /* ── Auth ── */
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    if (!localStorage.getItem('token')) return null;
    try {
      const saved = JSON.parse(localStorage.getItem('user') || 'null');
      if (saved) return saved;
    } catch {}
    return { name: 'Người dùng', email: 'user@guest.com', role: 'User', plan: 'free' };
  });

  /* ── Navigation ── */
  const [currentView, setCurrentView] = useState('home');
  const [activeAccountTab, setActiveAccountTab] = useState('profile');
  const [activeTournamentId, setActiveTournamentId] = useState(null);

  // Link chia se chat: doc ?chat={id} tu URL. Neu co -> mo trang chat toan man hinh.
  const [chatTournamentId, setChatTournamentId] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const c = p.get('chat');
      return c ? parseInt(c, 10) : null;
    } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Theme & Language ── */
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'vi');
  useEffect(() => { try { localStorage.setItem('lang', language); } catch {} }, [language]);

  /* ── Data từ backend ── */
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [groups, setGroups] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  // Danh thuc backend + DB ngay khi mo web (giam "lan dau cham")
  useEffect(() => { warmupServer(); }, []);

  /* ─── Load danh sách giải khi đăng nhập ─── */
  const loadTournaments = useCallback(async () => {
    try {
      const list = await tournamentApi.getAll();
      setTournaments(list);
    } catch (e) {
      console.warn('Load tournaments:', e.message);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadTournaments();
  }, [isLoggedIn, loadTournaments]);

  /* ─── Load chi tiết 1 giải (teams, matches, standings) khi vào workspace ───
     FIX: xoa data giai cu NGAY truoc khi load + chi nhan doi DUNG giai
     -> het "luc hien luc khong" va doi lan giua cac giai */
  // Bien dem de chong race condition (chi nhan ket qua cua lan load MOI NHAT)
  const loadSeqRef = React.useRef(0);

  const loadTournamentDetail = useCallback(async (tid, opts = {}) => {
    if (!tid) return;
    const { silent = false } = opts; // silent = true: KHONG xoa trang data (dung khi reload sau khi them doi)
    const mySeq = ++loadSeqRef.current; // danh dau lan load nay

    if (!silent) {
      // Chi xoa trang khi MOI vao giai (tranh chop trang khi reload)
      setTeams([]);
      setMatches([]);
      setStandings([]);
    }
    setLoadingData(true);
    try {
      // Tai DOI truoc + hien NGAY (quan trong nhat). Tat loading ngay sau khi co doi
      // -> nguoi dung thay doi lien, khong cho tran dau + BXH.
      const tms = await teamApi.getByTournament(tid).catch(() => []);
      if (mySeq !== loadSeqRef.current) return;
      setTeams((tms || []).filter(t => String(t.tournamentId) === String(tid)));
      setLoadingData(false); // doi da co -> tat loading ngay

      // Tran dau + BXH tai NGAM phia sau (khong chan hien thi doi)
      matchApi.getByTournament(tid)
        .then(mts => { if (mySeq === loadSeqRef.current) setMatches(mts || []); })
        .catch(() => {});
      standingApi.get(tid)
        .then(stand => { if (mySeq === loadSeqRef.current) setStandings(stand || []); })
        .catch(() => {});
    } catch (e) {
      console.warn('Load detail:', e.message);
    } finally {
      if (mySeq === loadSeqRef.current) setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (activeTournamentId) loadTournamentDetail(activeTournamentId);
  }, [activeTournamentId, loadTournamentDetail]);

  /* ── Active tournament assembly ── */
  const fullActiveTournament = useMemo(() => {
    if (!activeTournamentId) return null;
    const base = tournaments.find(t => String(t.id) === String(activeTournamentId));
    if (!base) return null;
    return {
      ...base,
      teams,
      matches,
      standings,
      groups: groups[activeTournamentId] || {},
    };
  }, [activeTournamentId, tournaments, teams, matches, standings, groups]);

  /* ── Navigation handlers ── */
  const onNavigate = useCallback((view, accountTab = null) => {
    setActiveTournamentId(null);
    setCurrentView(view);
    if (accountTab) setActiveAccountTab(accountTab);
    if (view === 'tournaments') loadTournaments();
  }, [loadTournaments]);

  const onEnterTournament = useCallback((tid) => {
    setActiveTournamentId(tid);
    setActiveTab('overview');
  }, []);

  const onExitTournament = useCallback(() => {
    setActiveTournamentId(null);
    setCurrentView('tournaments');
    loadTournaments();
  }, [loadTournaments]);

  /* ── Tạo giải mới (lưu backend) ── */
  const handleTournamentCreated = useCallback(async (newTour) => {
    // Ném lỗi ra ngoài để form (CreateTournamentForm) bắt và hiện 403 đúng
    const created = await tournamentApi.create({
      name: newTour.name,
      format: newTour.format || 'League',
      status: newTour.status || 'Sắp khởi tranh',
      description: newTour.description || '',
      maxTeams: newTour.maxTeams || 16,
      logo: newTour.logo || newTour.logoUrl || '',   // FIX LOGO: gửi logo lên backend khi tạo giải
    });
    await loadTournaments();
    if (created?.id) {
      setActiveTournamentId(created.id);
      setActiveTab('teams');
    }
  }, [loadTournaments]);

  /* ── Cập nhật giải / teams / matches qua backend ── */
  const handleTournamentUpdate = useCallback(async (updated) => {
    const tid = updated.id || activeTournamentId;
    if (!tid) return;

    if (updated.name !== undefined || updated.status !== undefined || updated.format !== undefined || updated.logo !== undefined || updated.allowRegistration !== undefined) {
      // KHONG nuot loi: de loi truyen ra cho UI bao that bai (truoc day chi console.warn -> bao thanh cong gia)
      await tournamentApi.update(tid, {
        name: updated.name,
        format: updated.format,
        status: updated.status,
        description: updated.description,
        logo: updated.logo,
        // Them allowRegistration (bat/tat dang ky tham du)
        allowRegistration: updated.allowRegistration,
      });
    }

    if (updated.matches) {
      setMatches(updated.matches);
      await loadTournamentDetail(tid);
    }

    // Cap nhat NGAY danh sach giai bang du lieu vua gui, KHONG cho tai lai.
    // Truoc day goi await loadTournaments() -> them MOT chuyen di mang nua,
    // nguoi dung phai cho 2 lan (luu + tai lai) moi thay phan hoi.
    setTournaments(prev => prev.map(t =>
      String(t.id) === String(tid)
        ? {
            ...t,
            ...(updated.name !== undefined ? { name: updated.name } : {}),
            ...(updated.status !== undefined ? { status: updated.status } : {}),
            ...(updated.format !== undefined ? { format: updated.format } : {}),
            ...(updated.logo !== undefined ? { logo: updated.logo } : {}),
            ...(updated.allowRegistration !== undefined ? { allowRegistration: updated.allowRegistration } : {}),
            ...(updated.chatEnabled !== undefined ? { chatEnabled: updated.chatEnabled } : {}),
          }
        : t
    ));

    // Tai lai o NEN de dong bo cac truong khac (khong await -> khong bat cho).
    loadTournaments();
  }, [activeTournamentId, loadTournaments, loadTournamentDetail]);

  /* ── Xóa giải ── */
  const handleTournamentDelete = useCallback(async () => {
    if (!activeTournamentId) return;
    try {
      await tournamentApi.remove(activeTournamentId);
      setActiveTournamentId(null);
      setCurrentView('tournaments');
      loadTournaments();
    } catch (e) {
      alert('Lỗi xóa giải: ' + e.message);
    }
  }, [activeTournamentId, loadTournaments]);

  /* ── Groups (lưu local đồng bộ; backend lưu thật qua groupApi trong GroupSetup) ── */
  const handleGroupsChange = useCallback((newGroups) => {
    if (!activeTournamentId) return;
    setGroups(prev => ({ ...prev, [activeTournamentId]: newGroups }));
  }, [activeTournamentId]);

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    // Luu luon vao localStorage de lan mo app sau van dung du lieu moi nhat
    // (vd doi anh dai dien xong dong app, mo lai van thay anh moi).
    try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch { /* bo qua */ }
  }, []);

  const onLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('home');
    setActiveTournamentId(null);
    setTournaments([]); setTeams([]); setMatches([]); setStandings([]);
  }, []);

  /* ════ Link chia se chat: mo trang chat toan man hinh ════ */
  // Ham dong chat: xoa ?chat= khoi URL va quay ve app
  const closeChatPage = useCallback(() => {
    setChatTournamentId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('chat');
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch {}
  }, []);

  if (chatTournamentId) {
    return (
      <ChatPage
        tournamentId={chatTournamentId}
        currentUser={isLoggedIn ? user : null}
        darkMode={darkMode}
        language={language}
        onBack={closeChatPage}
      />
    );
  }

  /* ════ Auth gate ════ */
  if (!isLoggedIn) {
    return (
      <AuthPage
        darkMode={darkMode}
        language={language}
        onLogin={(userData) => {
          setIsLoggedIn(true);
          // FIX LỖI 2: dùng ROLE THẬT từ backend trả về (qua AuthPage onLogin).
          const em = (userData?.email || '').toLowerCase();
          const ADMIN_FALLBACK = ['aadmin588@gmail.com'];
          let role = (userData?.role || '').toString();
          if (!role) role = ADMIN_FALLBACK.includes(em) ? 'Admin' : 'User';
          role = role.toLowerCase() === 'admin' ? 'Admin' : 'User';

          const u = {
            // Luu id de biet giai nao do CHINH MINH tao (trang "Giai cua toi")
            id: userData?.id ?? userData?.Id ?? null,
            name: userData?.name || userData?.fullName || (role === 'Admin' ? 'Admin' : 'Người dùng'),
            email: em || 'user@guest.com',
            role,
            // Doc goi that tu server (khong con gan cung 'free')
            plan: userData?.plan || userData?.Plan || 'free',
            planExpiry: userData?.planExpiry || userData?.PlanExpiry || null,
            avatar: userData?.avatar || userData?.avatarUrl || '',
          };
          localStorage.setItem('user', JSON.stringify(u));
          setUser(u);
        }}
      />
    );
  }

  /* ════ LEVEL 2: WORKSPACE ════ */
  if (activeTournamentId && fullActiveTournament) {
    const isUserAdmin = (user?.role || '').toLowerCase() === 'admin';
    // Quyen quan ly giai DANG MO: Admin, hoac chinh nguoi da tao giai nay.
    // Nho vay user thuong dung duoc DAY DU tinh nang tren giai cua minh.
    const canManageActive =
      isUserAdmin ||
      (user?.id != null &&
       fullActiveTournament?.createdByUserId != null &&
       fullActiveTournament.createdByUserId === user.id);
    let activeWorkspaceView = null;

    switch (activeTab) {
      case 'overview':
        activeWorkspaceView = (
          <TournamentOverview tournament={fullActiveTournament} user={user} darkMode={darkMode} language={language}
            onNavigate={setActiveTab} onUpdate={handleTournamentUpdate} />
        );
        break;
      case 'teams':
        activeWorkspaceView = (
          <TeamManager tournament={fullActiveTournament} darkMode={darkMode} language={language}
            isAdmin={canManageActive} onUpdate={handleTournamentUpdate} onReload={() => loadTournamentDetail(activeTournamentId, { silent: true })} />
        );
        break;
      case 'groups':
        activeWorkspaceView = (
          <LockedTab tournamentId={activeTournamentId} language={language} darkMode={darkMode}>
            <GroupSetup darkMode={darkMode} language={language} teams={fullActiveTournament.teams}
              activeTournament={fullActiveTournament} groups={fullActiveTournament.groups}
              isAdmin={canManageActive} matches={fullActiveTournament.matches}
              onGoToTab={setActiveTab}
              onGroupsChange={handleGroupsChange} onReload={() => loadTournamentDetail(activeTournamentId)} />
          </LockedTab>
        );
        break;
      case 'schedule':
        activeWorkspaceView = (
          <LockedTab tournamentId={activeTournamentId} language={language} darkMode={darkMode}>
            <Schedule tournament={fullActiveTournament} darkMode={darkMode} language={language}
              isAdmin={canManageActive} onUpdate={handleTournamentUpdate} />
          </LockedTab>
        );
        break;
      case 'standings':
        activeWorkspaceView = (
          <Standings darkMode={darkMode} language={language} teams={fullActiveTournament.teams}
            matches={fullActiveTournament.matches} groups={fullActiveTournament.groups}
            tournamentId={fullActiveTournament.id} standings={fullActiveTournament.standings}
            tournamentInfo={fullActiveTournament} />
        );
        break;
      case 'knockout':
        activeWorkspaceView = (
          <LockedTab tournamentId={activeTournamentId} language={language} darkMode={darkMode}>
            <KnockoutBracket
              tournament={fullActiveTournament}
              teams={fullActiveTournament.teams}
              tournamentName={fullActiveTournament.name}
              isAdmin={canManageActive} language={language} />
          </LockedTab>
        );
        break;
      case 'qualified':
        activeWorkspaceView = (
          <QualifiedTeams tournament={fullActiveTournament} tournamentName={fullActiveTournament.name} language={language} isAdmin={canManageActive} />
        );
        break;
      case 'fund':
        activeWorkspaceView = (
          <FeePage tournamentId={activeTournamentId} tournament={fullActiveTournament} currentUser={user} darkMode={darkMode} language={language} />
        );
        break;
      case 'export':
        activeWorkspaceView = (
          <ExportPage tournament={fullActiveTournament} darkMode={darkMode} language={language} userPlan={user?.plan || 'free'} />
        );
        break;
      case 'settings':
        activeWorkspaceView = (
          <TournamentSettings tournament={fullActiveTournament} darkMode={darkMode} language={language}
            isAdmin={canManageActive} onUpdate={handleTournamentUpdate} onDelete={handleTournamentDelete} />
        );
        break;
      default:
        activeWorkspaceView = <div className="p-8 text-center opacity-50">Component Not Found</div>;
    }

    return (
      // ActivationProvider: MOT trang thai kich hoat dung chung cho moi tab.
      // Nho vay Admin cap phep xong, bam "Kiem tra lai" mot lan la CA 3 tab
      // (Chia Bang, Lich, So Do) cung mo khoa — khong phai dang ky lai tung tab.
      <ActivationProvider tournamentId={activeTournamentId}>
        <TournamentWorkspace user={user} tournament={fullActiveTournament} activeTab={activeTab}
          onTab={setActiveTab} onExit={onExitTournament} darkMode={darkMode} setDarkMode={setDarkMode}
          language={language} onLogout={onLogout}>
          <div key={activeTab} style={{ animation: 'fadeUp .22s ease-out both' }}>
            {activeWorkspaceView}
          </div>
        </TournamentWorkspace>
      </ActivationProvider>
    );
  }

  /* ════ LEVEL 1: DASHBOARD ════ */
  let activeMainView = null;
  switch (currentView) {
    case 'home':
      activeMainView = <HomePage darkMode={darkMode} onNavigate={onNavigate} language={language} />;
      break;
    case 'tournaments':
      activeMainView = (
        <TournamentList tournaments={tournaments} darkMode={darkMode} language={language}
          onEnter={onEnterTournament} onCreateNew={() => onNavigate('create')} user={user} />
      );
      break;
    case 'create':
      activeMainView = (
        <CreateTournamentForm darkMode={darkMode} language={language}
          onCreated={handleTournamentCreated} onCancel={() => onNavigate('tournaments')} userPlan={user?.plan || 'free'} />
      );
      break;
    case 'account':
      let accountSubView = null;
      const isUserAdminAcct = (user?.role || '').toLowerCase() === 'admin';
      if ((activeAccountTab === 'permissions' || activeAccountTab === 'ui-settings') && !isUserAdminAcct) {
        accountSubView = (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/15 mb-4">
              <Shield size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Không có quyền truy cập</h3>
            <p className="text-sm text-slate-400">Chỉ Quản trị viên (Admin) mới có thể xem trang này.</p>
          </div>
        );
      } else {
        switch (activeAccountTab) {
          case 'profile': accountSubView = <Profile darkMode={darkMode} language={language} onUpdateUser={handleUpdateUser} />; break;
          case 'my-registrations': accountSubView = <MyRegistrations darkMode={darkMode} language={language} />; break;
          case 'change-pwd': accountSubView = <ChangePassword darkMode={darkMode} language={language} />; break;
          case 'subscription': accountSubView = <Subscription user={user} onUpdateUser={handleUpdateUser} darkMode={darkMode} language={language} />; break;
          case 'payment-approval': accountSubView = <PaymentApproval darkMode={darkMode} language={language} />; break;
          case 'permissions': accountSubView = <Permissions darkMode={darkMode} language={language} />; break;
          case 'ui-settings': accountSubView = <UISettings darkMode={darkMode} language={language} />; break;
          default: accountSubView = <div className="p-8 text-center opacity-50">Subtab Not Found</div>;
        }
      }
      activeMainView = (
        <AccountLayout activeTab={activeAccountTab} onTab={setActiveAccountTab} user={user} darkMode={darkMode} language={language}>
          <div key={activeAccountTab} style={{ animation: 'fadeUp .2s ease-out both' }}>{accountSubView}</div>
        </AccountLayout>
      );
      break;
    default:
      activeMainView = <div className="p-8 text-center opacity-50">Page Not Found</div>;
  }

  return (
    <Layout user={user} currentView={currentView} onNavigate={onNavigate} onLogout={onLogout}
      darkMode={darkMode} setDarkMode={setDarkMode} language={language} setLanguage={setLanguage}>
      <div key={currentView} style={{ animation: 'fadeUp .22s ease-out both' }}>
        {activeMainView}
      </div>
      {/* Tro ly AI noi goc man hinh */}
      <ChatWidget />
    </Layout>
  );
};

export default App;