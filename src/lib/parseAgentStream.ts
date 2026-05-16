/** LangGraph SSE：`stream_mode` 含 messages / updates 时的常见结构 */
interface StreamMessageChunk {
  content?: unknown;
  type?: string;
}

interface StreamEnvelope {
  type?: string;
  data?: unknown;
}

/**
 * 从 SSE data 行解析增量文本（仅 `type: "messages"` 的 AIMessageChunk.content）。
 * 忽略 `updates` 整段快照，避免与增量重复。
 */
export function extractAgentTextDelta(payload: string): string | null {
  let parsed: StreamEnvelope;
  try {
    parsed = JSON.parse(payload) as StreamEnvelope;
  } catch {
    return null;
  }

  if (parsed.type !== 'messages') return null;

  const data = parsed.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0] as StreamMessageChunk;
  if (typeof first.content !== 'string') return null;

  return first.content;
}
