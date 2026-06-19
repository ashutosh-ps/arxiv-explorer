import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as defaultApi from '../services/authApi';

const AuthContext = createContext(null);

// Provides auth state and actions. `api` is injectable so the context can be tested without
// a network. On mount it hydrates the session from GET /api/auth/me (the cookie is sent
// automatically), so a logged-in user survives a reload.
export const AuthProvider = ({ children, api = defaultApi }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.me()
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api]);

  const signup = useCallback(async (email, password) => {
    const { user: created } = await api.signup(email, password);
    setUser(created);
    return created;
  }, [api]);

  const login = useCallback(async (email, password) => {
    const { user: loggedIn } = await api.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, [api]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, [api]);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
