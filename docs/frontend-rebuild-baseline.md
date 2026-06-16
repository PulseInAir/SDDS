# Frontend Rebuild Baseline

## 1. Current verified rebuild branch
- `frontend-rebuild-v2`
- Working tree was clean before this final verification pass

## 2. Current verified HEAD commit
- `4f0aadb99b0635852135f4e84643d06b330ce74b`
- Original baseline commit: `99fb0950e67fda85bb22cef978d5a047851168a4`
- Ancestry check: `git merge-base --is-ancestor 99fb0950e67fda85bb22cef978d5a047851168a4 HEAD` -> true
- Recent history reviewed: `4f0aadb`, `99fb095`, `0e255d6`, `254ba3c`, `377d4f9`

## 3. Rollback tag
- `pre-frontend-rebuild-2026-06-16`
- Required target commit: `99fb0950e67fda85bb22cef978d5a047851168a4`
- Local status: exists and resolves to `99fb0950e67fda85bb22cef978d5a047851168a4`
- Remote status: exists on `origin`

## 4. Rebuild branch status
- `frontend-rebuild-v2`
- Merge-base with `main`: `99fb0950e67fda85bb22cef978d5a047851168a4`
- `origin/frontend-rebuild-v2` currently points to `4f0aadb99b0635852135f4e84643d06b330ce74b`
- `origin/main` currently points to `99fb0950e67fda85bb22cef978d5a047851168a4`
- `main` remained untouched by the rebuild work

## 5. Git cleanliness result
- Verification start state on `frontend-rebuild-v2`: clean
- `git diff --check`: pass
- `git diff --name-status 99fb0950e67fda85bb22cef978d5a047851168a4..HEAD` shows only `A docs/frontend-rebuild-baseline.md`
- Only baseline documentation changed after the original baseline commit
- No application code changed after the original baseline commit

## 6. Build/type/lint baseline
- TypeScript/type check:
  - Command: `npx tsc --noEmit`
  - Result: fail
  - Exact failure: `src/utils/crypto.test.ts(91,9): error TS2322: Type 'unknown' is not assignable to type 'string'.`
  - Confirmed pre-rebuild status: yes, only baseline documentation changed after the original baseline commit
- Lint:
  - Command: `npm run lint`
  - Result: fail
  - Exact result: `146 problems (87 errors, 59 warnings)`
  - Confirmed reason categories: `no-explicit-any`, `no-unused-vars`, `react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`, `react/no-unescaped-entities`, `@typescript-eslint/ban-ts-comment`, and `prefer-const`
  - Confirmed pre-rebuild status: yes, this is baseline technical debt because only baseline documentation changed after the original baseline commit
- Production build:
  - Command: `npm run build`
  - Result: pass
  - Confirmed notes: build succeeds on Next.js `16.2.7`, TypeScript phase finishes during the framework build, static pages generate successfully, and the output lists all current app routes
  - Warnings observed: Next.js `middleware` -> `proxy` deprecation warning and Node.js `DEP0205` warning for `module.register()`
  - Confirmed pre-rebuild status: yes, this is the current baseline before any frontend rebuild work

## 7. Complete route map

