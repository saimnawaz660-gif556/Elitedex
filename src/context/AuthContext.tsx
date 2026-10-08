import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, BinaryTrade } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  activeTrades: BinaryTrade[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string; referralCode?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleDemoMode: (val?: boolean) => Promise<void>;
  resetDemoBalance: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserBalance: (real: number, demo: number, locked: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('elitedex_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTrades, setActiveTrades] = useState<BinaryTrade[]>([]);

  const fetchMe = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('elitedex_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // offline or error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveTrades = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/trades?status=active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTrades(data.trades || []);
      }
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      // By default for instant preview testing, auto-sign in with demo trader if no token exists
      const testToken = 'token_default_trader_session';
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${testToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            localStorage.setItem('elitedex_token', testToken);
            setToken(testToken);
            setUser(data.user);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [fetchMe, token]);

  useEffect(() => {
    if (!token) {
      setActiveTrades([]);
      return;
    }
    fetchActiveTrades();
    const interval = setInterval(fetchActiveTrades, 1000);
    return () => clearInterval(interval);
  }, [token, fetchActiveTrades]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      localStorage.setItem('elitedex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    referralCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      localStorage.setItem('elitedex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('elitedex_token');
    setToken(null);
    setUser(null);
    setActiveTrades([]);
  };

  const toggleDemoMode = async (val?: boolean) => {
    if (!user || !token) return;
    const nextMode = val !== undefined ? val : !user.isDemoMode;
    try {
      const res = await fetch('/api/wallet/toggle-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDemoMode: nextMode }),
      });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, isDemoMode: nextMode } : null));
      }
    } catch {
      // ignore
    }
  };

  const resetDemoBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/wallet/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => (prev ? { ...prev, demoBalance: data.demoBalance } : null));
      }
    } catch {
      // ignore
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchMe(token);
    }
  };

  const updateUserBalance = (real: number, demo: number, locked: number) => {
    setUser((prev) => (prev ? { ...prev, realBalance: real, demoBalance: demo, lockedBalance: locked } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isDemoMode: user ? user.isDemoMode : true,
        activeTrades,
        login,
        register,
        logout,
        toggleDemoMode,
        resetDemoBalance,
        refreshUser,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
