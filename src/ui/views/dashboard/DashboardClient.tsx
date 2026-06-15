"use client";

import { OperationalOverview } from "@/components/dashboard/OperationalOverview";
import { StackedStatCards } from "@/components/dashboard/StackedStatCards";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  RecentActivityPanel,
  RecentActivity,
} from "@/components/dashboard/RecentActivityPanel";
import {
  QueueSnapshotPanel,
  QueueItem,
} from "@/components/dashboard/QueueSnapshotPanel";

interface DashboardClientProps {
  totalClients: number;
  completedFilings: number;
  yetToFileFilings: number;
  pendingFilings: number;
  refundsPending: number;
  intimationsPending: number;
  totalOutstanding: number;
  totalBilled: number;
  queueItems: QueueItem[];
  recentLogs: RecentActivity[];
  currentAY: string;
  ayOptions: string[];
}

export default function DashboardClient({
  completedFilings,
  yetToFileFilings,
  pendingFilings,
  refundsPending,
  intimationsPending,
  totalOutstanding,
  totalBilled,
  queueItems,
  recentLogs,
}: DashboardClientProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 xl:gap-8 w-full min-w-0">
      {/* ── Main two-column layout: Left dashboard area │ Right column ── */}

      {/* ── LEFT COLUMN ── */}
      <div className="flex flex-col gap-6 xl:gap-8 min-w-0">
        {/* Top row: OperationalOverview + StackedStatCards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 xl:gap-8">
          <OperationalOverview
            completedFilings={{ value: completedFilings, isLoading: false }}
            yetToFileFilings={{ value: yetToFileFilings, isLoading: false }}
            pendingFilings={{ value: pendingFilings, isLoading: false }}
          />
          <StackedStatCards
            refundsPending={{ value: refundsPending, isLoading: false }}
            totalOutstanding={{ value: totalOutstanding, isLoading: false }}
            totalBilled={{ value: totalBilled, isLoading: false }}
          />
        </div>

        {/* Bottom row: Three summary cards */}
        <SummaryCards
          completedFilings={{ value: completedFilings, isLoading: false }}
          intimationsPending={{ value: intimationsPending, isLoading: false }}
          totalOutstanding={{ value: totalOutstanding, isLoading: false }}
        />
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="flex flex-col gap-6 xl:gap-8 min-w-0">
        <RecentActivityPanel
          recentLogs={recentLogs}
          isLoading={false}
          emptyStateMessage="No recent activity found."
        />
        <QueueSnapshotPanel
          queueItems={queueItems}
          isLoading={false}
          emptyStateMessage="Filing queue is empty."
        />
      </div>
    </div>
  );
}
