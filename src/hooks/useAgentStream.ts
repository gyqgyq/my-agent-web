import { useCallback, useRef, useState } from 'react';
import { streamAgentChat } from '@/api/modules/agent';
import { getErrorMessage } from '@/api/utils';
import { extractAgentTextDelta } from '@/lib/parseAgentStream';

export function useAgentStream() {
  const [reply, setReply] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (message: string, workId: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setReply('');
    setError(null);
    setIsStreaming(true);

    try {
      await streamAgentChat({
        message,
        workId,
        signal: controller.signal,
        onChunk: (data) => {
          const delta = extractAgentTextDelta(data);
          if (delta) {
            setReply((prev) => prev + delta);
          }
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(getErrorMessage(err));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { reply, isStreaming, error, send, cancel };
}