### Live routes
| Route | Owning file(s) | Operational purpose |
| --- | --- | --- |
| `/login` | `src/app/login/page.tsx`, `src/app/login/actions.ts`, `src/app/layout.tsx`, `src/middleware.ts` | Sign-in entry point for the private system |
| `/` | `src/app/(dashboard)/page.tsx`, `src/ui/views/dashboard/DashboardClient.tsx`, `src/components/dashboard/*`, `src/app/(dashboard)/layout.tsx` | Dashboard overview for clients, filings, recent activity, queue snapshot, invoices, and revenue totals |
| `/clients` | `src/app/(dashboard)/clients/page.tsx`, `src/ui/views/clients/ClientListContainer.tsx`, `src/app/(dashboard)/clients/actions.ts` | Client directory with search, selection, and deletion controls |
| `/clients/new` | `src/app/(dashboard)/clients/new/page.tsx`, `src/ui/views/clients/new/NewClientClient.tsx`, `src/app/(dashboard)/clients/actions.ts` | New-client onboarding, duplicate checks, and client creation |
| `/clients/[id]` | `src/app/(dashboard)/clients/[id]/page.tsx`, `src/ui/views/clients/[id]/ClientProfileContainer.tsx`, `src/ui/components/LifecycleTracker.tsx`, `src/app/(dashboard)/clients/actions.ts` | Client profile, filing lifecycle, document storage, invoices, payments, notes, and password reveal |
| `/queue` | `src/app/(dashboard)/queue/page.tsx`, `src/ui/views/queue/QueueListContainer.tsx`, `src/app/(dashboard)/clients/actions.ts` | Filing work queue with AY filtering, rollover trigger, credential copy, and WhatsApp reminder launch |
| `/data` | `src/app/(dashboard)/data/page.tsx`, `src/ui/views/data/DataManagerClient.tsx`, `src/app/(dashboard)/clients/actions.ts` | CSV import, queue rollover, and multi-table export management |
| `/invoices` | `src/app/(dashboard)/invoices/page.tsx`, `src/ui/views/invoices/InvoicesListContainer.tsx`, `src/app/(dashboard)/clients/actions.ts` | Invoice list, AY filter, CSV export, and payment reminder launch |
| `/invoices/[id]` | `src/app/(dashboard)/invoices/[id]/page.tsx`, `src/app/(dashboard)/invoices/[id]/InvoicePrintView.tsx`, `src/context/PrivacyContext.tsx` | Invoice detail/print view with masked client and payment data |
| `/revenue` | `src/app/(dashboard)/revenue/page.tsx`, `src/ui/views/revenue/RevenueClient.tsx`, `src/app/(dashboard)/revenue/actions.ts` | Revenue invoice creation, edits, payments, waivers, delete flow, analytics, and KPI reporting |
| `/revenue/print/[id]` | `src/app/(dashboard)/revenue/print/[id]/page.tsx`, `src/app/(dashboard)/revenue/print/[id]/RevenuePrintView.tsx`, `src/context/PrivacyContext.tsx` | Revenue invoice print view with privacy masking and payment ledger |
| `/settings` | `src/app/(dashboard)/settings/page.tsx`, `src/ui/views/settings/SettingsClient.tsx`, `src/app/(dashboard)/clients/actions.ts` | System settings for firm profile, fee presets, WhatsApp templates, theme, and password backfill |

### Shared route wrappers
| Scope | Owning file(s) | Purpose |
| --- | --- | --- |
| All routes | `src/app/layout.tsx`, `src/ui/styles/globals.css` | Global font, global CSS, and root theme bootstrap |
| All dashboard routes | `src/app/(dashboard)/layout.tsx`, `src/ui/components/Sidebar.tsx`, `src/ui/components/Header.tsx`, `src/ui/components/AYSelect.tsx`, `src/context/PrivacyContext.tsx` | Authentication gate, shell, sidebar, header controls, AY navigation, and privacy-mode context |

### API routes and route handlers
- No `src/app/**/route.ts` handlers were found
- No API routes were found in the current App Router tree

### Server actions
| Server action file | Purpose |
| --- | --- |
| `src/app/login/actions.ts` | Login and logout |
| `src/app/(dashboard)/clients/actions.ts` | Client CRUD, duplicate checks, password encryption/decryption, filing workflow, invoices, payments, documents, imports, WhatsApp logging, system settings, and deletions |
| `src/app/(dashboard)/revenue/actions.ts` | Revenue invoice CRUD, payment recording, waivers, deletes, numbering, and activity logging |

### Required modules currently absent as routes
- Refunds route: missing
- Intimations / Notices route: missing
- Follow-up route: missing

## 8. Preserve-unchanged file map

### Authentication, middleware, Supabase clients, encryption, privacy, validation, calculations, and server actions
- `src/middleware.ts`
  - Route protection and login redirect middleware
- `src/utils/supabase/server.ts`
  - Server Supabase client and cookie bridge
- `src/utils/supabase/client.ts`
  - Browser Supabase client
