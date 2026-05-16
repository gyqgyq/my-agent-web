import { create } from 'zustand';
import { REFRESH_TOKEN_KEY } from '@/api/auth';

interface AuthState {
  accessToken: string | null;
  setSession: (session: { accessToken: string; refreshToken?: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setSession: ({ accessToken, refreshToken }) => {
    set({ accessToken });
    if (refreshToken !== undefined) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearAuth: () => {
    set({ accessToken: null });
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
}));

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
