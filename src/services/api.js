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
    round: `Vong ${m.round ?? m.Round ?? '?'}`,
    roundNumber: m.round ?? m.Round,
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
};

export default { authApi, userApi, registrationApi, tournamentApi, teamApi, groupApi, matchApi, standingApi, knockoutApi };