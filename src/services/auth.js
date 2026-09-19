import api from './api';

const TOKEN_KEY = 'petertecnet_token';
const USER_KEY = 'petertecnet_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function persistTokenResponse(data) {
  const tokenPayload = data?.token || data;
  const accessToken = tokenPayload?.access_token;
  const user = tokenPayload?.user || null;

  if (!accessToken) {
    throw new Error('A API não retornou um token de acesso válido.');
  }

  localStorage.setItem(TOKEN_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { accessToken, user };
}

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return persistTokenResponse(data);
}

export async function loginWithGoogle(credential) {
  if (!credential) {
    throw new Error('O Google não retornou uma credencial válida.');
  }

  const { data } = await api.post('/auth/google', { token_id: credential });
  return persistTokenResponse(data);
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me');
  const user = data?.user || null;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
