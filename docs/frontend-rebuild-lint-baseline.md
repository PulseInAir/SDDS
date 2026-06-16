# Frontend Rebuild Lint Baseline

## 1. Git evidence
- Branch at verification start: `frontend-rebuild-v2`
- Verification-start HEAD: `36b22f4fe9d8994bed46c6b91f522b623326433d`
- Upstream at verification start: `origin/frontend-rebuild-v2`
- Local HEAD matched remote branch HEAD: yes
- Working tree at verification start: clean
- Stable pre-rebuild base: `99fb0950e67fda85bb22cef978d5a047851168a4`
- `git diff --name-status 99fb0950e67fda85bb22cef978d5a047851168a4..HEAD`: only `A docs/frontend-rebuild-baseline.md`
- Application source changed after stable base: no
- ESLint configuration changed after stable base: no
- Package files or lockfiles changed after stable base: no
- Therefore the current lint debt predates Task 00: yes

## 2. Lint command and exact totals
- Configured lint command: `npm run lint`
- Effective lint script from `package.json`: `eslint`
- Result: failed
- Total errors: `87`
- Total warnings: `59`
- Total findings: `146`
- Affected files: `23`
- Files with at least one error: `16`
- Fixable errors: `1`
- Fixable warnings: `0`
- Raw lint output was captured outside the repository
- JSON lint report was captured outside the repository with the same effective target as the configured lint script

## 3. Scope proof
- The stable-base-to-HEAD diff contains only `docs/frontend-rebuild-baseline.md`, so Task 00 did not change any linted application, configuration, package, or lock files
- The configured lint command is repo-wide `eslint`; it is not scoped to changed files or frontend-only paths
- The changed Markdown file `docs/frontend-rebuild-baseline.md` is not examined by the current lint run
- No generated/build files were reported: `.next`, `out`, `build`, `next-env.d.ts`, and `*.tsbuildinfo` remained out of scope
- No archived or temporary files were reported
- One maintenance script inside the source tree was linted: `src/scripts/migrate-encryption-keys.ts`
- Repo-wide lint also covered test and utility files such as `src/utils/crypto.test.ts` and `src/utils/supabase/middleware.ts`
- No ESLint parser/configuration failures were reported
- No unintended generated/build/archive/temp-file lint-scope defect was proven

## 4. Findings grouped by rule and category

### A — mechanical auto-fix candidate
- `prefer-const`: `1` error
  - Files:
    - `src/scripts/migrate-encryption-keys.ts` (`1`)
  - Notes:
    - This is the only finding ESLint reports as directly fixable by `--fix`

### B — safe manual code-quality correction
- `react/no-unescaped-entities`: `6` errors
  - Files:
    - `src/ui/views/data/DataManagerClient.tsx` (`4`)
    - `src/ui/views/revenue/RevenueClient.tsx` (`2`)
- `@typescript-eslint/no-unused-vars`: `59` warnings
  - Highest-volume files:
    - `src/ui/views/clients/ClientListContainer.tsx` (`8`)
    - `src/ui/views/clients/[id]/ClientProfileContainer.tsx` (`7`)
    - `src/ui/views/revenue/RevenueClient.tsx` (`7`)
    - `src/scripts/migrate-encryption-keys.ts` (`5`)
    - `src/ui/views/settings/SettingsClient.tsx` (`5`)
  - Notes:
    - These are warning-only findings and should be handled after error removal unless a later task narrows scope with stronger dead-code evidence

### C — React/hooks or runtime-behaviour risk
- `react-hooks/set-state-in-effect`: `7` errors
  - Files:
    - `src/ui/views/clients/[id]/ClientProfileContainer.tsx` (`5`)
    - `src/context/PrivacyContext.tsx` (`1`)
    - `src/ui/views/data/DataManagerClient.tsx` (`1`)
- `react-hooks/purity`: `4` errors
  - Files:
    - `src/ui/views/clients/[id]/ClientProfileContainer.tsx` (`4`)
- `react-hooks/preserve-manual-memoization`: `1` error
  - Files:
    - `src/ui/views/clients/ClientListContainer.tsx` (`1`)

