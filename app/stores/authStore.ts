import { create } from 'zustand';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => Promise<void>;
  clearAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: async (user) => {
    if (user) await setStorageItem('user', user);
    else await removeStorageItem('user');
    set({ user, isAuthenticated: Boolean(user), isLoading: false });
  },
  clearAuth: async () => {
    await Promise.all([removeStorageItem('auth_token'), removeStorageItem('user')]);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  checkAuth: async () => {
    set({ isLoading: true });
    const [token, storedUser] = await Promise.all([
      getStorageItem('auth_token'),
      getStorageItem('user'),
    ]);
    set({
      user: token && storedUser ? storedUser : null,
      isAuthenticated: Boolean(token && storedUser),
      isLoading: false,
    });
  },
}));
