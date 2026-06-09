'use client';

import { useRouter } from 'next/navigation';

interface AYSelectProps {
  currentAY: string;
  ayOptions: string[];
}

export default function AYSelect({ currentAY, ayOptions }: AYSelectProps) {
  const router = useRouter();

  return (
    <select
      id="ay-select"
      value={currentAY}
      onChange={(e) => {
        router.push(`/?ay=${e.target.value}`);
      }}
      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 cursor-pointer appearance-none pr-8 min-w-[120px]"
    >
      {ayOptions.map((ay) => (
        <option key={ay} value={ay}>
          {ay}
        </option>
      ))}
    </select>
  );
}
