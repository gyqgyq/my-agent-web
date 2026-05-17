import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        管理作品与文档知识库，在对话页选择作品后与 Agent 交流。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/works">作品管理</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/chat">Agent 对话</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/about">About</Link>
        </Button>
      </div>
    </div>
  );
}
