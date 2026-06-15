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
    <div className={`relative flex flex-col justify-between h-full p-6 rounded-[24px] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm ${className}`}>
      <div className="flex justify-between items-start z-10">
        <div className="bg-white/20 p-3 rounded-2xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="bg-white/20 p-2.5 rounded-full transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="mt-8 z-10">
        <h3 className="text-white/80 text-sm font-medium mb-1.5">{title}</h3>
        {metric.isLoading ? (
          <div className="text-3xl font-bold text-white animate-pulse">--</div>
        ) : metric.error ? (
          <div className="text-sm font-bold text-red-200">Error</div>
        ) : (
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatValue(metric.value)}
          </div>
        )}
        {subtext && <div className="mt-2">{subtext}</div>}
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
        className="bg-blue-500 hover:bg-blue-400 transition-colors border border-blue-400/30"
      />
      <StatCard
        title="Outstanding Amount"
        metric={totalOutstanding}
        icon={IndianRupee}
        isCurrency={true}
        subtext={
          <div className="flex items-center gap-1.5 text-sm text-white/80">
            <span>Billed:</span>
            {totalBilled.isLoading ? (
              <span className="animate-pulse">--</span>
            ) : totalBilled.error ? (
              <span className="text-red-200">Error</span>
            ) : (
              <span className="font-semibold text-white">
                {totalBilled.value === 0 ? '₹0' : `₹${totalBilled.value.toLocaleString('en-IN')}`}
              </span>
            )}
          </div>
        }
        className="bg-gradient-to-br from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 transition-colors border border-rose-400/30"
      />
    </div>
  );
}
