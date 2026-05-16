import { getBaseURL } from '@/api/auth';
import {
  ensureValidAccessToken,
  handleUnauthorized,
  tryRefreshAccessToken,
} from '@/api/request';
import { ApiError } from '@/api/types';
import { parseFastAPIErrorMessage } from '@/api/utils';
import { getAccessToken } from '@/store/useAuthStore';

export interface AgentStreamBody {
  message: string;
}

export interface AgentStreamOptions {
  message: string;
  signal?: AbortSignal;
  onChunk: (data: string) => void;
}

async function fetchStreamResponse(
  message: string,
  signal?: AbortSignal,
): Promise<Response> {
  const base = getBaseURL();
  const url = new URL('/api/agent/chat/stream', base || window.location.origin);
  const token = getAccessToken();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message } satisfies AgentStreamBody),
    signal,
  });
}

function handleSSELine(line: string, onChunk: (data: string) => void): 'done' | void {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return;

  const payload = trimmed.slice(5).trim();
  if (payload === '[DONE]') return 'done';

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    onChunk(payload);
    return;
  }

  if (parsed.event === 'error') {
    const detail =
      typeof parsed.detail === 'string' ? parsed.detail : '生成失败';
    throw new ApiError(detail);
  }

  onChunk(payload);
}

export async function streamAgentChat({
  message,
  signal,
  onChunk,
}: AgentStreamOptions): Promise<void> {
  await ensureValidAccessToken();

  let response = await fetchStreamResponse(message, signal);

  if (response.status === 401) {
    const refreshed = await tryRefreshAccessToken();
    if (!refreshed) {
      handleUnauthorized();
      throw new ApiError('未授权，请重新登录', 401);
    }
    response = await fetchStreamResponse(message, signal);
  }

  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
    const msg = parseFastAPIErrorMessage(
      data,
      `请求失败 (${response.status})`,
    );
    throw new ApiError(msg, response.status, undefined, data);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError('无法读取流式响应');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (handleSSELine(line, onChunk) === 'done') return;
      }
    }

    if (buffer.trim() && handleSSELine(buffer, onChunk) === 'done') {
      return;
    }
  } finally {
    reader.releaseLock();
  }
}
