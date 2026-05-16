import { useCallback, useRef, useState } from 'react';
import { streamAgentChat } from '@/api/modules/agent';
import { getErrorMessage } from '@/api/utils';

export function useAgentStream() {
  const [chunks, setChunks] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (message: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setChunks([]);
    setError(null);
    setIsStreaming(true);

    try {
      await streamAgentChat({
        message,
        signal: controller.signal,
        onChunk: (data) => {
          setChunks((prev) => [...prev, data]);
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

  return { chunks, isStreaming, error, send, cancel };
}
