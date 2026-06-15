import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, IndianRupee, RefreshCw } from 'lucide-react';

interface MetricProps {
  value: number;
  isLoading: boolean;
  error?: string;
  href?: string;
  onClick?: () => void;
}

interface StackedStatCardsProps {
  refundsPending: MetricProps;
  totalOutstanding: MetricProps;
  totalBilled: MetricProps;
}

function StatCard({
  title,
  metric,
  subtext,
  icon: Icon,
  className,
  isCurrency = false,
}: {
  title: string;
  metric: MetricProps;
  subtext?: React.ReactNode;
  icon: React.ElementType;
  className: string;
  isCurrency?: boolean;
}) {
  const formatValue = (val: number) => {
    if (val === 0) return isCurrency ? '₹0' : '0';
    return isCurrency ? `₹${val.toLocaleString('en-IN')}` : val.toString();
  };

  const content = (
    <div className={`relative flex flex-col justify-between h-full p-8 md:p-10 rounded-[32px] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md ${className}`}>
      <div className="flex justify-between items-start z-10">
        <div className="bg-white/20 p-3.5 rounded-[18px]">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="bg-white/20 p-3 rounded-full transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shadow-sm">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="mt-10 z-10">
        <h3 className="text-white/90 text-[15px] font-semibold mb-2">{title}</h3>
        {metric.isLoading ? (
          <div className="text-4xl font-extrabold text-white animate-pulse">--</div>
        ) : metric.error ? (
          <div className="text-sm font-bold text-red-200">Error</div>
        ) : (
          <div className="text-5xl font-extrabold text-white tracking-tight">
            {formatValue(metric.value)}
          </div>
        )}
        {subtext && <div className="mt-3">{subtext}</div>}
      </div>
    </div>
  );

  if (metric.href) {
    return (
      <Link href={metric.href} className="flex-1 flex flex-col">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={metric.onClick} className="flex-1 flex flex-col text-left w-full focus:outline-none">
      {content}
    </button>
  );
}

export function StackedStatCards({
  refundsPending,
  totalOutstanding,
  totalBilled,
}: StackedStatCardsProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <StatCard
        title="Refunds Pending"
        metric={refundsPending}
        icon={RefreshCw}
        className="bg-blue-600 hover:bg-blue-500 transition-colors border border-blue-400/20"
      />
      <StatCard
        title="Outstanding Amount"
        metric={totalOutstanding}
        icon={IndianRupee}
        isCurrency={true}
        subtext={
          <div className="flex items-center gap-1.5 text-sm text-white/90 font-medium">
            <span>Billed:</span>
            {totalBilled.isLoading ? (
              <span className="animate-pulse">--</span>
            ) : totalBilled.error ? (
              <span className="text-red-200">Error</span>
            ) : (
              <span className="font-bold text-white tracking-wide">
                {totalBilled.value === 0 ? '₹0' : `₹${totalBilled.value.toLocaleString('en-IN')}`}
              </span>
            )}
          </div>
        }
        className="bg-gradient-to-br from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 transition-colors border border-pink-400/20"
      />
    </div>
  );
}
