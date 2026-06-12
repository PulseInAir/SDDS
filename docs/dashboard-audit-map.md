# Dashboard Audit Map

This document contains the audit of existing data, props, routes, imports, and styling in the SDDS dashboard before redesign.

## 1. Existing Dashboard Count Variables (Props)
These variables are passed down to `DashboardClient.tsx` from the server component:
- `totalClients`: number
- `completedFilings`: number
- `yetToFileFilings`: number
- `pendingFilings`: number
- `refundsPending`: number
- `intimationsPending`: number
- `totalOutstanding`: number
- `totalBilled`: number

## 2. Recent Activity Data Shape
The `recentLogs` array contains objects with the following structure:
- `id`: unique identifier
- `clients`: object containing `{ name }`
- `description`: string (activity description)
- `created_at`: date string

## 3. Queue/Client Data Shape
The `queueItems` array contains objects with the following structure:
- `id`: unique identifier
- `client_id`: reference to the client
- `clients`: object containing `{ name, pan, mobile }`
- `filing_status`: string

## 4. Sidebar Nav Routes
Located in `layout.tsx`, the navigation includes the following links:
- `/` - Dashboard (Icon: LayoutDashboard)
- `/clients` - Clients (Icon: Users)
- `/queue` - Filing Queue (Icon: Clock)
- `/invoices` - Invoices (Icon: FileText)
- `/revenue` - Revenue / Collections (Icon: IndianRupee)
- `/data` - Data Manager (Icon: Database)
- `/settings` - Settings (Icon: Settings)

## 5. Header Controls
Located in `Header.tsx`:
- Quick Status indicator ("SDDS Operating Environment Active")
- Privacy Toggle Button (`isPrivacyMode` from `PrivacyContext`, toggles Eye/EyeOff icons)
- Security Badge ("SSL Secure Connection" with ShieldCheck)

## 6. AY Selector Props
Located in `AYSelect.tsx`:
- `currentAY`: string
- `ayOptions`: string[]
- Action: Uses `useRouter` to navigate to `/?ay=${selected_value}` on change.

## 7. Sign-out Logic
Located in `layout.tsx`:
- Uses a Next.js server action: `import { logout } from '@/app/login/actions';`
- Implemented as a form: `<form action={logout}>` with a submit button.

## 8. Imported Icon Library
- `lucide-react` is used across all components for icons (`Users`, `CheckCircle2`, `LayoutDashboard`, `Eye`, etc.).

## 9. Old Dashboard Visual Wrappers That Must Be Replaced
Found in `globals.css` and inline Tailwind classes:
- **CSS Classes**: `.glass-panel`, `.glass-panel-hover`, `.status-glow-emerald`, `.status-glow-amber`, `.status-glow-blue`.
- **Inline Tailwind Backgrounds/Borders**: `bg-slate-900/40`, `bg-slate-950/50`, `bg-slate-900/60`, `bg-slate-950`, `border-slate-800/80`, `border-emerald-500/35`.
- **Effects**: Blur circles like `bg-green-500/5 rounded-full blur-xl`, `shadow-lg shadow-blue-500/10`.
- **Animations**: `animate-in fade-in duration-300`, `hover:scale-[1.02]`.
