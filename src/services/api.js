// src/services/api.js
// Lớp service gọi API tập trung tới backend C# (.NET)

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
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Lỗi ${res.status}`);
  }
  return data;
}

// ─── Chuẩn hóa dữ liệu PascalCase (C#) → camelCase (frontend) ────────────────
function normTournament(t) {
  if (!t) return null;
  return {
    id: t.tournamentId ?? t.TournamentId ?? t.id,
    name: t.name ?? t.Name ?? '',
    format: t.format ?? t.Format ?? 'League',
    status: t.status ?? t.Status ?? 'Sắp khởi tranh',
    description: t.description ?? t.Description ?? '',
    maxTeams: t.maxTeams ?? t.MaxTeams ?? 16,
    startDate: t.startDate ?? t.StartDate ?? null,
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
    round: `Vòng ${m.round ?? m.Round ?? '?'}`,
    roundNumber: m.round ?? m.Round,
    status,
    group: null,
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
  // Backend trả { success, data } hoặc trả thẳng
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
};

// ═══════════════════════════════════════════════════════════════════════════
// TOURNAMENTS
// ═══════════════════════════════════════════════════════════════════════════
export const tournamentApi = {
  getAll: async (status) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await request(`/api/Tournaments${q}`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normTournament) : [];
  },

  getById: async (id) => {
    const data = await request(`/api/Tournaments/${id}`);
    return normTournament(unwrap(data));
  },

  create: async (payload) => {
    const data = await request('/api/Tournaments', { method: 'POST', body: JSON.stringify(payload) });
    return normTournament(unwrap(data));
  },

  update: async (id, payload) => {
    const data = await request(`/api/Tournaments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    return normTournament(unwrap(data));
  },

  remove: (id) => request(`/api/Tournaments/${id}`, { method: 'DELETE' }),

  updateStatus: (id, status) =>
    request(`/api/Tournaments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ═══════════════════════════════════════════════════════════════════════════
// TEAMS
// ═══════════════════════════════════════════════════════════════════════════
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
};

// ═══════════════════════════════════════════════════════════════════════════
// MATCHES
// ═══════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
// STANDINGS
// ═══════════════════════════════════════════════════════════════════════════
export const standingApi = {
  get: async (tournamentId) => {
    const data = await request(`/api/tournaments/${tournamentId}/standings`);
    const list = unwrap(data) || [];
    return Array.isArray(list) ? list.map(normStanding) : [];
  },
};

export default { authApi, tournamentApi, teamApi, matchApi, standingApi };