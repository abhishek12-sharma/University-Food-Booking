import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authApi from '../services/authApi';
import { TOKEN_STORAGE_KEY, onUnauthorized } from '../utils/api';
import { connectSocket, disconnectSocket } from '../sockets/socket';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setStatus('guest');
      return;
    }
    try {
      const res = await authApi.getProfile();
      // Profile response: user object directly, or nested in data
      const profile = res.data || res;
      setUser(profile);
      setStatus('authenticated');
      connectSocket();
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const unsubscribe = onUnauthorized(() => {
      setUser(null);
      setStatus('guest');
      disconnectSocket();
    });
    return unsubscribe;
  }, [loadProfile]);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const token = res.data?.token || res.data?.accessToken || res.token;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const userData = res.data?.user || res.data || res;
    setUser(userData);
    setStatus('authenticated');
    connectSocket();
    return userData;
  }, []);

  const register = useCallback((payload) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setStatus('guest');
      disconnectSocket();
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const res = await authApi.getProfile();
    const profile = res.data || res;
    setUser(profile);
    return res;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      // Aliases used by AdminRoutes and ShopkeeperRoutes
      loading: status === 'loading',
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      isUser: user?.role === 'USER',
      isShopkeeper: user?.role === 'SHOPKEEPER',
      isAdmin: user?.role === 'ADMIN',
      // foodCourtId is included in the login/profile response for shopkeepers
      foodCourtId: user?.foodCourtId ?? user?.food_court_id ?? null,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, status, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Named export so both import paths work:
 *   import { useAuth } from '../context/AuthContext'  ← all 10 existing pages
 *   import { useAuth } from '../hooks/useAuth'        ← hook file
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
