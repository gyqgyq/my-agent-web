import { ApiError, type FastAPIErrorBody, type FastAPIValidationError } from '@/api/types';

function formatValidationDetail(detail: FastAPIValidationError[]): string {
  return detail.map((e) => e.msg).join('；');
}

export function parseFastAPIErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const body = data as FastAPIErrorBody;
  const { detail } = body;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return formatValidationDetail(detail);
  }
  return fallback;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message || '请求失败';
  if (err instanceof Error) return err.message;
  return '网络异常，请稍后重试';
}
