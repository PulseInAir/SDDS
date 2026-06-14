**SDDS master execution sequence**

**Phase 0 - Lock project truth**

Before touching code:

- Read SDDS_SOURCE.md.
- Resolve conflicts between older instructions and the authoritative source.
- Confirm the approved visual references.
- Confirm the repository, branch, Vercel project and Supabase project.
- Record unresolved owner decisions separately.
- Freeze the scope for the current implementation cycle.

I found one major historical conflict:

- An older instruction said to skip document management.
- The authoritative source dated **14 June 2026** defines Documents as a core SDDS module.

Therefore, **Documents remains in the project** unless you explicitly change the authoritative source.

The same rule applies to navigation, filing workflows, revenue tracking and all future conflicts. The authoritative hierarchy is already defined in the project source.

**Phase 1 - Create a safe baseline**

Before redesigning anything, the coding agent must:

- Confirm the current Git branch.
- Check uncommitted changes.
- identify the latest stable commit.
- Record the deployed Vercel version.
- Record the current Supabase schema and migrations.
- Identify environment-variable dependencies without exposing their values.
- Produce a rollback point.
- Verify that current production data is not dependent on unfinished migrations.
- Confirm that the current application builds before changes.
- Capture screenshots of every existing page.

No redesign begins without a recoverable baseline.

**Phase 2 - Full system audit**

This replaces the earlier limited frontend audit.

The agent must audit six areas.

**A. Repository and architecture**

- routes;
- layouts;
- components;
- shared utilities;
- server actions;
- API routes;
- Supabase clients;
- middleware;
- environment-variable usage;
- migrations;
- duplicated code;
- dead code;
- abandoned Google Drive logic;
- package dependencies.

**B. Current product implementation**

Compare the application against every required SDDS module:

- Dashboard;
- Clients;
- Client profile;
- Filing Queue;
- Documents;
- Invoices & Revenue;
- Refunds;
- Intimations / Notices;
- Follow-up;
- Settings.

For each requirement, classify it as:

- working;
- partially working;
- visually wrong;
- logically wrong;
- missing;
- blocked;
- unsafe.

**C. Data and security**

Verify:

- authentication;
- route protection;
- RLS;
- encryption;
- password reveal behaviour;
- service-role usage;
- document privacy;
- signed URLs;
- filing-history preservation;
- invoice/payment reconciliation;
- destructive deletes;
- backup/export capability.

**D. UI implementation**

Identify:

- page shell;
- sidebar;
- route-active logic;
- header;
- dashboard components;
- typography;
- colours;
- spacing;
- shared cards;
- buttons;
- inputs;
- tables;
- badges;
- dialogs;
- responsive behaviour;
- global CSS side effects.

**E. Performance**

Measure:

- click response;
- route-transition delay;
- duplicate requests;
- Supabase query waterfalls;
- unnecessary client rendering;
- large rerenders;
- page bundle size;
- loading behaviour;
- browser-console errors;
- server errors.

**F. Known historical problems**

Re-test every previously reported issue:

- incorrect sidebar white cut-out;
- multiple or missing active menu states;
- system_settings RLS failure;
- portal-password missing-key error;
- slow clicks;
- missing invoice search;
- missing acknowledgement search;
- incorrect Dashboard metrics;
- overwritten revised returns;
- privacy masking errors;
- shared password-eye state;
- incomplete communication history.

Nothing is assumed fixed merely because an earlier agent said it was fixed. The source explicitly requires evidence-based re-auditing.

**Phase 3 - Produce the implementation map**

Before implementation, the audit must generate these locked documents:

- **Route map**  
   Every route and its purpose.
- **Component map**  
   Which component owns each visible area.
- **Data-contract map**  
   Which database query supplies each component.
- **Schema map**  
   Tables, relationships, important constraints and RLS.
- **Visual mismatch matrix**  
   Current implementation versus target reference.
- **Feature-gap matrix**  
   Required, existing, partial and missing functionality.
- **Risk register**  
   Data, security, performance and migration risks.
- **Test matrix**  
   What must be tested after every relevant change.
- **Implementation sequence**  
   Exact task order and file boundaries.
- **Rollback plan**  
   How each risky change can be reversed.

This prevents later agents from rediscovering the project repeatedly.

**Phase 4 - Stabilise P0 problems**

The UI redesign must not be built over a dangerous foundation.

Any confirmed P0 problem is handled before or alongside the redesign:

- authentication failure;
- incorrect RLS;
- exposed service-role key;
- broken encryption;
- data loss risk;
- public document access;
- destructive filing-history behaviour;
- broken invoice/payment calculations;
- unavailable backup/export;
- severe navigation lag;
- production-blocking errors.

