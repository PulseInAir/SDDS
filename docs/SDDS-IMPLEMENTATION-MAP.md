# SDDS Implementation Map

This document serves as the locked implementation map derived from completed baseline audit reports and browser verification.

## 1. Confirmed Active File Paths
**`src/app/` (Routing & Layouts)**
- `src/app/layout.tsx`
- `src/app/favicon.ico`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/page.tsx`
- `src/app/(dashboard)/clients/page.tsx`
- `src/app/(dashboard)/clients/[id]/...`
- `src/app/(dashboard)/clients/new/...`
- `src/app/(dashboard)/clients/actions.ts`
- `src/app/(dashboard)/data/...`
- `src/app/(dashboard)/invoices/...`
- `src/app/(dashboard)/queue/...`
- `src/app/(dashboard)/revenue/...`
- `src/app/(dashboard)/settings/...`
- `src/app/login/...`

**`src/ui/` (Presentation & Components)**
- `src/ui/styles/globals.css`
- `src/ui/views/dashboard/DashboardClient.tsx`
- `src/ui/components/Header.tsx`
- `src/ui/components/Sidebar.tsx`
- `src/ui/components/AYSelect.tsx`
- `src/ui/components/LifecycleTracker.tsx`
- `src/ui/components/dashboard/OverviewCard.tsx`
- `src/ui/components/dashboard/QueueSnapshotPanel.tsx`
- `src/ui/components/dashboard/RecentActivityPanel.tsx`
- `src/ui/components/dashboard/StackedStatCards.tsx`
- `src/ui/components/dashboard/SummaryCards.tsx`

> [!WARNING]
> The old `src/components/...` dashboard task pack is **OBSOLETE**. Do not use or reference components from this legacy directory.

## 2. Route and Component Ownership Map
| Route | Server Page / Layout | Client View | Components |
|---|---|---|---|
| `/` (Dashboard) | `src/app/(dashboard)/page.tsx` | `src/ui/views/dashboard/DashboardClient.tsx` | `OverviewCard`, `QueueSnapshotPanel`, `RecentActivityPanel`, `StackedStatCards`, `SummaryCards` |
| `/clients` | `src/app/(dashboard)/clients/page.tsx` | `src/ui/views/clients/...` | `LifecycleTracker`, Client Tables |
| *Global App* | `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx` | N/A | `Sidebar`, `Header`, `AYSelect` |

## 3. Dashboard Metric-to-Query Map
- **Total Revenue**: Aggregated from `invoices` where status is 'paid'.
- **Active Clients**: Count of `clients` where status is 'active'.
- **Pending Tasks**: Count from `tasks`/queue where status is 'pending'.
- **Recent Activity**: Latest entries from `activity_logs` or `audit_logs` ordered by timestamp descending.
- **Queue Snapshot**: Summary counts grouped by queue stage/status.

## 4. Confirmed P0 Risks
The following P0 risks must be addressed before or during implementation:
- **Destructive ON DELETE CASCADE rules**: Potential for unintended data loss if parent records are deleted.
- **Document-storage authorization review**: Documents currently have a status of **Partial / Security Review Required**. Authorization logic needs thorough validation.
- **Encryption variable fallback ambiguity**: Inconsistent or missing fallbacks for encryption environment variables could lead to cryptographic failures.

## 5. Missing Modules
The following modules are currently missing from the implementation and must be developed:
- **Refunds**
- **Intimations / Notices**
- **Follow-up**

## 6. Exact UI Implementation Order
1. **design tokens** (`src/ui/styles/globals.css`)
2. **app frame** (`src/app/(dashboard)/layout.tsx`)
3. **sidebar** (`src/ui/components/Sidebar.tsx`)
4. **active cut-out** (Navigation state in Sidebar)
5. **header** (`src/ui/components/Header.tsx`, `src/ui/components/AYSelect.tsx`)
6. **Dashboard components** (`src/ui/components/dashboard/*`)
7. **real data wiring** (Connecting Supabase queries to components)
8. **responsive behaviour** (Ensuring mobile/tablet compatibility)
9. **screenshot correction loop** (Final pixel verification against reference designs)

## 7. Files Allowed to Change in Each Stage
- **Stage 1 (Tokens)**: `src/ui/styles/globals.css`
- **Stage 2-5 (Frame & Nav)**: `src/app/(dashboard)/layout.tsx`, `src/ui/components/Sidebar.tsx`, `src/ui/components/Header.tsx`, `src/ui/components/AYSelect.tsx`
- **Stage 6 (Dashboard)**: `src/ui/views/dashboard/DashboardClient.tsx`, `src/ui/components/dashboard/*`
- **Stage 7 (Data Wiring)**: Server queries/actions, `src/app/(dashboard)/page.tsx`, `src/ui/views/dashboard/DashboardClient.tsx`
- **Stage 8-9 (Polish)**: All UI files listed above.

## 8. Validation Commands and Rollback Rule
**Validation Commands:**
- Build Check: `npm run build`
- Linting: `npm run lint`
- Start Dev Server: `npm run dev`

**Rollback Rule:**
If a UI implementation step introduces a regression or fails pixel verification, immediately rollback the changes for that specific step via Git before proceeding. Do not compound errors.

## 9. Corrections & Constraints
- **Performance Review**: Route transitions of 1.0–1.5 seconds require performance review.
- **Security Check**: Documents = Partial / Security Review Required.
- **Data Integrity**: Live business data must **not** be changed to match reference sample text.
- **Visual Accuracy**: Final pixel verification remains mandatory during implementation.

IMPLEMENTATION MAP LOCKED — NO APPLICATION FILES MODIFIED
