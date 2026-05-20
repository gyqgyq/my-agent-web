import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useWorksQuery } from '@/hooks/useWorks';
import { useWorkStore } from '@/store/useWorkStore';
import { MarkdownContent } from '@/components/MarkdownContent';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const { reply, isStreaming, error, send, cancel } = useAgentStream();
  const { data: works, isLoading: worksLoading } = useWorksQuery();
  const activeWorkId = useWorkStore((s) => s.activeWorkId);
  const setActiveWorkId = useWorkStore((s) => s.setActiveWorkId);
  const clearActiveWork = useWorkStore((s) => s.clearActiveWork);

  useEffect(() => {
    if (!works || works.length === 0) {
      clearActiveWork();
      return;
    }
    if (
      activeWorkId !== null &&
      !works.some((w) => w.id === activeWorkId)
    ) {
      clearActiveWork();
    }
  }, [works, activeWorkId, clearActiveWork]);

  const handleSend = () => {
    const text = message.trim();
    if (!text || isStreaming || activeWorkId === null) return;
    void send(text, activeWorkId);
  };

  const showReply = reply.length > 0 || isStreaming;
  const hasWorks = (works?.length ?? 0) > 0;
  const canSend = hasWorks && activeWorkId !== null && !isStreaming;

  return (
    <div className="mx-auto flex max-h-[calc(100svh-3rem)] max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Agent 对话</h1>

      {worksLoading && (
        <p className="text-sm text-muted-foreground">加载作品列表…</p>
      )}

      {!worksLoading && !hasWorks && (
        <div className="rounded-md border border-dashed border-border p-4 text-sm">
          <p className="text-muted-foreground">暂无作品，请先创建并上传文档。</p>
          <Button className="mt-3" size="sm" asChild>
            <Link to="/works">前往作品管理</Link>
          </Button>
        </div>
      )}

      {hasWorks && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="work-select">当前作品</Label>
          <Select
            value={activeWorkId !== null ? String(activeWorkId) : undefined}
            onValueChange={(v) => setActiveWorkId(Number(v))}
          >
            <SelectTrigger id="work-select" className="w-full">
              <SelectValue placeholder="请选择作品" />
            </SelectTrigger>
            <SelectContent>
              {works?.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息…"
        rows={3}
        disabled={isStreaming || !hasWorks}
        className="shrink-0 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
      />

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={handleSend} disabled={!canSend || !message.trim()}>
            {isStreaming ? '生成中…' : '发送'}
          </Button>
          {isStreaming && (
            <Button variant="outline" onClick={cancel}>
              取消
            </Button>
          )}
        </div>
        {hasWorks && activeWorkId === null && (
          <p className="text-sm text-muted-foreground">请先选择作品</p>
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
            <div className="text-sm leading-relaxed">
              {reply.length > 0 && <MarkdownContent>{reply}</MarkdownContent>}
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle"
                  aria-hidden
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
