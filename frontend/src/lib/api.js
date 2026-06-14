import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const TOKEN_KEY = 'cm_token';
const GUEST_KEY = 'cm_guest_id';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getGuestId() {
  let g = localStorage.getItem(GUEST_KEY);
  if (!g) {
    const rand = Array.from({ length: 18 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
    g = `guest_${rand}`;
    localStorage.setItem(GUEST_KEY, g);
  }
  return g;
}

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-guest-id'] = getGuestId();
  return config;
});

export function apiErr(e) {
  const d = e?.response?.data?.detail ?? e?.response?.data?.error;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(' ');
  return e?.message || 'Something went wrong';
}

// ── auth ──
export const authApi = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// ── projects / collections ──
export const projectApi = {
  list: () => api.get('/projects').then((r) => r.data.projects),
  create: (name) => api.post('/projects', { name }).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  listChats: (id) => api.get(`/projects/${id}/chats`).then((r) => r.data.chats),
  createChat: (id, title) => api.post(`/projects/${id}/chats`, { title }).then((r) => r.data),
};

// ── chats ──
export const chatApi = {
  get: (id) => api.get(`/chats/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/chats/${id}`).then((r) => r.data),
  message: (id, prompt, bloomLevel) =>
    api.post(`/chats/${id}/message`, { prompt, bloomLevel }).then((r) => r.data),
};

// ── lesson (stateless) ──
export const lessonApi = {
  generate: (prompt, bloomLevel, conversationHistory = []) =>
    api.post('/lesson', { prompt, bloomLevel, conversationHistory }).then((r) => r.data),
  cont: (checkpointResult, bloomLevel, conversationHistory = []) =>
    api.post('/lesson/continue', { checkpointResult, bloomLevel, conversationHistory }).then((r) => r.data),
  clarify: (topic, bloomLevel, conversationHistory = []) =>
    api.post('/lesson/clarify', { topic, bloomLevel, conversationHistory }).then((r) => r.data),
};

// ── audio (MOCKED transcription) ──
export const audioApi = {
  transcribe: (blob) => {
    const fd = new FormData();
    fd.append('audio', blob, 'audio.webm');
    return api.post('/audio/transcribe', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.text);
  },
};

export default api;
