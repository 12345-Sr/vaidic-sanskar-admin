import axios from 'axios';

// Dynamically use current origin on Render / production, or localhost:4000 if running on Vite dev server (port 5173)
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location && window.location.origin
    ? (window.location.port === '5173' ? 'http://localhost:4000/api/admin/' : `${window.location.origin}/api/admin/`)
    : '/api/admin/');

export const USE_MOCK_FALLBACK = (import.meta.env.VITE_USE_MOCK_FALLBACK ?? 'false') === 'true';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// --- auth token (kept in localStorage, attached to every request) ---
const TOKEN_KEY = 'vs_admin_token';
export function getToken() {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = 'admin-token';
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch {
    return 'admin-token';
  }
}

export function setToken(t) {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.setItem(TOKEN_KEY, 'admin-token');
  } catch {}
}

client.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // Prevent screen flashout on network / proxy glitches
    return Promise.reject({
      status: err?.response?.status,
      message: err?.response?.data?.message || err.message || 'Request failed',
    });
  }
);

export default client;
