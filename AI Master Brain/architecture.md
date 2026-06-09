# architecture.md

## Purpose of This File

This file defines the technical architecture rules for the project.

The agent must use this file only after reading `product.md` and identifying the Project Type.

If this file conflicts with `product.md`, follow `product.md`.

---

## Default Technical Stack

Use these defaults unless `product.md` says otherwise:

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Vercel or Netlify, confirmed at project start
- Database: Supabase only if needed
- Authentication: Supabase Auth only if needed
- Payment: Razorpay for India-focused SaaS products
- Payment: Stripe only if international payment is required

---

## Project Type Architecture Rule

If Project Type is `SaaS App`, architecture may include:

- app routes
- auth routes
- dashboard routes
- protected pages
- database layer
- API routes
- payment routes
- admin area
- user settings
- storage
- email/notification system

Only include what `product.md` requires.

If Project Type is `Business Landing Page`, architecture should stay simple:

- public pages
- reusable sections
- contact form if needed
- lead capture if needed
- SEO metadata
- static or server-rendered content
- no auth by default
- no dashboard by default
- no database by default
- no payment by default

---

## Folder Structure Rule

Use a clean folder structure.

Recommended structure:

- `src/app`
- `src/components`
- `src/components/ui`
- `src/components/sections`
- `src/lib`
- `src/utils`
- `src/types`
- `src/data`
- `src/styles`

For SaaS apps, add only if needed:

- `src/app/dashboard`
- `src/app/auth`
- `src/app/admin`
- `src/app/api`
- `src/lib/supabase`
- `src/lib/payments`
- `src/lib/auth`
- `src/lib/db`

For landing pages, prefer:

- `src/components/sections`
- `src/data`
- `src/lib`
- `src/app/contact`
- `src/app/privacy`
- `src/app/terms`

---

## Routing Rule

Use simple, clear routes.

Common landing page routes:

- `/`
- `/about`
- `/services`
- `/contact`
- `/privacy`
- `/terms`

Common SaaS routes if required:

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/settings`
- `/pricing`
- `/billing`
- `/admin`

Do not create routes not required by `product.md`.

---

## Component Rule

Components must be:

- small
- reusable
- clearly named
- easy to move
- easy to edit
- responsive

Use section components for landing pages.

Use layout and feature components for SaaS apps.

Avoid putting all UI into one large file.

---

## Data Rule

Use static data files when the content does not need a database.

Use a database only when the project requires:

- user accounts
- saved data
- dashboard records
- payments
- client records
- admin management
- uploads
- dynamic content

Do not add a database for a simple landing page unless required.

---

## Database Rule

If Supabase is used:

- keep Supabase client setup separate
- never expose service role keys on the client
- use environment variables
- use row-level security where needed
- create clear table names
- create typed data access helpers
- keep database queries out of UI components where possible

---

## Authentication Rule

Add authentication only if `product.md` requires it.

If authentication is required:

- protect private routes
- create login page
- create signup page if needed
- create logout flow
- handle loading state
- handle unauthenticated state
- redirect users properly
- do not expose protected data

---

## Payment Rule

Add payment only if `product.md` requires it.

For India-focused products, use Razorpay by default.

For international products, use Stripe only if required.

Payment logic must:

- keep secret keys server-side
- verify payment server-side
- handle success state
- handle failure state
- avoid exposing private payment credentials
- store payment status only if database is required

---

## API Rule

Create API routes only when needed.

API routes must:

- validate input
- handle errors
- avoid exposing secrets
- return clear responses
- separate business logic from route handlers where useful

Do not create API routes for static content.

---

## Environment Variable Rule

Never hardcode secrets.

Never commit real `.env` files.

Use an example file such as:

- `.env.example`
- `env.example`

Include placeholder values only.

Required environment variables must be documented clearly.

---

## Deployment Rule

At the start of the project, the agent must ask the user to choose:

- Vercel
- Netlify

The project must remain compatible with the selected platform.

If Vercel is selected:

- avoid Netlify-specific config unless needed
- ensure Next.js deployment works on Vercel

If Netlify is selected:

- add Netlify config only if needed
- ensure Next.js deployment works on Netlify

---

## SEO Architecture Rule

Every public page should support:

- title
- description
- canonical path if needed
- Open Graph metadata if needed
- clean semantic structure

For landing pages, SEO is mandatory.

For SaaS dashboards, SEO is usually not needed for protected pages.

---

## Security Rule

The agent must protect:

- API keys
- database credentials
- payment secrets
- service role keys
- encryption keys
- user data
- uploaded files
- private routes

Never commit secrets.

Never expose server-only keys to the browser.

---

## Testing and Checking Rule

Before completing an iteration, run available checks such as:

- lint
- type check
- build
- manual page review

If a check is unavailable, mention that it is unavailable.

Fix clear errors before pushing.

---

## Git Rule

Every completed iteration must be committed and pushed.

Commit messages must be clear.

Examples:

- `chore: initialize project structure`
- `feat: build landing page hero section`
- `feat: add dashboard layout`
- `fix: resolve mobile navigation issue`
- `style: polish homepage sections`
- `docs: update environment example`

---

## Architecture Review Rule

Before finalizing architecture, confirm:

1. Does this match the Project Type?
2. Is the structure simple enough?
3. Are unnecessary systems avoided?
4. Are secrets protected?
5. Is deployment supported?
6. Is GitHub push completed?