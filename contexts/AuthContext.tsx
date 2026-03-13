'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setToken, removeToken, getToken } from '@/lib/api-client';
import type { AuthUser } from '@/lib/api-types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // 初始化：检查已有 token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false });
      return;
    }

    authApi
      .me()
      .then((res) => setState({ user: res.user, loading: false }))
      .catch(() => {
        removeToken();
        setState({ user: null, loading: false });
      });
  }, []);

  // 监听 401 自动登出事件
  useEffect(() => {
    const handleLogout = () => setState({ user: null, loading: false });
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    setToken(res.token);
    setState({ user: res.user, loading: false });
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await authApi.register({ username, password });
    setToken(res.token);
    setState({ user: res.user, loading: false });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, token: getToken(), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
