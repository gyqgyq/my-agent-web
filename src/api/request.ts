import { getBaseURL } from '@/api/auth';
import { ApiError, type TokenOut } from '@/api/types';
import { parseFastAPIErrorMessage } from '@/api/utils';
import {
  getAccessToken,
  getRefreshToken,
  useAuthStore,
} from '@/store/useAuthStore';

const DEFAULT_TIMEOUT = 30_000;

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  skipAuth?: boolean;
  _isRetry?: boolean;
};

let onUnauthorized: (() => void) | undefined;
let refreshPromise: Promise<boolean> | null = null;

export function setOnUnauthorized(handler: () => void): void {
  onUnauthorized = handler;
}

function buildURL(
  path: string,
  params?: RequestOptions['params'],
): string {
  const base = getBaseURL();
  const url = new URL(path.startsWith('/') ? path : `/${path}`, base || window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function isFormDataBody(body: RequestInit['body']): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch {
    return undefined;
  }
}

export function handleUnauthorized(): void {
  useAuthStore.getState().clearAuth();
  onUnauthorized?.();
}

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const url = buildURL('/api/account/refresh');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as TokenOut;
    useAuthStore.getState().setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function ensureValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token) return token;

  const refreshed = await tryRefreshAccessToken();
  if (refreshed) return getAccessToken();
  return null;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    params,
    timeout = DEFAULT_TIMEOUT,
    skipAuth = false,
    _isRetry = false,
    headers: initHeaders,
    body,
    ...rest
  } = options;

  const url = buildURL(path, params);
  const headers = new Headers(initHeaders);

  if (!isFormDataBody(body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (import.meta.env.DEV) {
    console.debug('[api]', rest.method ?? 'GET', path);
  }

  try {
    const response = await fetch(url, {
      ...rest,
      body,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && !skipAuth) {
      if (_isRetry) {
        handleUnauthorized();
        throw new ApiError('未授权，请重新登录', 401);
      }

      const refreshed = await tryRefreshAccessToken();
      if (refreshed) {
        return request<T>(path, { ...options, _isRetry: true });
      }

      handleUnauthorized();
      const data = await readErrorBody(response);
      const message = parseFastAPIErrorMessage(data, '未授权，请重新登录');
      throw new ApiError(message, 401, undefined, data);
    }

    if (!response.ok) {
      const data = await readErrorBody(response);
      const message = parseFastAPIErrorMessage(
        data,
        `请求失败 (${response.status})`,
      );
      throw new ApiError(message, response.status, undefined, data);
    }

    return parseResponseBody<T>(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('请求超时', undefined, undefined, err);
    }
    throw new ApiError(
      err instanceof Error ? err.message : '网络异常，请稍后重试',
      undefined,
      undefined,
      err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
