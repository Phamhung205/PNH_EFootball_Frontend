// ============================================================
// FRONTEND - FILE THÊM MỚI
// src/services/championHonorApi.js
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5215';

function headers() {
  const token =
    localStorage.getItem('token') ||
    '';

  return {
    'Content-Type':
      'application/json',

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function request(
  path,
  options = {}
) {
  const res = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,

      headers: {
        ...headers(),
        ...(options.headers || {}),
      },
    }
  );

  const data =
    await res
      .json()
      .catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data?.message ||
        `Lỗi ${res.status}`
    );
  }

  return data?.data ?? data;
}

export const championHonorApi = {
  competitions: () =>
    request(
      '/api/ChampionHonors/competitions'
    ),

  ranking: (
    competition = 'all'
  ) =>
    request(
      `/api/ChampionHonors/ranking?competition=${encodeURIComponent(
        competition
      )}`
    ),

  list: (
    competition = 'all'
  ) =>
    request(
      `/api/ChampionHonors?competition=${encodeURIComponent(
        competition
      )}`
    ),

  create: (payload) =>
    request(
      '/api/ChampionHonors',
      {
        method: 'POST',

        body: JSON.stringify(
          payload
        ),
      }
    ),

  update: (
    id,
    payload
  ) =>
    request(
      `/api/ChampionHonors/${id}`,
      {
        method: 'PUT',

        body: JSON.stringify(
          payload
        ),
      }
    ),

  remove: (id) =>
    request(
      `/api/ChampionHonors/${id}`,
      {
        method: 'DELETE',
      }
    ),

  syncTournament: (
    tournamentId
  ) =>
    request(
      `/api/ChampionHonors/sync/${tournamentId}`,
      {
        method: 'POST',
      }
    ),
};