However, the agent may not rewrite the backend merely because the frontend is being redesigned.

Only confirmed defects are fixed.

**Phase 5 - Freeze the visual target**

Before CSS implementation:

- Select one canonical Dashboard target image.
- Record its exact native dimensions.
- Record the baseline browser viewport.
- Identify the sidebar reference.
- Identify the dashboard-body reference.
- Document exact layout regions.
- Document measurable widths, gaps, padding and alignment.
- Record typography hierarchy.
- Record colour tokens.
- Record radii, shadows, icons and interaction states.

The design must combine:

- the approved blue sidebar;
- the spacious route-aware white cut-out;
- the white cut-out visually joining the content canvas;
- the approved Dashboard content composition.

The agent is not allowed to creatively reinterpret it.

**Phase 6 - Build the shared UI foundation**

The order is locked:

- design tokens;
- page grid;
- application background;
- application frame;
- content canvas;
- sidebar structure;
- sidebar route behaviour;
- header structure;
- typography;
- shared cards;
- buttons;
- inputs;
- badges;
- tables;
- dialogs;
- empty states;
- loading states;
- validation states;
- error states;
- responsive rules.

We will **not** redesign colours, fonts and buttons independently before the shell is stable. That was the flawed approach creating repetition.

**Phase 7 - Perfect the application shell**

The shell is completed and locked before individual pages.

It includes:

- outer page background;
- rounded application frame;
- blue sidebar;
- logo and organisation identity;
- route-aware navigation;
- spacious white active cut-out;
- active cut-out connected to the white canvas;
- header;
- assessment-year selector;
- search;
- status/privacy controls where applicable;
- user area;
- content-width rules;
- desktop and collapsed-sidebar behaviour.

The sidebar must be tested through:

- normal clicks;
- direct URL entry;
- browser refresh;
- nested routes;
- back navigation;
- forward navigation;
- mobile collapse.

Only one menu item may be active.

**Phase 8 - Build and perfect the Dashboard**

The Dashboard is the design master for every later page.

Required operational information includes:

- total active clients;
- filed;
- yet to file;
- documents pending;
- ready to file;
- rectification/attention cases;
- refunds pending;
- intimations pending;
- billed revenue;
- received revenue;
- outstanding amount;
- overdue invoices;
- next 30-day work;
- recent activity;
- urgent queue.

Every metric must:

- come from a defined query;
- use real project data;
- show a valid loading state;
- show a valid empty state;
- show a valid error state;
- reconcile with the underlying records;
- open a corresponding filtered view where appropriate.

No fake percentages, invented trends or decorative charts will be added merely to resemble a generic dashboard.

**Phase 9 - Mandatory visual correction loop**

Dashboard completion requires this loop:

Implement

→ run locally

→ capture at exact viewport

→ overlay against target

→ measure differences

→ create mismatch list

→ correct mismatches

→ capture again

→ verify interactions

→ run regression tests

→ approve

→ commit

→ lock

The mismatch list must check:

- shell dimensions;
- sidebar width;
- active-tab shape;
- canvas connection;
- card positions;
- gaps;
- padding;
- typography;
- colour;
- border radius;
- shadows;
- icon size;
- alignment;
- overflow;
- responsive behaviour.

"Looks close" is not approval. The source requires screenshot comparison or equivalent measurable verification.

**Phase 10 - Apply the system page by page**

After the Dashboard is approved, pages are handled in this order:

- Clients list
- Client profile
- Filing Queue
- Documents
- Invoices & Revenue
- Refunds
- Intimations / Notices
- Follow-up
- Settings

Each page reuses the approved system. It does not receive a fresh design language.

**Phase 11 - Module verification**

**Clients**

Verify:

- name, PAN and mobile search;
- assessment-year filtering;
- workflow filtering;
- status indicators;
- pagination;
- privacy masking;
- no plaintext password in list HTML;
- fast profile access.

**Client profile**

Verify one source of truth for:

- identity;
- assessment-year history;
- portal credentials;
- documents;
- filings;
- e-verification;
- intimations;
- notices;
- refunds;
- invoices;
- payments;
- notes;
- communication;
- next action;
- future-year follow-up.

**Filing Queue**

Verify:

- controlled statuses;
- separate Original, Revised, Updated and Rectification records;
- acknowledgement details;
- post-filing verification;
- attention states;
- history preservation.

**Documents**

Verify:

- private Supabase Storage;
- assessment-year classification;
- document type;
- history;
- checklist states;
- authorised downloads;
- short-lived signed URLs;
- deletion controls;
- no permanent public URLs.

**Invoices & Revenue**

