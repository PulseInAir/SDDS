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
  queueItems: Record<string, unknown>[]; // Accept raw data and map it safely
  recentLogs: Record<string, unknown>[]; // Accept raw data and map it safely
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
  // Map raw data safely to RecentActivity prop contract
  type RawLogType = { id?: string; clients?: unknown; description?: string; created_at?: string };
  const mappedRecentLogs: RecentActivity[] = (recentLogs || []).map((rawLog, index) => {
    const log = rawLog as RawLogType;
    // Safely extract client name, handling array or object or null
    let clientName = "Unknown Client";
    if (log.clients) {
      if (Array.isArray(log.clients)) {
        clientName = log.clients[0]?.name || "Unknown Client";
      } else if (typeof log.clients === 'object' && log.clients !== null) {
        clientName = (log.clients as Record<string, unknown>).name as string || "Unknown Client";
      }
    }

    return {
      id: log.id || `fallback-id-${index}`,
      clients: { name: clientName },
      description: log.description || "No description provided",
      created_at: log.created_at || new Date().toISOString(),
      // We don't invent fallback business data or links, so actionHref is omitted unless we had one.
    };
  });

  // Map raw queue data safely and limit to 3 records
  type RawQueueItemType = { id?: string; client_id?: string; clients?: unknown; filing_status?: string };
  const mappedQueueItems: QueueItem[] = (queueItems || []).slice(0, 3).map((rawItem, index) => {
    const item = rawItem as RawQueueItemType;
    let clientData = { name: "Unknown Client", pan: "", mobile: "" };
    if (item.clients) {
      if (Array.isArray(item.clients)) {
        clientData = item.clients[0] || clientData;
      } else if (typeof item.clients === 'object' && item.clients !== null) {
        const c = item.clients as Record<string, unknown>;
        clientData = {
          name: (c.name as string) || "Unknown Client",
          pan: (c.pan as string) || "",
          mobile: (c.mobile as string) || ""
        };
      }
    }

    return {
      id: item.id || `fallback-id-${index}`,
      client_id: item.client_id || "",
      clients: {
        name: clientData.name || "Unknown Client",
        pan: clientData.pan || "",
        mobile: clientData.mobile || "",
      },
      filing_status: item.filing_status || "Unknown",
      recordUrl: item.client_id ? `/clients/${item.client_id}` : "#",
    };
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-6 xl:gap-8 w-full min-w-0 max-w-full">
      {/* ── LEFT COLUMN ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 xl:gap-8 min-w-0 max-w-full">

        {/* Left Side: Overview + Summary Cards */}
        <div className="flex flex-col gap-6 xl:gap-8 min-w-0 max-w-full">
          <div className="w-full overflow-x-auto pb-1 max-w-[100vw]">
            <div className="min-w-[600px] xl:min-w-0">
              <OperationalOverview
                completedFilings={{ value: completedFilings, isLoading: false, href: '/data' }}
                yetToFileFilings={{ value: yetToFileFilings, isLoading: false, href: '/queue' }}
                pendingFilings={{ value: pendingFilings, isLoading: false, href: '/queue' }}
              />
            </div>
          </div>
          <div className="w-full overflow-x-auto pb-1 max-w-[100vw]">
            <div className="min-w-[600px] xl:min-w-0">
              <SummaryCards
                completedFilings={{ value: completedFilings, isLoading: false, href: '/data' }}
                intimationsPending={{ value: intimationsPending, isLoading: false, href: '/queue' }}
                totalOutstanding={{ value: totalOutstanding, isLoading: false, href: '/revenue' }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Stacked Stat Cards */}
        <div className="w-full overflow-x-auto pb-1 max-w-[100vw]">
          <div className="min-w-[280px] xl:min-w-0">
            <StackedStatCards
              refundsPending={{ value: refundsPending, isLoading: false }}
              totalOutstanding={{ value: totalOutstanding, isLoading: false }}
              totalBilled={{ value: totalBilled, isLoading: false }}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="flex flex-col xl:grid xl:grid-rows-2 gap-6 xl:gap-8 min-w-0 max-w-full h-full">
        <div className="w-full overflow-x-auto pb-1 max-w-[100vw] h-full">
          <div className="min-w-[340px] xl:min-w-0 h-full">
            <RecentActivityPanel
              recentLogs={mappedRecentLogs}
              isLoading={false}
              emptyStateMessage="No recent activity found."
            />
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-1 max-w-[100vw] h-full">
          <div className="min-w-[340px] xl:min-w-0 h-full">
            <QueueSnapshotPanel
              queueItems={mappedQueueItems}
              isLoading={false}
              emptyStateMessage="Filing queue is empty."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
