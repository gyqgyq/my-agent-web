export const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function getBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
}
