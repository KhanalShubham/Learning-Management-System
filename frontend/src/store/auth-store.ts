import { create } from 'zustand';
import type { User } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  setInitialLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialLoading: true,
  setSession: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitialLoading: false,
    }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialLoading: false,
    }),
  setInitialLoading: (loading) => set({ isInitialLoading: loading }),
}));
export default useAuthStore;
