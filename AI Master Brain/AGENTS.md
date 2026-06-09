# AGENTS.md

## Mandatory First Step

Before doing any coding, editing, deleting, creating files, installing packages, or making architecture decisions, you MUST complete this startup check.

First ask the user for:

1. The GitHub repository address for this project.
2. The deployment target:

   * Vercel, or
   * Netlify

Do not start implementation until these two answers are available.

## Mandatory Brain Reading Rule

After the GitHub repository address and deployment target are known, read the project brain files.

Read these files in this exact order:

1. `AI Master Brain/product.md`
2. `AI Master Brain/SKILL.md`
3. `AI Master Brain/architecture.md`
4. `AI Master Brain/design.md`

## Source of Truth Rule

`AI Master Brain/product.md` is the highest project-specific source of truth.

If there is any conflict between assumptions and `product.md`, follow `product.md`.

If there is any conflict between SaaS defaults and landing-page needs, follow the declared `Project Type` inside `product.md`.

## Mandatory Response Before Work

Before starting implementation, reply with this checklist:

1. Confirm the GitHub repository address.
2. Confirm the selected deployment target: Vercel or Netlify.
3. Confirm that you have read all four brain files.
4. State the project type:

   * SaaS App, or
   * Business Landing Page
5. Summarize the product in 5 lines.
6. List the required features.
7. List the features that are NOT required.
8. List any missing questions.
9. Give a step-by-step build plan.
10. Explain the first implementation step.

Do not start coding before this checklist is completed.

## GitHub Iteration Rule

Every meaningful completed iteration MUST be committed and pushed to the connected GitHub repository.

An iteration means any completed unit of work, such as:

* project setup
* layout creation
* homepage creation
* authentication setup
* database setup
* dashboard setup
* payment setup
* form setup
* API route setup
* deployment configuration
* bug fix
* UI improvement
* feature completion

After each completed iteration:

1. Run the relevant checks if available.
2. Check the changed files.
3. Create a clear Git commit message.
4. Push the commit to GitHub.
5. Report the commit summary to the user.

Do not leave completed work uncommitted.

## Git Safety Rule

Never commit secrets.

Do not commit:

* `.env`
* `.env.local`
* API keys
* service role keys
* private tokens
* database passwords
* payment gateway secrets
* encryption keys

If environment variables are needed, create or update an example file such as:

`env.example`

and tell the user what real values they need to add locally or inside the deployment platform.

## Deployment Readiness Rule

Every project must be ready for either Vercel or Netlify.

The selected deployment target must be confirmed at the beginning.

If the user chooses Vercel, prepare the project for Vercel deployment.

If the user chooses Netlify, prepare the project for Netlify deployment.

Do not assume one deployment platform without confirmation.

## Anti-Assumption Rule

Do not assume:

* authentication is needed
* database is needed
* payment is needed
* dashboard is needed
* admin panel is needed
* subscription is needed
* file upload is needed
* complex backend is needed

Only add these if `AI Master Brain/product.md` clearly requires them.

## Project Type Rule

If `product.md` says `Project Type: SaaS App`, think in SaaS mode.

If `product.md` says `Project Type: Business Landing Page`, think in landing-page mode.

Never mix both unless `product.md` clearly says so.

## Design Rule

Before creating UI, read `AI Master Brain/design.md`.

Do not create generic default-looking pages.

Avoid:

* default starter template look
* weak spacing
* poor mobile layout
* unclear CTA
* random colors
* inconsistent sections
* poor visual hierarchy
* weak conversion flow

## Architecture Rule

Before creating technical structure, read `AI Master Brain/architecture.md`.

Use the architecture rules only if they fit the project type written in `product.md`.

If `product.md` gives a different technical direction, follow `product.md`.

## Final Rule

The correct order is always:

1. Ask for GitHub repository address.
2. Ask whether to use Vercel or Netlify.
3. Read all project brain files.
4. Confirm understanding.
5. Prepare the build plan.
6. Implement the project in iterations.
7. Commit and push every completed iteration to GitHub.
8. Keep the project deployment-ready for the selected platform.
