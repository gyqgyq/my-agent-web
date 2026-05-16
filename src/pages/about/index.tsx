import { useCountStore } from '@/store/useCountStore';
import { Button } from '@/components/ui/button';

export default function About() {
  const { count, increment, decrement } = useCountStore();

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-red-500">About</h1>
      <p className="text-4xl font-semibold tabular-nums">{count}</p>
      <div className="flex gap-3">
        <Button
          onClick={decrement}
        >
          -1
        </Button>
        <Button
          onClick={increment}
        >
          +1
        </Button>
      </div>
    </div>
  );
}
