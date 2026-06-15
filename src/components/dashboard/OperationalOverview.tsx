import React from 'react';
import Link from 'next/link';

interface MetricProps {
  value: number;
  isLoading: boolean;
  error?: string;
  href?: string;
  onClick?: () => void;
}

interface OperationalOverviewProps {
  completedFilings: MetricProps;
  yetToFileFilings: MetricProps;
  pendingFilings: MetricProps;
}

function MetricItem({ title, metric }: { title: string; metric: MetricProps }) {
  const content = (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-blue-200 tracking-wide">{title}</span>
      {metric.isLoading ? (
        <span className="text-3xl font-extrabold text-white animate-pulse">--</span>
      ) : metric.error ? (
        <span className="text-[15px] font-bold text-red-300">Error</span>
      ) : (
        <span className="text-3xl font-extrabold text-white tracking-tight">{metric.value === 0 ? '0' : metric.value}</span>
      )}
    </div>
  );

  const className = "flex-1 p-5 md:p-6 rounded-[20px] hover:bg-white/10 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-400";

  if (metric.href) {
    return (
      <Link href={metric.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={metric.onClick} className={className}>
      {content}
    </button>
  );
}

export function OperationalOverview({
  completedFilings,
  yetToFileFilings,
  pendingFilings,
}: OperationalOverviewProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-700 to-blue-950 rounded-[32px] shadow-md overflow-hidden border border-blue-600/20">
      <div className="p-8 md:p-10 flex-1 flex flex-col">
        <h2 className="text-[22px] font-extrabold text-white tracking-tight mb-8">Operational Overview</h2>
        
        <div className="mt-auto">
          <h3 className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-4">Next 30 Days</h3>
          <div className="bg-blue-900/30 rounded-[20px] p-6 border border-blue-400/10 flex items-center justify-center shadow-inner">
            <span className="text-blue-200 text-[14px] font-medium">No items due in the next 30 days.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row bg-slate-950/40 border-t border-white/10 p-3 sm:p-4 gap-2">
        <MetricItem title="Completed Filings" metric={completedFilings} />
        <div className="hidden sm:block w-px bg-white/10 my-4 mx-1" />
        <MetricItem title="Yet To File" metric={yetToFileFilings} />
        <div className="hidden sm:block w-px bg-white/10 my-4 mx-1" />
        <MetricItem title="Pending Filings" metric={pendingFilings} />
      </div>
    </div>
  );
}
