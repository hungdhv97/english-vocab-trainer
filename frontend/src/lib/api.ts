const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180/api/v1';

export async function register(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/register`, {
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

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/login`, {
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

export async function fetchHistory(userId: number) {
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
) {
  const res = await fetch(
    `${API_BASE_URL}/words/random?count=${count}&language=${language}&difficulty=${difficulty}`,
    { credentials: 'include' },
  );
  if (!res.ok) throw new Error('words failed');
  return res.json();
}

export async function submitAnswer(data: {
  word_id: number;
  user_id: number;
  language_code: string;
  response_time: number;
  user_answer: string;
  earned_score: number;
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

export async function createSession() {
  const res = await fetch(`${API_BASE_URL}/session`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('session failed');
  return res.json();
}
