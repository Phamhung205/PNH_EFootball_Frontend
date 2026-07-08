// src/services/api.js
// Lop service goi API tap trung toi backend C# (.NET)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

function getToken() {
  return localStorage.getItem('token') || '';
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// Co bao chi xu ly 1 lan khi phien het han (tranh hien nhieu alert cung luc)
let sessionExpiredHandled = false;

async function request(path, options = {}) {
  const controller = new AbortController();
  // Thoi gian cho mac dinh 60s; co the truyen options.timeoutMs de tang (vd xoa giai nang)
  const timeoutMs = options.timeoutMs || 60000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // 401 = token het han / khong hop le -> xoa dang nhap va dua ve trang dang nhap.
    // Sua loi "phan quyen khong load": truoc day token het han nhung app van giu token cu
    // nen bi ket; gio tu dong dang xuat de dang nhap lai.
    if (res.status === 401) {
      const hadToken = !!getToken();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (hadToken && !sessionExpiredHandled && typeof window !== 'undefined') {
        sessionExpiredHandled = true;
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        window.location.reload();
      }
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Loi ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}


function normTournament(t) {
  if (!t) return null;
  return {
    id: t.tournamentId ?? t.TournamentId ?? t.id,
    name: t.name ?? t.Name ?? '',
    format: t.format ?? t.Format ?? 'League',
    status: t.status ?? t.Status ?? 'Sap khoi tranh',
    description: t.description ?? t.Description ?? '',
    maxTeams: t.maxTeams ?? t.MaxTeams ?? 16,
    startDate: t.startDate ?? t.StartDate ?? null,
    logo: t.logoUrl ?? t.LogoUrl ?? t.logo ?? '',
    // Co cho phep dang ky tham du khong (cho nut Dang ky)
    allowRegistration: t.allowRegistration ?? t.AllowRegistration ?? false,
    season: t.season ?? t.Season ?? '',
    chatEnabled: t.chatEnabled ?? t.ChatEnabled ?? false,
  };
}

function normTeam(t) {
  if (!t) return null;
  return {
    id: t.teamId ?? t.TeamId ?? t.id,
    name: t.name ?? t.Name ?? '',
    logo: t.logoUrl ?? t.LogoUrl ?? t.logo ?? '',
    tournamentId: t.tournamentId ?? t.TournamentId,
    status: t.status ?? t.Status ?? '',
    group: t.groupName ?? t.GroupName ?? null,   // GIAI DOAN 1: ten bang cua doi
  };
}

function normMatch(m) {
  if (!m) return null;
  const raw = m.status ?? m.Status;
  let status = 'pending';
  if (raw === 'Completed' || raw === 'finished' || raw === 'done') status = 'done';
  else if (raw === 'Ongoing' || raw === 'live') status = 'live';
  return {
    id: m.matchId ?? m.MatchId ?? m.id,
    homeId: m.homeTeamId ?? m.HomeTeamId,
    awayId: m.awayTeamId ?? m.AwayTeamId,
    homeScore: (m.homeScore ?? m.HomeScore) ?? null,
    awayScore: (m.awayScore ?? m.AwayScore) ?? null,
    round: `Vong ${m.roundNumber ?? m.round ?? m.Round ?? '?'}`,
    roundNumber: m.roundNumber ?? m.round ?? m.Round,
    status,
    group: m.groupName ?? m.GroupName ?? null,  // <-- ten bang cua tran (cho lich chia theo bang)
  };
}

function normStanding(s) {
  return {
    id: s.teamId ?? s.TeamId,
    rank: s.rank ?? s.Rank,
    name: s.teamName ?? s.TeamName ?? '',
    logo: s.logoUrl ?? s.LogoUrl ?? '',
    P: s.played ?? s.Played ?? 0,
    W: s.won ?? s.Won ?? 0,
    D: s.drawn ?? s.Drawn ?? 0,
    L: s.lost ?? s.Lost ?? 0,
    GF: s.goalsFor ?? s.GoalsFor ?? 0,
    GA: s.goalsAgainst ?? s.GoalsAgainst ?? 0,
    GD: s.goalDiff ?? s.GoalDiff ?? 0,
    Pts: s.points ?? s.Points ?? 0,
  };
}

function unwrap(data) {
  return data?.data ?? data;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const authApi = {
  login: (email, password) =>
    request('/api/Auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  sendOtp: (fullName, email, password) =>
    request('/api/Auth/register/send-otp', { method: 'POST', body: JSON.stringify({ fullName, email, password }) }),
  verifyOtp: (payload) =>
    request('/api/Auth/register/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  externalLogin: (provider, idToken, accessToken) =>
    request('/api/Auth/login/external', { method: 'POST', body: JSON.stringify({ provider, idToken, accessToken }) }),
  forgotPassword: (email) =>
    request('/api/Auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email, otpCode, newPassword) =>
    request('/api/Auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otpCode, newPassword }) }),
};

// ═══════════════════════════════════════════════════════════════════════════
// USERS (QUAN LY NGUOI DUNG - chi admin) - dung cho trang Phan Quyen
// ═══════════════════════════════════════════════════════════════════════════
export const userApi = {
  // Lay danh sach tat ca nguoi dung (co the loc theo tu khoa)
  list: async (search = '') => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const data = await request(`/api/Users${q}`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Tim 1 nguoi dung theo Gmail (de phan quyen). Nem loi neu khong tim thay.
  findByEmail: async (email) => {
    const data = await request(`/api/Users/find?email=${encodeURIComponent(email)}`);
    return unwrap(data);
  },
  // Doi quyen 1 nguoi dung: role = 'Admin' hoac 'User'
  changeRole: async (userId, role) => {
    const data = await request(`/api/Users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return unwrap(data);
  },
  // Xoa 1 nguoi dung
  remove: async (userId) => {
    await request(`/api/Users/${userId}`, { method: 'DELETE' });
    return true;
  },
};

export const tournamentApi = {
  getAll: async () => {
    const data = await request('/api/Tournaments');
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normTournament) : [];
  },
  getById: async (id) => {
    const data = await request(`/api/Tournaments/${id}`);
    return normTournament(unwrap(data));
  },
  // #72: Danh gia sao (rate = gui danh gia, getRating = lay diem)
  rate: async (id, stars) => {
    const data = await request(`/api/Tournaments/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ stars }),
    });
    return unwrap(data) ?? data;
  },
  getRating: async (id) => {
    const data = await request(`/api/Tournaments/${id}/rating`);
    return unwrap(data) ?? data;
  },
  create: async (payload) => {
    // Map logo -> logoUrl cho khop backend (TournamentDto.LogoUrl)
    const body = { ...payload, logoUrl: payload.logoUrl ?? payload.logo };
    const data = await request('/api/Tournaments', { method: 'POST', body: JSON.stringify(body) });
    return normTournament(unwrap(data));
  },
  update: async (id, payload) => {
    const body = { ...payload, logoUrl: payload.logoUrl ?? payload.logo };
    const data = await request(`/api/Tournaments/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    return normTournament(unwrap(data));
  },
  remove: (id) => request(`/api/Tournaments/${id}`, { method: 'DELETE', timeoutMs: 120000 }),
  updateStatus: (id, status) =>
    request(`/api/Tournaments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const teamApi = {
  getByTournament: async (tournamentId) => {
    const data = await request(`/api/tournaments/${tournamentId}/teams`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normTeam) : [];
  },
  create: async (tournamentId, { name, logo }) => {
    const data = await request(`/api/tournaments/${tournamentId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name, logoUrl: logo }),
    });
    return normTeam(unwrap(data));
  },
  update: async (teamId, { name, logo }) => {
    const data = await request(`/api/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, logoUrl: logo }),
    });
    return normTeam(unwrap(data));
  },
  remove: (teamId) => request(`/api/teams/${teamId}`, { method: 'DELETE' }),

  // THU VIEN DOI: lay tat ca doi tu moi giai (de tai lai vao giai moi)
  getLibrary: async (excludeTournamentId) => {
    const q = excludeTournamentId ? `?excludeTournamentId=${excludeTournamentId}` : '';
    const data = await request(`/api/teams/library${q}`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },

  // Lay logo cho danh sach ten doi (dung khi import - chi lay logo doi duoc chon)
  getLogos: async (names) => {
    const data = await request('/api/teams/logos', {
      method: 'POST',
      body: JSON.stringify({ names }),
    });
    const map = unwrap(data) || {};
    return (map && typeof map === 'object') ? map : {};
  },

  // Tao NHIEU doi cung luc (1 request) - nhanh + on dinh khi import nhieu doi
  createBulk: async (tournamentId, names) => {
    const data = await request(`/api/tournaments/${tournamentId}/teams/bulk`, {
      method: 'POST',
      body: JSON.stringify({ names }),
    });
    return data; // { success, message, added }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GROUPS (GIAI DOAN 1 - chia bang)
// ═══════════════════════════════════════════════════════════════════════════
export const groupApi = {
  // Luu phan bang: groupsObj = { A: [teamId,...], B: [...] }
  save: (tournamentId, groupsObj) =>
    request(`/api/tournaments/${tournamentId}/groups`, {
      method: 'PUT',
      body: JSON.stringify({ groups: groupsObj }),
    }),
  // Lay phan bang hien tai (server gom san theo bang)
  get: (tournamentId) =>
    request(`/api/tournaments/${tournamentId}/groups`),
};

export const matchApi = {
  getByTournament: async (tournamentId) => {
    const data = await request(`/api/tournaments/${tournamentId}/matches`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normMatch) : [];
  },
  generateRandom: (tournamentId, type = 'single') =>
    request(`/api/tournaments/${tournamentId}/matches/random`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  updateScore: (matchId, homeScore, awayScore) =>
    request(`/api/matches/${matchId}/score`, {
      method: 'PUT',
      body: JSON.stringify({ homeScore, awayScore }),
    }),
  remove: (matchId) => request(`/api/matches/${matchId}`, { method: 'DELETE' }),
  clearSchedule: (tournamentId) =>
    request(`/api/tournaments/${tournamentId}/matches`, { method: 'DELETE' }),
};

export const standingApi = {
  get: async (tournamentId) => {
    const data = await request(`/api/tournaments/${tournamentId}/standings`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normStanding) : [];
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// KNOCKOUT (GIAI DOAN 3 - so do loai truc tiep)
// ═══════════════════════════════════════════════════════════════════════════
export const knockoutApi = {
  // Lay so do knockout hien co
  get: async (tournamentId) => {
    const data = await request(`/api/knockout/${tournamentId}`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Tao so do: tu dong lay topN moi bang, HOAC truyen manualTeamIds de chinh tay
  generate: async (tournamentId, opts = {}) => {
    // Backend tu dong quyet dinh so doi (2/bang hoac them hang ba). Gui ca opts neu co.
    const data = await request(`/api/knockout/${tournamentId}/generate`, {
      method: 'POST',
      body: JSON.stringify(opts || {}),
    });
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Xoa toan bo so do knockout cua giai
  clearKnockout: async (tournamentId) => {
    await request(`/api/knockout/${tournamentId}`, { method: 'DELETE', timeoutMs: 120000 });
    return true;
  },
  // Luu ti so 1 tran knockout (tra ve so do moi nhat sau khi day doi thang)
  saveScore: async (matchId, homeScore, awayScore, homePenalty = null, awayPenalty = null) => {
    const data = await request(`/api/knockout/match/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify({ homeScore, awayScore, homePenalty, awayPenalty }),
    });
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION (DANG KY THAM DU GIAI)
// ═══════════════════════════════════════════════════════════════════════════
export const registrationApi = {
  // User dang ky tham du 1 giai
  register: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}`, { method: 'POST' });
    return unwrap(data);
  },
  // User huy dang ky
  unregister: async (tournamentId) => {
    await request(`/api/Registration/${tournamentId}`, { method: 'DELETE' });
    return true;
  },
  // Kiem tra minh da dang ky giai nay chua -> { registered, status, teamId }
  myStatus: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}/status`);
    return unwrap(data) || { registered: false };
  },
  // Admin: danh sach nguoi da dang ky 1 giai (chi co ten, khong co email)
  list: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}/list`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // User: cac giai minh da dang ky
  my: async () => {
    const data = await request('/api/Registration/my');
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Admin/BTC: duyet 1 dang ky
  approve: async (registrationId) => {
    await request(`/api/Registration/${registrationId}/approve`, { method: 'PUT' });
    return true;
  },
  // Admin/BTC: tu choi / xoa 1 dang ky
  reject: async (registrationId) => {
    await request(`/api/Registration/${registrationId}/reject`, { method: 'DELETE' });
    return true;
  },
  // Admin/BTC: chia doi tu dong (random) tu danh sach dang ky
  autoAssign: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}/auto-assign`, { method: 'POST' });
    return unwrap(data);
  },
  resetAssign: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}/reset-assign`, { method: 'POST' });
    return unwrap(data);
  },
  // Admin/BTC: sua ten nguoi dang ky
  editName: async (registrationId, fullName) => {
    await request(`/api/Registration/${registrationId}/edit-name`, {
      method: 'PUT',
      body: JSON.stringify({ fullName }),
    });
    return true;
  },
  // Lay doi kem ten nguoi duoc gan (cho phan chia bang)
  teamAssignments: async (tournamentId) => {
    const data = await request(`/api/Registration/${tournamentId}/team-assignments`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
};

// ─── CHAT API (box chat giai dau) ───
export const chatApi = {
  // Kiem tra co quyen vao chat khong
  checkAccess: async (tournamentId) => {
    const data = await request(`/api/Chat/${tournamentId}/access`);
    const r = unwrap(data) ?? data;
    return r?.canAccess ?? false;
  },
  // Lay tin nhan (afterId > 0 de chi lay tin moi - cho polling)
  getMessages: async (tournamentId, afterId = 0) => {
    const data = await request(`/api/Chat/${tournamentId}/messages?afterId=${afterId}`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Gui tin nhan
  send: async (tournamentId, content) => {
    const data = await request(`/api/Chat/${tournamentId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return unwrap(data) ?? data;
  },
  // Admin/BTC xoa tin nhan
  deleteMessage: async (messageId) => {
    await request(`/api/Chat/messages/${messageId}`, { method: 'DELETE' });
    return true;
  },
};

// ─── FEE API (thu phi giai dau) ───
export const feeApi = {
  // Lay thong tin phi (phi, ngan hang, tien thuong, tong quy)
  getInfo: async (tournamentId) => {
    const data = await request(`/api/Fee/${tournamentId}`);
    return unwrap(data) ?? data;
  },
  // Danh sach dong phi (ai da dong)
  getList: async (tournamentId) => {
    const data = await request(`/api/Fee/${tournamentId}/list`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list : [];
  },
  // Admin xac nhan/huy dong phi
  togglePaid: async (registrationId) => {
    const data = await request(`/api/Fee/${registrationId}/toggle-paid`, { method: 'PUT' });
    return unwrap(data) ?? data;
  },
  // Admin cau hinh phi
  setConfig: async (tournamentId, config) => {
    const data = await request(`/api/Fee/${tournamentId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return unwrap(data) ?? data;
  },
};

export default { authApi, userApi, registrationApi, tournamentApi, teamApi, groupApi, matchApi, standingApi, knockoutApi, chatApi, feeApi };