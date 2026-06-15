import React from 'react';
import Link from 'next/link';
import { FileCheck, AlertCircle, IndianRupee } from 'lucide-react';

interface MetricProps {
  value: number;
  isLoading: boolean;
  error?: string;
  href?: string;
  onClick?: () => void;
}

interface SummaryCardsProps {
  completedFilings: MetricProps;
  intimationsPending: MetricProps;
  totalOutstanding: MetricProps;
}

function SummaryCard({
  title,
  metric,
  subtext,
  icon: Icon,
  isCurrency = false,
}: {
  title: string;
  metric: MetricProps;
  subtext: string;
  icon: React.ElementType;
  isCurrency?: boolean;
}) {
  const formatValue = (val: number) => {
    if (val === 0) return isCurrency ? '₹0' : '0';
    return isCurrency ? `₹${val.toLocaleString('en-IN')}` : val.toString();
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-8 bg-gradient-to-br from-[#1e3a8a] to-[#172554] rounded-[32px] border border-blue-700/40 hover:bg-[#1e3a8a]/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 group shadow-md hover:shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div className="bg-blue-400/10 p-3.5 rounded-[18px]">
          <Icon className="w-6 h-6 text-blue-300" />
        </div>
      </div>
      <div>
        <h3 className="text-blue-200 text-[14px] font-semibold mb-1.5 tracking-wide">{title}</h3>
        {metric.isLoading ? (
          <div className="text-3xl font-extrabold text-white animate-pulse">--</div>
        ) : metric.error ? (
          <div className="text-[15px] font-bold text-red-300">Error</div>
        ) : (
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {formatValue(metric.value)}
          </div>
        )}
        <div className="mt-3 text-[13px] font-medium text-blue-300/80">{subtext}</div>
      </div>
    </div>
  );

  if (metric.href) {
    return (
      <Link href={metric.href} className="flex-1 block focus:outline-none">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={metric.onClick} className="flex-1 block w-full text-left focus:outline-none">
      {content}
    </button>
  );
}

export function SummaryCards({
  completedFilings,
  intimationsPending,
  totalOutstanding,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <SummaryCard
        title="Filed This AY"
        metric={completedFilings}
        subtext="Returns submitted"
        icon={FileCheck}
      />
      <SummaryCard
        title="Intimations Pending"
        metric={intimationsPending}
        subtext="Requires attention"
        icon={AlertCircle}
      />
      <SummaryCard
        title="Revenue / Collections"
        metric={totalOutstanding}
        subtext="Total outstanding"
        icon={IndianRupee}
        isCurrency={true}
      />
    </div>
  );
}