Verify:

- invoice format SDDS/ITR/{AY}/{Serial};
- permanent invoice number;
- assessment-year serial reset;
- issue date;
- default due date of issue date + 30 days;
- editable due date;
- partial payments;
- paid, outstanding and overdue amounts;
- printable invoice/PDF;
- invoice search;
- payment reference and mode;
- correct reconciliation.

**Refunds**

Verify:

- expected amount;
- status;
- related filing;
- follow-up date;
- amount received;
- receipt date;
- discrepancy notes.

**Intimations / Notices**

Verify:

- category;
- assessment year;
- issue date;
- response due date;
- status;
- next action;
- documents;
- submission reference;
- closure result.

**Follow-up**

Verify:

- automatic next-year inclusion;
- manual exclusion;
- exclusion reason;
- recoverable excluded clients;
- reactivation;
- upcoming contact/document collection.

**Phase 12 - Security hardening**

Before release:

- verify every RLS policy;
- verify every storage policy;
- verify server/client boundaries;
- verify no service-role leakage;
- verify AES-256-GCM implementation;
- verify the key is 32 bytes or 64 hexadecimal characters;
- verify password reveal is record-specific;
- verify sensitive data is absent from logs;
- verify no secrets appear in the browser bundle;
- verify archived records are recoverable;
- verify destructive actions require deliberate confirmation;
- verify audit events where required.

**Phase 13 - Performance hardening**

Measure and correct:

- route-transition time;
- initial load;
- Supabase query count;
- duplicate requests;
- waterfall fetching;
- unnecessary client components;
- broad state rerenders;
- large lists;
- font loading;
- icon loading;
- dead-click periods;
- skeleton behaviour;
- browser-console errors;
- server errors.

Animations will not be used to disguise slow logic.

**Phase 14 - Responsive and accessibility verification**

Test:

- desktop reference viewport;
- standard laptop;
- tablet;
- mobile;
- keyboard navigation;
- focus visibility;
- form labels;
- colour contrast;
- non-colour status indicators;
- dialog behaviour;
- table overflow;
- sidebar collapse;
- readable touch targets;
- no unwanted horizontal page scroll.

Desktop remains the primary SDDS operating experience.

**Phase 15 - Full regression testing**

Before deployment, test complete workflows:

- Login and logout.
- Create and update a client.
- Search and filter clients.
- Reveal and update one client password.
- Create Original filing.
- Add Revised filing without overwriting Original.
- Change filing status.
- Upload and retrieve a private document.
- Create an invoice.
- Verify the 30-day due date.
- Record a partial payment.
- Complete payment.
- Verify revenue totals.
- Record a refund.
- Record an intimation or notice.
- Add a due date.
- Verify the Dashboard attention queue.
- Complete filing and create next-year follow-up.
- Export business data.
- Verify backup and restoration procedure.
- Test direct URLs, refresh, browser back and browser forward.
- Confirm no data changes occurred from purely visual work.

**Phase 16 - Release process**

The release sequence is:

- All task-level checks pass.
- Production build passes.
- Database backup is created.
- Required migrations are reviewed.
- Migrations are dry-run where possible.
- Vercel preview is deployed.
- Preview smoke test is completed.
- Visual comparison is completed.
- Functional regression is completed.
- Production deployment occurs.
- Production smoke test is completed.
- Logs and browser console are checked.
- Rollback remains available until stability is verified.

**Permanent task protocol**

Every coding-agent task I issue will contain:

- one objective;
- exact scope;
- exact non-goals;
- files to inspect;
- files permitted to change;
- behaviour that must remain untouched;
- data dependencies;
- security constraints;
- visual acceptance criteria;
- functional acceptance criteria;
- commands to run;
- screenshot evidence required;
- Git commit requirement;
- stop conditions.

The coding agent will not be allowed to declare success merely because code compiled.

**Mandatory stop conditions**

We do not move forward when:

- the build fails;
- TypeScript fails;
- lint fails for changed code;
- browser-console errors appear;
- real data is replaced with mock data;
- a security boundary is weakened;
- route behaviour breaks;
- an existing workflow disappears;
- a migration is unsafe;
- the screenshot still has unexplained major differences;
- the agent cannot identify where a displayed number comes from;
- no rollback path exists for a risky change.

**How I will operate from now on**

I will maintain the whole roadmap, but give you **only one executable coding-agent prompt at a time**.

You will not have to remember future tasks.

For every returned result, I will decide:

- accepted;
- rejected;
- correction required;
- rollback required;
- ready for next step.

Open business decisions will be raised only when they genuinely block implementation. I will provide my recommended choice and ask you only for the final owner approval.