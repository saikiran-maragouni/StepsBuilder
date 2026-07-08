import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount — if invalid, clear session
  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.removeItem('sb_token'); localStorage.removeItem('sb_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sb_token', data.token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('sb_token', data.token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    setUser(null);
  };

  const demoLogin = async () => {
    const { data } = await api.post('/auth/demo');
    localStorage.setItem('sb_token', data.token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('sb_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
