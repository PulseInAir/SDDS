# Dashboard Component API Contract

This document defines the exact props for the new dashboard components based strictly on existing data shapes and variables. No new backend fields or routes are introduced.

## 1. OverviewCard
Displays the main chart and three key metrics: "Filed This AY", "Yet To File", and "Pending Filings".
```typescript
interface OverviewCardProps {
  completedFilings: number;
  yetToFileFilings: number;
  pendingFilings: number;
}
```

## 2. StackedStatCards
Displays "Refunds Pending" and "Outstanding Bal." with "Billed" subtext.
```typescript
interface StackedStatCardsProps {
  refundsPending: number;
  totalOutstanding: number;
  totalBilled: number;
}
```

## 3. SummaryCards
Three equal-width cards displaying "Filed This AY", "Intimations Pending", and "Revenue / Collections" (Outstanding).
```typescript
interface SummaryCardsProps {
  completedFilings: number;
  intimationsPending: number;
  totalOutstanding: number;
}
```

## 4. RecentActivityPanel
Displays a list of recent activity logs.
```typescript
interface RecentActivity {
  id: string | number;
  clients: { 
    name: string;
  };
  description: string;
  created_at: string;
}

interface RecentActivityPanelProps {
  recentLogs: RecentActivity[];
}
```

## 5. QueueSnapshotPanel
Displays a snapshot of clients in the filing queue.
```typescript
interface QueueItem {
  id: string | number;
  client_id: string | number;
  clients: { 
    name: string; 
    pan: string; 
    mobile: string;
  };
  filing_status: string;
}

interface QueueSnapshotPanelProps {
  queueItems: QueueItem[];
}
```
