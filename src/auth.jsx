import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('afpsat_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('afpsat_token')));

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!localStorage.getItem('afpsat_token')) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/me');
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem('afpsat_user', JSON.stringify(data.user));
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      async login(email, password) {
        const { data } = await api.post('/login', { email, password });
        localStorage.setItem('afpsat_token', data.token);
        localStorage.setItem('afpsat_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const { data } = await api.post('/register', payload);
        localStorage.setItem('afpsat_token', data.token);
        localStorage.setItem('afpsat_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      },
      logout() {
        localStorage.removeItem('afpsat_token');
        localStorage.removeItem('afpsat_user');
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
