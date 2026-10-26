import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/services';
import { setToken, getToken, USE_MOCK_FALLBACK } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vs_admin_user') || 'null') || { name: 'Super Admin', email: 'admin@vaidicsanskar.com', role: 'Owner' };
    } catch {
      return { name: 'Super Admin', email: 'admin@vaidicsanskar.com', role: 'Owner' };
    }
  });
  const [authed, setAuthed] = useState(true);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      const u = res.user || { name: 'Super Admin', email, role: 'Owner' };
      setUser(u); setAuthed(true);
      try { localStorage.setItem('vs_admin_user', JSON.stringify(u)); } catch {}
      return { ok: true };
    } catch (e) {
      // Dev convenience: with mock fallback on, allow demo login without a backend.
      if (USE_MOCK_FALLBACK) {
        setToken('demo-token');
        const u = { name: 'Super Admin', email, role: 'Owner' };
        setUser(u); setAuthed(true);
        try { localStorage.setItem('vs_admin_user', JSON.stringify(u)); } catch {}
        return { ok: true, demo: true };
      }
      return { ok: false, message: e.message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null); setAuthed(false); setUser(null);
    try { localStorage.removeItem('vs_admin_user'); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
