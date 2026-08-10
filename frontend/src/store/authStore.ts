import { create } from 'zustand';
import { User } from '../types';

const STORAGE_USER_KEY = 'trantxt_user';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

// Load persisted user from localStorage
const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: loadStoredUser(),
  token: localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    set({ user });
  },
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(STORAGE_USER_KEY);
    set({ user: null, token: null });
  },
}));
