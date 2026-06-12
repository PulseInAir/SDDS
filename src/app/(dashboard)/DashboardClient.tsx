'use client';

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
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 xl:gap-8 w-full min-w-0">
      {/* ── Main two-column layout: Left dashboard area │ Right column ── */}


        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-6 xl:gap-8 min-w-0">

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
        <div className="flex flex-col gap-6 xl:gap-8 min-w-0">
          <RecentActivityPanel recentLogs={recentLogs} />
          <QueueSnapshotPanel queueItems={queueItems} />
        </div>

    </div>
  );
}

