# Dashboard Component API Contract

This document defines the exact props for the operational dashboard components based strictly on existing data shapes and variables. No new backend fields, charts, or fake UI elements are introduced.

## Core Types

Every metric must accept a value, state indicators, and an action to navigate to the relevant filtered records.

```typescript
interface MetricProps {
  value: number;
  isLoading: boolean;
  error?: string;
  href?: string;
  onClick?: () => void;
}
```

## 1. OperationalOverview

Functional area replacing the old chart. Focuses on actionable filing states.

```typescript
interface OperationalOverviewProps {
  completedFilings: MetricProps;
  yetToFileFilings: MetricProps;
  pendingFilings: MetricProps;
}
```

## 2. StackedStatCards

Focuses on pending financial and closure workflows.

```typescript
interface StackedStatCardsProps {
  refundsPending: MetricProps;
  totalOutstanding: MetricProps;
  totalBilled: MetricProps;
}
```

## 3. SummaryCards

Core operational summaries. No progress percentages are included since valid numerators/denominators are not provided.

```typescript
interface SummaryCardsProps {
  completedFilings: MetricProps;
  intimationsPending: MetricProps;
  totalOutstanding: MetricProps;
}
```

## 4. RecentActivityPanel

List of recent system actions. Supports empty states and optional actions per row.

```typescript
interface RecentActivity {
  id: string | number;
  clients: { 
    name: string;
  };
  description: string;
  created_at: string;
  actionHref?: string;
  onActionClick?: () => void;
}

interface RecentActivityPanelProps {
  recentLogs: RecentActivity[];
  isLoading: boolean;
  error?: string;
  emptyStateMessage: string;
}
```

## 5. QueueSnapshotPanel

Snapshot of the current filing work queue. Every row must link to the client's working record.

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
  recordUrl: string;
}

interface QueueSnapshotPanelProps {
  queueItems: QueueItem[];
  isLoading: boolean;
  error?: string;
  emptyStateMessage: string;
}
```
