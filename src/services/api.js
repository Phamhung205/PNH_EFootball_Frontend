// src/services/api.js
// Lớp service gọi API tập trung tới backend C# (.NET)
// Có fallback dữ liệu ảo khi backend không kết nối được (cho demo Vercel)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

// Phát hiện môi trường demo: backend không kết nối được (Vercel, hoặc local backend tắt)
let USE_MOCK = false;
let mockChecked = false;

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
  if (USE_MOCK) return mockResponse(path, options);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    mockChecked = true;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Lỗi ${res.status}`);
    return data;
  } catch (err) {
    // Backend không kết nối được → chuyển sang mock
    if (!mockChecked) {
      console.warn('🎭 Backend không kết nối, dùng dữ liệu ảo (demo mode)');
      USE_MOCK = true;
      mockChecked = true;
      return mockResponse(path, options);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA (dữ liệu ảo cho demo)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK = {
  tournaments: [
    { id: 1, name: 'Ngoại Hạng Anh 2026', format: 'League', status: 'Đang diễn ra', maxTeams: 20, description: 'Giải đấu hàng đầu nước Anh' },
    { id: 2, name: 'Champions League', format: 'GroupStage_Knockout', status: 'Sắp khởi tranh', maxTeams: 16, description: 'Cúp C1 châu Âu' },
  ],
  teams: {
    1: [
      { id: 101, name: 'Manchester United', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg' },
      { id: 102, name: 'Liverpool FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg' },
      { id: 103, name: 'Arsenal FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg' },
      { id: 104, name: 'Chelsea FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg' },
      { id: 105, name: 'Manchester City', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg' },
      { id: 106, name: 'Tottenham', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg' },
    ],
    2: [
      { id: 201, name: 'Real Madrid', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg' },
      { id: 202, name: 'Barcelona', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' },
    ],
  },
  matches: {
    1: [
      { matchId: 1001, homeTeamId: 101, awayTeamId: 102, round: 1, homeScore: 2, awayScore: 1, status: 'Completed' },
      { matchId: 1002, homeTeamId: 103, awayTeamId: 104, round: 1, homeScore: 1, awayScore: 1, status: 'Completed' },
      { matchId: 1003, homeTeamId: 105, awayTeamId: 106, round: 1, homeScore: 3, awayScore: 0, status: 'Completed' },
      { matchId: 1004, homeTeamId: 101, awayTeamId: 103, round: 2, homeScore: 0, awayScore: 2, status: 'Completed' },
      { matchId: 1005, homeTeamId: 102, awayTeamId: 105, round: 2, homeScore: 2, awayScore: 2, status: 'Completed' },
      { matchId: 1006, homeTeamId: 104, awayTeamId: 106, round: 2, homeScore: 1, awayScore: 0, status: 'Completed' },
      { matchId: 1007, homeTeamId: 101, awayTeamId: 104, round: 3, homeScore: null, awayScore: null, status: 'Scheduled' },
      { matchId: 1008, homeTeamId: 102, awayTeamId: 106, round: 3, homeScore: null, awayScore: null, status: 'Scheduled' },
      { matchId: 1009, homeTeamId: 103, awayTeamId: 105, round: 3, homeScore: null, awayScore: null, status: 'Scheduled' },
    ],
    2: [],
  },
  nextId: 1000,
};

function computeStandings(tournamentId) {
  const teams = MOCK.teams[tournamentId] || [];
  const matches = (MOCK.matches[tournamentId] || []).filter(m => m.status === 'Completed');
  return teams.map(t => {
    const home = matches.filter(m => m.homeTeamId === t.id);
    const away = matches.filter(m => m.awayTeamId === t.id);
    const w = home.filter(m => m.homeScore > m.awayScore).length + away.filter(m => m.awayScore > m.homeScore).length;
    const l = home.filter(m => m.homeScore < m.awayScore).length + away.filter(m => m.awayScore < m.homeScore).length;
    const d = home.filter(m => m.homeScore === m.awayScore).length + away.filter(m => m.awayScore === m.homeScore).length;
    const gf = home.reduce((s, m) => s + (m.homeScore || 0), 0) + away.reduce((s, m) => s + (m.awayScore || 0), 0);
    const ga = home.reduce((s, m) => s + (m.awayScore || 0), 0) + away.reduce((s, m) => s + (m.homeScore || 0), 0);
    return {
      teamId: t.id, teamName: t.name, logoUrl: t.logoUrl,
      played: home.length + away.length, won: w, drawn: d, lost: l,
      goalsFor: gf, goalsAgainst: ga, goalDiff: gf - ga, points: w * 3 + d,
    };
  }).sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

async function mockResponse(path, options = {}) {
  await new Promise(r => setTimeout(r, 200)); // giả delay
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;

  // AUTH
  if (path.includes('/Auth/login') || path.includes('/auth/login')) {
    return { token: 'mock-demo-token-' + Date.now(), user: { Email: body?.email || 'admin@pnhfootball.com', FullName: 'Admin Demo' } };
  }
  if (path.includes('/register/send-otp')) return { success: true, message: 'OTP gửi thành công (demo)' };
  if (path.includes('/register/verify-otp')) return { success: true, data: { token: 'mock-demo-token' } };

  // TOURNAMENTS
  if (path === '/api/Tournaments' && method === 'GET') return { success: true, data: MOCK.tournaments };
  const tMatch = path.match(/^\/api\/Tournaments\/(\d+)$/);
  if (tMatch && method === 'GET') {
    const t = MOCK.tournaments.find(x => x.id === +tMatch[1]);
    return { success: true, data: t };
  }
  if (path === '/api/Tournaments' && method === 'POST') {
    const id = ++MOCK.nextId;
    const t = { id, ...body };
    MOCK.tournaments.push(t);
    MOCK.teams[id] = []; MOCK.matches[id] = [];
    return { success: true, data: t };
  }
  if (tMatch && method === 'PUT') {
    const t = MOCK.tournaments.find(x => x.id === +tMatch[1]);
    if (t) Object.assign(t, body);
    return { success: true, data: t };
  }
  if (tMatch && method === 'DELETE') {
    MOCK.tournaments = MOCK.tournaments.filter(x => x.id !== +tMatch[1]);
    return { success: true };
  }
  const statusMatch = path.match(/^\/api\/Tournaments\/(\d+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const t = MOCK.tournaments.find(x => x.id === +statusMatch[1]);
    if (t) t.status = body.status;
    return { success: true, data: t };
  }

  // TEAMS
  const teamsListMatch = path.match(/^\/api\/tournaments\/(\d+)\/teams$/);
  if (teamsListMatch && method === 'GET') {
    return { success: true, data: MOCK.teams[+teamsListMatch[1]] || [] };
  }
  if (teamsListMatch && method === 'POST') {
    const tid = +teamsListMatch[1];
    const id = ++MOCK.nextId;
    const team = { id, name: body.name, logoUrl: body.logoUrl };
    MOCK.teams[tid] = MOCK.teams[tid] || [];
    MOCK.teams[tid].push(team);
    return { success: true, data: team };
  }
  const teamMatch = path.match(/^\/api\/teams\/(\d+)$/);
  if (teamMatch && method === 'PUT') {
    const id = +teamMatch[1];
    for (const tid in MOCK.teams) {
      const t = MOCK.teams[tid].find(x => x.id === id);
      if (t) { Object.assign(t, body); return { success: true, data: t }; }
    }
    return { success: false };
  }
  if (teamMatch && method === 'DELETE') {
    const id = +teamMatch[1];
    for (const tid in MOCK.teams) {
      MOCK.teams[tid] = MOCK.teams[tid].filter(x => x.id !== id);
    }
    return { success: true };
  }

  // MATCHES
  const matchListMatch = path.match(/^\/api\/tournaments\/(\d+)\/matches$/);
  if (matchListMatch && method === 'GET') {
    return { success: true, data: MOCK.matches[+matchListMatch[1]] || [] };
  }
  if (matchListMatch && method === 'DELETE') {
    MOCK.matches[+matchListMatch[1]] = [];
    return { success: true };
  }
  if (path.match(/\/matches\/random$/) && method === 'POST') {
    const tid = +path.match(/tournaments\/(\d+)/)[1];
    const teams = MOCK.teams[tid] || [];
    const newMatches = [];
    let round = 1;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          matchId: ++MOCK.nextId, homeTeamId: teams[i].id, awayTeamId: teams[j].id,
          round: Math.ceil(newMatches.length / Math.floor(teams.length / 2) + 1) || 1,
          homeScore: null, awayScore: null, status: 'Scheduled',
        });
      }
    }
    MOCK.matches[tid] = newMatches;
    return { success: true, data: newMatches };
  }
  const scoreMatch = path.match(/^\/api\/matches\/(\d+)\/score$/);
  if (scoreMatch && method === 'PUT') {
    const id = +scoreMatch[1];
    for (const tid in MOCK.matches) {
      const m = MOCK.matches[tid].find(x => x.matchId === id);
      if (m) {
        m.homeScore = body.homeScore; m.awayScore = body.awayScore; m.status = 'Completed';
        return { success: true, data: m };
      }
    }
  }
  const matchDelMatch = path.match(/^\/api\/matches\/(\d+)$/);
  if (matchDelMatch && method === 'DELETE') {
    const id = +matchDelMatch[1];
    for (const tid in MOCK.matches) {
      MOCK.matches[tid] = MOCK.matches[tid].filter(x => x.matchId !== id);
    }
    return { success: true };
  }

  // STANDINGS
  const standingMatch = path.match(/^\/api\/tournaments\/(\d+)\/standings$/);
  if (standingMatch) {
    return { success: true, data: computeStandings(+standingMatch[1]) };
  }

  return { success: true, data: [] };
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

export default { authApi, tournamentApi, teamApi, matchApi, standingApi };