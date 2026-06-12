'use client';

import { useState } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import OverviewCard from '@/components/dashboard/OverviewCard';
import StackedStatCards from '@/components/dashboard/StackedStatCards';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentActivityPanel from '@/components/dashboard/RecentActivityPanel';
import QueueSnapshotPanel from '@/components/dashboard/QueueSnapshotPanel';

interface DashboardClientProps {
  totalClients: number;
  completedFilings: number;
  yetToFileFilings: number;
  pendingFilings: number;
  refundsPending: number;
  intimationsPending: number;
  totalOutstanding: number;
  totalBilled: number;
  queueItems: any[];
  recentLogs: any[];
  currentAY: string;
  ayOptions: string[];
}

export default function DashboardClient({
  totalClients,
  completedFilings,
  yetToFileFilings,
  pendingFilings,
  refundsPending,
  intimationsPending,
  totalOutstanding,
  totalBilled,
  queueItems,
  recentLogs,
  currentAY,
  ayOptions
}: DashboardClientProps) {
  const { isPrivacyMode } = usePrivacy();

  // Eyeball reveals states
  const [revealRevenue, setRevealRevenue] = useState(false);
  const [revealedRowIds, setRevealedRowIds] = useState<Record<string, boolean>>({});

  const maskText = (text: string, isMasked: boolean) => {
    return isMasked ? '••••••••••' : text;
  };

  const maskValue = (value: string | number, isMasked: boolean) => {
    return isMasked ? '••••' : String(value);
  };

  return (
    <div className="mt-4 xl:mt-8">
      {/* ── Main two-column layout: Left dashboard area │ Right column ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 xl:gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-6 xl:gap-8">

          {/* Top row: OverviewCard + StackedStatCards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 xl:gap-8">
            <OverviewCard
              completedFilings={completedFilings}
              yetToFileFilings={yetToFileFilings}
              pendingFilings={pendingFilings}
            />
            <StackedStatCards
              refundsPending={refundsPending}
              totalOutstanding={totalOutstanding}
              totalBilled={totalBilled}
            />
          </div>

          {/* Bottom row: Three summary cards */}
          <SummaryCards
            completedFilings={completedFilings}
            intimationsPending={intimationsPending}
            totalOutstanding={totalOutstanding}
          />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6 xl:gap-8">
          <RecentActivityPanel recentLogs={recentLogs} />
          <QueueSnapshotPanel queueItems={queueItems} />
        </div>

      </div>
    </div>
  );
}

