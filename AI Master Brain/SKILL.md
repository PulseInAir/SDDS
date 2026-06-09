# SKILL.md

## Purpose of This File

This file defines how the coding agent must think, plan, execute, review, and improve the project.

The agent must use this file after reading `product.md`.

---

## Core Working Philosophy

Understand first.

Plan second.

Build third.

Review fourth.

Commit and push fifth.

Do not jump directly into coding.

Do not assume missing requirements.

Do not overbuild.

Do not use unnecessary packages.

Do not create complex systems for simple products.

---

## Mandatory Thinking Order

The agent must follow this order:

1. Read `product.md`.
2. Identify the Project Type.
3. Read this file.
4. Read `architecture.md`.
5. Read `design.md`.
6. Confirm project understanding.
7. Ask only necessary missing questions.
8. Create the build plan.
9. Start implementation.
10. Commit and push completed iterations.

---

## Project Type Detection

If `product.md` says `Project Type: SaaS App`, the agent must think in product-system mode.

If `product.md` says `Project Type: Business Landing Page`, the agent must think in conversion-page mode.

Never mix both modes unless `product.md` clearly requires it.

---

## SaaS App Thinking Mode

For SaaS apps, the agent must think about:

- user journey
- authentication
- protected routes
- dashboard structure
- database structure
- user data ownership
- payment flow
- admin needs
- onboarding flow
- empty states
- loading states
- error states
- subscription limits
- security
- deployment readiness

Only include these if required by `product.md`.

---

## Business Landing Page Thinking Mode

For business landing pages, the agent must think about:

- first impression
- clear headline
- clear offer
- trust
- benefits
- services
- call to action
- contact path
- mobile layout
- fast loading
- local SEO if needed
- lead capture
- conversion flow

Do not add app-like features unless required by `product.md`.

---

## Planning Rule

Before coding, the agent must produce:

1. Project type
2. Product summary
3. Required features
4. Not-required features
5. Page list
6. Technical plan
7. Design plan
8. Build sequence
9. Testing/checking plan
10. GitHub push plan

---

## Build Sequence Rule

Build in this order unless `product.md` requires otherwise:

1. Project setup
2. Folder structure
3. Global layout
4. Design system foundation
5. Core pages
6. Core components
7. Feature logic
8. Forms/API/database if required
9. Payment/auth if required
10. SEO metadata
11. Responsive polish
12. Error checking
13. Final deployment preparation

---

## Simplicity Rule

Use the simplest stable solution that satisfies `product.md`.

Do not add complexity for future possibilities.

Do not create unused abstractions.

Do not add libraries unless they solve a real requirement.

Do not build admin panels, dashboards, or databases unless clearly required.

---

## Quality Rule

Every implementation must be:

- readable
- maintainable
- modular
- responsive
- accessible
- secure
- deployment-ready
- easy to modify later

---

## Code Style Rule

Use:

- clear file names
- clear component names
- small reusable components
- typed functions
- TypeScript strict thinking
- readable folder structure
- simple comments where helpful

Avoid:

- large messy files
- duplicated logic
- hidden magic
- hardcoded secrets
- unused imports
- dead code
- random package installation

---

## UI Review Rule

Before finalizing any UI, the agent must check:

- Is the layout mobile-friendly?
- Is the CTA clear?
- Is the spacing consistent?
- Is the visual hierarchy clear?
- Is the design professional?
- Does it avoid default template appearance?
- Does it match `design.md`?
- Does it serve the product goal in `product.md`?

---

## Error Handling Rule

The agent must handle:

- missing data
- loading state
- empty state
- form validation
- failed requests
- unauthorized access if auth exists
- payment failure if payment exists
- database errors if database exists

Only apply relevant handling based on the project scope.

---

## GitHub Iteration Rule

Every meaningful completed iteration must be committed and pushed to the GitHub repository confirmed at the start.

Before pushing:

1. Check changed files.
2. Make sure secrets are not committed.
3. Run available checks.
4. Use a clear commit message.
5. Push to the repo.
6. Report the summary.

---

## Deployment Thinking Rule

Every project must remain ready for the selected deployment platform:

- Vercel
- Netlify

The agent must not make decisions that break deployment compatibility.

---

## Final Review Rule

Before declaring work complete, the agent must review:

1. Does it match `product.md`?
2. Does it follow `architecture.md`?
3. Does it follow `design.md`?
4. Is the project type respected?
5. Are unnecessary features avoided?
6. Is the code clean?
7. Is it responsive?
8. Is it deployment-ready?
9. Has the iteration been pushed to GitHub?