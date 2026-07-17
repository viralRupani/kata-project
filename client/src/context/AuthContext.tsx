import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi } from '../lib/endpoints.js';
import { refreshAccessToken, setAccessToken } from '../lib/api.js';
import type { User } from '../lib/types.js';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore the session: exchange the httpOnly refresh cookie for
  // a fresh access token, then load the current user. Access tokens live only in
  // memory, so this is what keeps the user logged in across a page reload.
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await refreshAccessToken();
      if (token) {
        try {
          const me = await authApi.me();
          if (active) setUser(me);
        } catch {
          if (active) setUser(null);
        }
      }
      if (active) setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await authApi.login({ email, password });
    setUser(loggedIn);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password });
    // Auto-login after successful registration for a smoother flow.
    const { user: loggedIn } = await authApi.login({ email, password });
    setUser(loggedIn);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