- `src/utils/supabase/middleware.ts`
  - Session refresh helper for middleware/proxy migration work
- `src/app/login/actions.ts`
  - Login and logout server actions
- `src/app/(dashboard)/clients/actions.ts`
  - Core backend/business logic for clients, filings, documents, payments, notes, queue rollover, CSV import, password reveal, system settings, and delete flows
- `src/app/(dashboard)/revenue/actions.ts`
  - Revenue invoice numbering, calculations, mutations, logging, and payment controls
- `src/utils/crypto.ts`
  - Portal-password encryption and decryption logic
- `src/context/PrivacyContext.tsx`
  - Privacy-mode state and masking control
- `src/utils/ay.ts`
  - Assessment-year derivation and options generation
- `src/utils/lifecycle.ts`
  - Filing-status taxonomy, normalization, progress, and lifecycle helpers
- `src/scripts/migrate-encryption-keys.ts`
  - Migration utility for legacy encrypted credentials
- `src/utils/crypto.test.ts`
  - Crypto and migration tests

### Why these files are protected
- They own authentication, route protection, credential encryption, Supabase access, environment-variable access, database writes, document-storage access, business calculations, or operational workflow rules
- Replacing their UI around them is acceptable later; modifying or deleting their logic during the frontend rebuild is not

## 9. Extract-before-replacement file map

### Layout and shell files
- `src/app/layout.tsx`
  - Extract and preserve the `system_settings` theme lookup and root theme bootstrap before changing root markup
- `src/app/(dashboard)/layout.tsx`
  - Extract and preserve the auth guard, current-user fetch, privacy-provider wiring, shell ownership, and sign-out/user-area behavior before replacing shell visuals
- `src/ui/components/Sidebar.tsx`
  - Extract and preserve route-aware active-nav logic and nav configuration before replacing sidebar markup
- `src/ui/components/Header.tsx`
  - Extract and preserve privacy-toggle behavior and AY control contract before replacing header markup
- `src/ui/components/AYSelect.tsx`
  - Extract and preserve route-navigation behavior; current implementation hardcodes `/?ay=...` and should become a reusable route-aware AY controller before shell replacement

### Dashboard
- `src/app/(dashboard)/page.tsx`
  - Extract dashboard queries, metric calculations, recent-activity shaping, queue shaping, and AY parameter handling
- `src/ui/views/dashboard/DashboardClient.tsx`
  - Extract raw-data mapping, fallback shaping, and route link mapping from the visual grid

### Clients
- `src/app/(dashboard)/clients/page.tsx`
  - Extract client query loading from page composition
- `src/ui/views/clients/ClientListContainer.tsx`
  - Extract delete flow, client filtering, PAN/invoice/acknowledgement search, privacy row reveal state, and row-navigation behavior
- `src/app/(dashboard)/clients/new/page.tsx`
  - Keep as a thin wrapper after extraction; current risk is low but the route should remain page-only
- `src/ui/views/clients/new/NewClientClient.tsx`
  - Extract duplicate-check calls, PAN-derived password generation, client-side validation, and create-client submission flow
- `src/app/(dashboard)/clients/[id]/page.tsx`
  - Extract client profile query orchestration and invoice/payment dependent loading chain
- `src/ui/views/clients/[id]/ClientProfileContainer.tsx`
  - Extract profile form validation, password reveal, filing updates, payment recording, document upload/download/delete, AY switching behavior, revised filing creation, notes/activity handling, and delete flow before replacing profile UI

### Queue
- `src/app/(dashboard)/queue/page.tsx`
  - Extract queue query and AY filtering logic
- `src/ui/views/queue/QueueListContainer.tsx`
  - Extract rollover trigger, credential-copy flow, WhatsApp template loading, outbound WhatsApp URL construction, filtering, and AY navigation

### Data manager
- `src/app/(dashboard)/data/page.tsx`
  - Extract export dataset loading and AY defaults
- `src/ui/views/data/DataManagerClient.tsx`
  - Extract CSV parsing, CSV template copy, import submission, rollover trigger, backup reminder local-storage logic, CSV conversion, and export download builders

