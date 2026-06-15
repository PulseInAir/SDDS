'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface AYSelectProps {
  currentAY: string;
  ayOptions: string[];
}

export default function AYSelect({ currentAY, ayOptions }: AYSelectProps) {
  const router = useRouter();

  return (
    <div className="relative inline-flex items-center">
      <select
        id="ay-select"
        value={currentAY}
        onChange={(e) => {
          router.push(`/?ay=${e.target.value}`);
        }}
        className="appearance-none bg-white border border-slate-200 rounded-full pl-4 pr-10 h-11 text-[13px] font-bold text-slate-700 cursor-pointer outline-none min-w-[120px] shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-50 hover:border-slate-300"
      >
        {ayOptions.map((ay) => (
          <option key={ay} value={ay}>
            {ay}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
    </div>
  );
}