### D — TypeScript/data-contract risk
- `@typescript-eslint/no-explicit-any`: `67` errors
  - Highest-volume files:
    - `src/ui/views/clients/[id]/ClientProfileContainer.tsx` (`16`)
    - `src/app/(dashboard)/clients/actions.ts` (`12`)
    - `src/ui/views/data/DataManagerClient.tsx` (`11`)
    - `src/app/(dashboard)/revenue/actions.ts` (`6`)
    - `src/ui/views/clients/ClientListContainer.tsx` (`5`)
    - `src/ui/views/settings/SettingsClient.tsx` (`5`)
- `@typescript-eslint/ban-ts-comment`: `1` error
  - Files:
    - `src/app/(dashboard)/clients/actions.ts` (`1`)

### E — configuration or lint-scope defect
- None proven by this baseline run

### F — obsolete/dead-file finding requiring separate evidence
- None proven as a separate error group by the current baseline run
- Some `@typescript-eslint/no-unused-vars` warnings may later resolve as dead-code cleanup, but this baseline does not claim that without file-by-file evidence

## 5. Error-producing files
- `src/app/(dashboard)/clients/[id]/page.tsx`
- `src/app/(dashboard)/clients/actions.ts`
- `src/app/(dashboard)/invoices/[id]/InvoicePrintView.tsx`
- `src/app/(dashboard)/invoices/page.tsx`
- `src/app/(dashboard)/queue/page.tsx`
- `src/app/(dashboard)/revenue/actions.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/login/actions.ts`
- `src/context/PrivacyContext.tsx`
- `src/scripts/migrate-encryption-keys.ts`
- `src/ui/views/clients/[id]/ClientProfileContainer.tsx`
- `src/ui/views/clients/ClientListContainer.tsx`
- `src/ui/views/clients/new/NewClientClient.tsx`
- `src/ui/views/data/DataManagerClient.tsx`
- `src/ui/views/revenue/RevenueClient.tsx`
- `src/ui/views/settings/SettingsClient.tsx`

## 6. Top affected files by total findings
1. `src/ui/views/clients/[id]/ClientProfileContainer.tsx` — `32`
2. `src/ui/views/data/DataManagerClient.tsx` — `19`
3. `src/app/(dashboard)/clients/actions.ts` — `16`
4. `src/ui/views/clients/ClientListContainer.tsx` — `14`
5. `src/ui/views/settings/SettingsClient.tsx` — `10`
6. `src/ui/views/revenue/RevenueClient.tsx` — `9`
7. `src/app/(dashboard)/revenue/actions.ts` — `8`
8. `src/scripts/migrate-encryption-keys.ts` — `8`
9. `src/app/(dashboard)/invoices/[id]/InvoicePrintView.tsx` — `5`
10. `src/ui/views/queue/QueueListContainer.tsx` — `4`

## 7. Auto-fixable versus manual
- Auto-fixable:
  - `1` error
  - `0` warnings
- Manual or behavior-sensitive:
  - `86` errors
  - `59` warnings

## 8. Recommended remediation order
1. Category `A`
   - Remove the lone `prefer-const` error in `src/scripts/migrate-encryption-keys.ts`
   - Reason: smallest mechanical change, isolated, and directly auto-fixable
2. Category `B` text-safety corrections
   - Resolve `react/no-unescaped-entities`
   - Reason: small surface area and low runtime risk
3. Category `D` type-contract cleanup
   - Replace `any` usage and remove the `@ts-ignore`-style suppression issue in server actions, route loaders, and large client containers
   - Reason: this is the dominant error class and will sharpen later hook/runtime edits
4. Category `C` hook/runtime corrections
   - Resolve `react-hooks/set-state-in-effect`, `react-hooks/purity`, and `react-hooks/preserve-manual-memoization`
   - Reason: these are behavior-sensitive and should be taken only after the data contracts are clearer
5. Warning cleanup
   - Address `@typescript-eslint/no-unused-vars`
   - Reason: warnings should follow error removal unless separate dead-code evidence justifies a narrower cleanup task

## 9. Explicit non-change statement
- No lint finding was fixed
- No lint finding was suppressed
- No ignore rule was changed
- No application code was changed by this baseline task

## 10. Exit criteria for the future lint-remediation task
- `npm run lint` passes
- Production build still passes
- No application behaviour changes occur without task-specific verification
- Working tree contains only the intended remediation changes
