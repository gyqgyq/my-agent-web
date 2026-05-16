import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  login,
  logout,
  register,
  refreshTokens,
} from '@/api/modules/account';
import type { LoginIn, RegisterIn } from '@/api/types';
import { queryClient } from '@/lib/queryClient';
import { getRefreshToken, useAuthStore } from '@/store/useAuthStore';

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (body: LoginIn) => login(body),
    onSuccess: (data) => {
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (body: RegisterIn) => register(body),
  });
}

export function useLogoutMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        await logout({ refresh_token: refresh });
      }
    },
    onSettled: () => {
      clearAuth();
      void queryClient.clear();
      void navigate('/login', { replace: true });
    },
  });
}

export function useRefreshSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (!refresh) throw new Error('无刷新令牌');
      return refreshTokens({ refresh_token: refresh });
    },
    onSuccess: (data) => {
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    },
    onError: () => {
      clearAuth();
    },
  });
}
