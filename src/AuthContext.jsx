import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('santana_token'));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .me()
      .then(setAdmin)
      .catch(() => {
        localStorage.removeItem('santana_token');
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      admin,
      loading,
      isAuthenticated: Boolean(token && admin),
      async login(email, password) {
        const data = await api.login(email, password);
        localStorage.setItem('santana_token', data.access_token);
        setToken(data.access_token);
      },
      logout() {
        localStorage.removeItem('santana_token');
        setToken(null);
        setAdmin(null);
      },
    }),
    [token, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