### Invoices
- `src/app/(dashboard)/invoices/page.tsx`
  - Extract AY-specific invoice query loading
- `src/ui/views/invoices/InvoicesListContainer.tsx`
  - Extract filtering, CSV export generation, privacy reveal state, and WhatsApp payment reminder flow
- `src/app/(dashboard)/invoices/[id]/page.tsx`
  - Extract invoice and payment query orchestration
- `src/app/(dashboard)/invoices/[id]/InvoicePrintView.tsx`
  - Extract privacy masking helpers and date/currency formatting used by the print view

### Revenue / collections
- `src/app/(dashboard)/revenue/page.tsx`
  - Extract revenue queries and the schema-missing operational fallback state
- `src/ui/views/revenue/RevenueClient.tsx`
  - Extract filtering, pagination, KPI calculations, modal state machines, invoice/payment form state, and revenue action wiring
- `src/app/(dashboard)/revenue/print/[id]/page.tsx`
  - Extract print query orchestration
- `src/app/(dashboard)/revenue/print/[id]/RevenuePrintView.tsx`
  - Extract privacy masking and date/currency formatting helpers

### Settings
- `src/app/(dashboard)/settings/page.tsx`
  - Extract environment-status derivation, `system_settings` loading, map/default shaping, and theme fallback logic
- `src/ui/views/settings/SettingsClient.tsx`
  - Extract settings-save flows, theme reload behavior, and password backfill action wiring

## 10. Safe-to-replace file map

### Pure or mostly presentational dashboard components already inspected
- `src/components/dashboard/OperationalOverview.tsx`
- `src/components/dashboard/StackedStatCards.tsx`
- `src/components/dashboard/SummaryCards.tsx`
- `src/components/dashboard/RecentActivityPanel.tsx`
- `src/components/dashboard/QueueSnapshotPanel.tsx`
- `src/ui/components/dashboard/OverviewCard.tsx`
- `src/ui/components/dashboard/RecentActivityPanel.tsx`
- `src/ui/components/dashboard/QueueSnapshotPanel.tsx`
- `src/ui/components/dashboard/StackedStatCards.tsx`
- `src/ui/components/dashboard/SummaryCards.tsx`
- `src/ui/components/LifecycleTracker.tsx`

### Why these are currently safe to replace
- They are presentational components driven by props and utility imports
- They do not directly query Supabase, mutate the database, read environment variables, or perform authentication
- `LifecycleTracker` depends on `src/utils/lifecycle.ts`; the utility contract must stay intact even if the component is rebuilt

## 11. Unknown/high-risk file map
- `src/ui/views/dashboard/DashboardClient.tsx`
  - High risk because it imports the old `src/components/dashboard/*` tree, not the newer `src/ui/components/dashboard/*` tree, so dashboard ownership is split across two directories
- `src/components/dashboard/*` and `src/ui/components/dashboard/*`
  - High risk as a pair because both directories contain dashboard presentation implementations, and deleting either set before normalizing imports risks breaking the live dashboard
- `src/app/(dashboard)/layout.tsx`
  - High risk because auth, privacy-provider scope, shell visuals, active-sidebar cut-out styling, and user-area behavior are all intertwined in one file
- `src/app/layout.tsx`
  - High risk because root theme selection is coupled to server data (`system_settings`) and global layout markup
- `src/app/(dashboard)/revenue/page.tsx`
  - High risk because route behavior depends on whether `revenue_invoices` exists in the live schema; replacing UI without preserving this operational fallback could hide a real backend blocker

