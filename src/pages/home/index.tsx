import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Home</h1>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/about">About</Link>
        </Button>
        <Button asChild>
          <Link to="/chat">Agent 对话</Link>
        </Button>
      </div>
    </div>
  );
}
