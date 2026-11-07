import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../lib/api';
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isLoggedIn,
} from '../lib/auth';

type User = { id: string; email: string; name?: string | null; role: string };
type Profile = any;

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();
    if (token && storedUser) {
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: any = await api.post('/auth/login', { email, password });
    setToken(res.accessToken);
    setUserState(res.user);
    setUser(res.user);
    await fetchProfile();
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    const res: any = await api.post('/auth/register', data);
    setToken(res.accessToken);
    setUserState(res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setUserState(null);
    setProfile(null);
    window.location.href = '/';
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res: any = await api.get('/auth/me');
      setUserState(res.user);
      setProfile(res.profile ?? null);
      setUser(res.user);
    } catch {
      // profile fetch failed; user may not have completed onboarding
    }
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    const res: any = await api.put('/profile', data);
    setProfile(res.profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token: getToken(),
        isAuthenticated: !!getToken(),
        isLoading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