## 12. Shared-component impact map
| Shared file | Affected routes |
| --- | --- |
| `src/app/layout.tsx` | `/login`, `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/ui/styles/globals.css` | `/login`, `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/app/(dashboard)/layout.tsx` | `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/context/PrivacyContext.tsx` | `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/ui/components/Sidebar.tsx` | `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/ui/components/Header.tsx` | `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/ui/components/AYSelect.tsx` | `/`, `/clients`, `/clients/new`, `/clients/[id]`, `/queue`, `/data`, `/invoices`, `/invoices/[id]`, `/revenue`, `/revenue/print/[id]`, `/settings` |
| `src/ui/components/LifecycleTracker.tsx` | `/clients/[id]` |
| `src/ui/views/dashboard/DashboardClient.tsx` | `/` |
| `src/ui/views/clients/ClientListContainer.tsx` | `/clients` |
| `src/ui/views/clients/[id]/ClientProfileContainer.tsx` | `/clients/[id]` |
| `src/ui/views/clients/new/NewClientClient.tsx` | `/clients/new` |
| `src/ui/views/queue/QueueListContainer.tsx` | `/queue` |
| `src/ui/views/data/DataManagerClient.tsx` | `/data` |
| `src/ui/views/invoices/InvoicesListContainer.tsx` | `/invoices` |
| `src/ui/views/revenue/RevenueClient.tsx` | `/revenue` |
| `src/ui/views/settings/SettingsClient.tsx` | `/settings` |

### Loading and error boundaries
- No route-level `loading.tsx`, `error.tsx`, or custom `not-found.tsx` files were found in `src/app`

## 13. Existing CSS and layout ownership

### Outer application frame
- `src/app/(dashboard)/layout.tsx`
  - Owns the dashboard outer gradient, app frame, rounded shell, content canvas, sidebar wrapper, and main scroll region
- `src/app/layout.tsx`
  - Owns root font and `data-theme` attribute
- `src/ui/styles/globals.css`
  - Owns root tokens, body background, focus styling, scrollbar styling, and responsive base font scaling

### Sidebar width and navigation states
- `src/app/(dashboard)/layout.tsx`
  - Owns responsive sidebar width classes and the active-cutout override classes applied to descendant links
- `src/ui/components/Sidebar.tsx`
  - Owns nav item list, `usePathname()` matching, active indicator measurements, and mobile/desktop label rendering

### Header positioning
- `src/app/(dashboard)/layout.tsx`
  - Positions the header inside the right-hand canvas
- `src/ui/components/Header.tsx`
  - Owns title, search box, privacy toggle, AY label, and add-client button spacing

### Page width, padding, and overflow
- `src/app/(dashboard)/layout.tsx`
  - Owns main page padding and scroll container
- `src/app/(dashboard)/data/page.tsx`
  - Imposes `max-w-5xl`
- `src/app/(dashboard)/settings/page.tsx`
  - Imposes `max-w-5xl`
- `src/app/(dashboard)/clients/new/page.tsx`
  - Imposes `max-w-2xl`
- `src/ui/views/dashboard/DashboardClient.tsx`
  - Owns dashboard grid proportions, overflow wrappers, and min-width guards

### Duplicated or conflicting visual ownership
- `src/components/dashboard/*` and `src/ui/components/dashboard/*`
  - Duplicate dashboard presentation ownership
- `src/app/(dashboard)/layout.tsx`
  - Contains extensive inline visual shell classes that overlap with global token intent in `src/ui/styles/globals.css`
- Multiple route/view files still use dark slate visual treatments while the latest dashboard shell aims for a white/blue shell

### Hardcoded spacing and colors
- `src/app/(dashboard)/layout.tsx`
- `src/ui/components/Header.tsx`
- `src/ui/components/Sidebar.tsx`
- `src/app/login/page.tsx`
- `src/ui/views/clients/*`
- `src/ui/views/queue/QueueListContainer.tsx`
- `src/ui/views/data/DataManagerClient.tsx`
- `src/ui/views/invoices/InvoicesListContainer.tsx`
- `src/ui/views/revenue/RevenueClient.tsx`
- `src/ui/views/settings/SettingsClient.tsx`
- `src/app/(dashboard)/invoices/[id]/InvoicePrintView.tsx`
- `src/app/(dashboard)/revenue/print/[id]/RevenuePrintView.tsx`

### Where responsive behavior currently lives
- Mostly in `src/app/(dashboard)/layout.tsx`, `src/ui/components/Header.tsx`, `src/ui/components/Sidebar.tsx`, and `src/ui/views/dashboard/DashboardClient.tsx`
- Additional per-feature responsive rules exist inside the client containers for queue, invoices, revenue, data manager, and new-client pages

