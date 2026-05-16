import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useLogoutMutation } from '@/hooks/useAccount';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const { reply, isStreaming, error, send, cancel } = useAgentStream();
  const logoutMutation = useLogoutMutation();

  const handleSend = () => {
    const text = message.trim();
    if (!text || isStreaming) return;
    void send(text);
  };

  const showReply = reply.length > 0 || isStreaming;

  return (
    <div className="mx-auto flex max-h-svh max-w-2xl flex-col gap-4 p-6">
      <header className="flex shrink-0 items-center justify-between">
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
        disabled={isStreaming}
        className="shrink-0 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
      />

      <div className="flex shrink-0 gap-2">
        <Button onClick={handleSend} disabled={isStreaming || !message.trim()}>
          {isStreaming ? '生成中…' : '发送'}
        </Button>
        {isStreaming && (
          <Button variant="outline" onClick={cancel}>
            取消
          </Button>
        )}
      </div>

      {error && <p className="shrink-0 text-sm text-destructive">{error}</p>}

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="shrink-0 text-sm font-medium text-muted-foreground">
          助手回复
        </h2>
        <div
          className={cn(
            'min-h-48 flex-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-4',
            !showReply && 'flex items-center justify-center',
          )}
        >
          {!showReply && (
            <p className="text-sm text-muted-foreground">发送消息后在此显示</p>
          )}
          {showReply && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {reply}
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block w-2 animate-pulse bg-foreground align-middle"
                  aria-hidden
                />
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
