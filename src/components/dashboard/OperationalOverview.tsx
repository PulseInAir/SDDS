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
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-blue-100">{title}</span>
      {metric.isLoading ? (
        <span className="text-2xl font-bold text-white animate-pulse">--</span>
      ) : metric.error ? (
        <span className="text-sm font-bold text-red-300">Error</span>
      ) : (
        <span className="text-2xl font-bold text-white">{metric.value === 0 ? '0' : metric.value}</span>
      )}
    </div>
  );

  const className = "flex-1 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-400";

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
    <div className="flex flex-col bg-gradient-to-br from-blue-700 to-blue-900 rounded-[24px] shadow-sm overflow-hidden border border-blue-600/30">
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">Operational Overview</h2>
        
        <div className="mt-auto">
          <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3">Next 30 Days</h3>
          <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-400/10 flex items-center justify-center">
            <span className="text-blue-200 text-sm">No items due in the next 30 days.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row bg-slate-950/30 border-t border-white/10 p-2">
        <MetricItem title="Completed Filings" metric={completedFilings} />
        <div className="hidden sm:block w-px bg-white/10 my-4 mx-1" />
        <MetricItem title="Yet To File" metric={yetToFileFilings} />
        <div className="hidden sm:block w-px bg-white/10 my-4 mx-1" />
        <MetricItem title="Pending Filings" metric={pendingFilings} />
      </div>
    </div>
  );
}
