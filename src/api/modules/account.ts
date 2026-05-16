import { request } from '@/api/request';
import type {
  LoginIn,
  LogoutIn,
  RefreshIn,
  RegisterIn,
  RegisterOut,
  TokenOut,
} from '@/api/types';

export function register(body: RegisterIn) {
  return request<RegisterOut>('/api/account/register', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export function login(body: LoginIn) {
  return request<TokenOut>('/api/account/login', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export function refreshTokens(body: RefreshIn) {
  return request<TokenOut>('/api/account/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export function logout(body: LogoutIn) {
  return request<void>('/api/account/logout', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
