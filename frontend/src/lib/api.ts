import type { WordBatch, HistoryPlay, Level } from '@/types';

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
