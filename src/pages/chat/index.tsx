import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useLogoutMutation } from '@/hooks/useAccount';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const { chunks, isStreaming, error, send, cancel } = useAgentStream();
  const logoutMutation = useLogoutMutation();

  const handleSend = () => {
    const text = message.trim();
    if (!text || isStreaming) return;
    void send(text);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agent 对话</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/">首页</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            退出
          </Button>
        </div>
      </header>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息…"
        rows={3}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <Button onClick={handleSend} disabled={isStreaming || !message.trim()}>
          {isStreaming ? '生成中…' : '发送'}
        </Button>
        {isStreaming && (
          <Button variant="outline" onClick={cancel}>
            取消
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">流式片段</h2>
        <ul className="max-h-96 space-y-2 overflow-y-auto rounded-md border border-border p-3 text-xs">
          {chunks.length === 0 && (
            <li className="text-muted-foreground">暂无数据</li>
          )}
          {chunks.map((chunk, i) => (
            <li key={i} className="break-all font-mono">
              {chunk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
