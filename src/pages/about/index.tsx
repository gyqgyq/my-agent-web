import { useCountStore } from '@/store/useCountStore';

export default function About() {
  const { count, increment, decrement } = useCountStore();

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-red-500">About</h1>
      <p className="text-4xl font-semibold tabular-nums">{count}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={decrement}
          className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          -1
        </button>
        <button
          type="button"
          onClick={increment}
          className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          +1
        </button>
      </div>
    </div>
  );
}
