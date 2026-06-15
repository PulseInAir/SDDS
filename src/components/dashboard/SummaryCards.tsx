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
    <div className="flex flex-col justify-between h-full p-6 bg-gradient-to-br from-blue-900 to-blue-800 rounded-[24px] border border-blue-700/50 hover:bg-blue-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-blue-400/20 p-3 rounded-2xl">
          <Icon className="w-5 h-5 text-blue-200" />
        </div>
      </div>
      <div>
        <h3 className="text-blue-100 text-sm font-medium mb-1">{title}</h3>
        {metric.isLoading ? (
          <div className="text-3xl font-bold text-white animate-pulse">--</div>
        ) : metric.error ? (
          <div className="text-sm font-bold text-red-300">Error</div>
        ) : (
          <div className="text-3xl font-bold text-white tracking-tight">
            {formatValue(metric.value)}
          </div>
        )}
        <div className="mt-2 text-sm text-blue-300">{subtext}</div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