## 14. Exact blockers to deleting old frontend code
- `src/app/(dashboard)/layout.tsx` mixes shell UI with auth and privacy-provider behavior
- `src/app/layout.tsx` mixes root UI with theme lookup from `system_settings`
- `src/ui/components/Header.tsx`, `src/ui/components/Sidebar.tsx`, and `src/ui/components/AYSelect.tsx` contain route-state and privacy behavior, not just markup
- `src/app/(dashboard)/page.tsx` and `src/ui/views/dashboard/DashboardClient.tsx` still own live dashboard query shaping and route linking
- `src/ui/views/clients/[id]/ClientProfileContainer.tsx` contains critical filing, document, billing, payment, password, and activity behavior in one UI file
- `src/ui/views/clients/new/NewClientClient.tsx`, `src/ui/views/queue/QueueListContainer.tsx`, `src/ui/views/data/DataManagerClient.tsx`, `src/ui/views/invoices/InvoicesListContainer.tsx`, `src/ui/views/revenue/RevenueClient.tsx`, and `src/ui/views/settings/SettingsClient.tsx` all call live server actions directly
- Dashboard component ownership is duplicated between `src/components/dashboard/*` and `src/ui/components/dashboard/*`
- Print views still contain privacy masking and formatting logic that would be lost if deleted as "just UI"

## 15. Recommended clean presentation-layer structure

### Smallest safe structure using the current repository as-is
```text
src/
  app/                          # routes, thin layouts, thin pages, server actions
  context/                      # cross-route UI state such as privacy mode
  ui/
    styles/                     # tokens and globals
    components/
      layout/                   # shell, sidebar, header, AY navigator, page container
      primitives/               # buttons, inputs, cards, badges, tables, dialogs
      dashboard/                # dashboard presentation only
    views/                      # feature page presentation only
  features/
    dashboard/
      queries.ts                # dashboard loaders
      mappers.ts                # dashboard shaping/link mapping
    clients/
      loaders.ts                # client/profile route loaders
      forms.ts                  # form shaping and validation helpers
      exports.ts                # CSV/export helpers
    queue/
      loaders.ts
      reminders.ts
    invoices/
      loaders.ts
      exports.ts
    revenue/
      loaders.ts
      metrics.ts
    settings/
      loaders.ts
      defaults.ts
  utils/                        # Supabase clients, crypto, AY, lifecycle
```

### Structure rules
- Keep `src/app/**/page.tsx` and `src/app/**/layout.tsx` thin
- Keep server actions where they already work unless a later task explicitly relocates them
- Move query shaping, exports, filters, formatters, and browser-flow helpers out of large view containers before any blank-slate UI rewrite
- Normalize to one dashboard component directory before rebuilding the dashboard again

## 16. Safest first frontend implementation unit
- Extract the dashboard shell boundary first:
  - `src/app/(dashboard)/layout.tsx`
  - `src/ui/components/Sidebar.tsx`
  - `src/ui/components/Header.tsx`
  - `src/ui/components/AYSelect.tsx`
- Reason:
  - This creates a reusable shell without touching client data, Supabase queries, or server actions
  - It isolates auth, privacy, navigation, and layout concerns before page-by-page visual replacement

## 17. Risks requiring resolution before old UI removal
- Dashboard ownership ambiguity must be resolved because two dashboard component directories coexist and one is still live
- Shell auth/privacy/navigation logic must be separated from visuals before deleting or replacing the dashboard layout
- Client profile logic must be extracted before any profile UI deletion because it currently owns document storage, filing updates, payments, and password reveal
- Settings logic must be extracted before UI removal because it owns system-settings writes, theme preference changes, and password backfill
- Data manager logic must be extracted before UI removal because it owns imports, exports, rollover triggers, and local backup reminders
- Invoice, revenue, and queue reminder flows must be extracted before UI removal because they build operational exports and outbound WhatsApp actions
- Print-view masking and formatting helpers must be preserved before replacing print UIs
