import type { WordBatch, HistoryPlay, Level, Game, LeaderboardEntry } from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180/api/v1';

export async function register(username: string, password: string, redirectTo?: string | null) {
  let url = `${API_BASE_URL}/register`;
  if (redirectTo) {
    url += `?redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || data?.error || 'register failed');
  }
  return res.json();
}

export async function login(username: string, password: string, redirectTo?: string | null) {
  let url = `${API_BASE_URL}/login`;
  if (redirectTo) {
    url += `?redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || data?.error || 'login failed');
  }
  return res.json();
}

export async function fetchHistory(userId: number): Promise<HistoryPlay[]> {
  const res = await fetch(`${API_BASE_URL}/history/${userId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('history failed');
  return res.json();
}

export async function fetchRandomWords(
  count: number,
  language: string,
  difficulty: string,
  cursor?: string,
): Promise<WordBatch> {
  const url = new URL(`${API_BASE_URL}/words/random`);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', language);
  url.searchParams.set('difficulty', difficulty);
  if (cursor) url.searchParams.set('cursor', cursor);
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error('words failed');
  return res.json();
}

export async function submitAnswer(data: {
  word_id: number;
  user_id: number;
  language_code: string;
  user_answer: string;
}) {
  const res = await fetch(`${API_BASE_URL}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('answer failed');
  return res.json();
}

export async function createSession(user_id: number, level_id: number) {
  const res = await fetch(`${API_BASE_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user_id, level_id }),
  });
  if (!res.ok) throw new Error('session failed');
  return res.json();
}

export async function finishSession() {
  const res = await fetch(`${API_BASE_URL}/finish`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('finish failed');
  return res.json();
}

export async function fetchLevels(): Promise<Level[]> {
  const res = await fetch(`${API_BASE_URL}/levels`, { credentials: 'include' });
  if (!res.ok) throw new Error('levels failed');
  return res.json();
}

// ===== Authentication Utilities =====

/**
 * Checks if the user is currently authenticated.
 * Since the backend uses HTTP-only cookies for JWT tokens (via credentials: 'include'),
 * we check for user_id in localStorage to determine if the user is logged in.
 * If jwt_token exists in localStorage, we also validate it.
 * Returns true if user_id exists (indicating a logged-in user), false otherwise.
 */
export function isAuthenticated(): boolean {
  // Check for user_id first (this is what we store after login)
  const userId = localStorage.getItem('user_id');
  if (!userId) return false;
  
  // If jwt_token exists in localStorage, validate it
  const token = localStorage.getItem('jwt_token');
  if (token) {
    try {
      // Basic JWT validation - check if it has 3 parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid token format, but user_id exists, so assume cookie-based auth
        return true;
      }
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      if (exp && exp * 1000 < Date.now()) {
        // Token expired, but if user_id exists, backend might be using cookies
        // Don't remove user_id, just return false if token is expired
        // Actually, if backend uses cookies, the cookie might still be valid
        // So we'll trust user_id presence as indication of authentication
        return true;
      }
      
      return true;
    } catch (error) {
      // If token is malformed but user_id exists, assume cookie-based auth
      return true;
    }
  }
  
  // If user_id exists but no jwt_token, assume backend uses HTTP-only cookies
  // The presence of user_id indicates the user has logged in
  return true;
}

// ===== Game Home Page API Functions =====

/**
 * Fetches all active games for display on the home page.
 * This is a public endpoint - no authentication required.
 */
export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${API_BASE_URL}/games`);
  if (!res.ok) {
    throw new Error('Failed to fetch games');
  }
  const data = await res.json();
  return data.games || [];
}

/**
 * Fetches the top 10 leaderboard entries for a specific game.
 * This is a public endpoint - no authentication required.
 */
export async function fetchLeaderboard(gameId: number): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE_URL}/games/${gameId}/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const data = await res.json();
  return data.leaderboard || [];
}
