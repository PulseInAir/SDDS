# design.md

## Purpose of This File

This file defines the visual experience, frontend quality, UX polish, conversion flow, interaction design, retention quality, and anti-generic design rules for this project.

This is not only a styling file.

This file is the frontend excellence rulebook.

The coding agent must read this file before creating or editing any user-facing screen, component, page, dashboard, form, pricing section, landing page, or public UI.

If this file conflicts with `product.md`, follow `product.md`.

The visible frontend is one of the biggest reasons a product feels trustworthy, premium, useful, memorable, and shareable.

The agent must treat frontend design as a core product feature, not decoration.

---

## Core Frontend Philosophy

The design must feel:

* premium
* intentional
* memorable
* conversion-focused
* trustworthy
* fast
* polished
* mobile-first
* emotionally clear
* different from generic AI-generated websites

The design must not feel:

* like a default Next.js starter
* like a copied SaaS template
* like a generic AI vibe-coded layout
* like a random Tailwind component dump
* like every section was generated separately
* like a flat, boring, lifeless website
* like a website with no brand personality

Every project must have a distinct visual identity.

Every screen must make the user feel that the product is serious, useful, and worth exploring.

---

## Mandatory Design Thinking Before Coding

Before writing frontend code, the agent must first define the following:

1. What is the product type?
2. Who is the target user?
3. What emotion should the first screen create?
4. What is the main conversion goal?
5. What makes this product visually different from generic websites?
6. What is the visual theme?
7. What is the hero concept?
8. What is the primary CTA?
9. What trust signals must be visible?
10. What should the user remember after 5 seconds?

The agent must not start UI coding until these answers are clear from `product.md` or reasonably inferred and stated.

---

## The 5-Second First Impression Rule

The first screen must answer these questions within 5 seconds:

1. What is this?
2. Who is it for?
3. Why should I care?
4. What can I do next?
5. Why should I trust it?

The hero section must not be vague.

Avoid generic hero headlines such as:

* Grow your business with us
* The best solution for your needs
* Transform your workflow
* Powerful tools for everyone
* Modern platform for success

Prefer specific, benefit-driven headlines tied to the product.

The hero must include:

* clear headline
* specific subheadline
* strong CTA
* visual proof or product preview
* trust signal
* clean layout
* memorable visual hook

---

## Anti-Generic Website Rule

The agent must actively avoid generic AI-coded design patterns.

Avoid:

* same gradient blob background on every project
* same blue-purple SaaS palette everywhere
* same centered hero with two buttons and cards
* same glassmorphism cards without reason
* same fake dashboard image
* same meaningless icons
* same stock SaaS copy
* same rounded cards everywhere
* same plain white sections stacked vertically
* same overused “Features / Pricing / FAQ” layout without personality

Every project must include at least one unique frontend idea, such as:

* custom hero visual
* domain-specific illustration
* interactive calculator preview
* mini product demo
* live sample result
* animated workflow
* unique card layout
* branded pattern
* distinctive section transition
* industry-specific visual metaphor
* dashboard mockup based on real product logic
* scroll-based storytelling
* before/after comparison
* visualized outcome
* sticky conversion panel
* memorable CTA block

Do not make the frontend unique by adding clutter.

Make it unique through relevance, layout, interaction, polish, and product-specific visual storytelling.

---

## Project Type Design Rule

If Project Type is `SaaS App`, design for:

* product clarity
* user trust
* dashboard usability
* smooth onboarding
* clean navigation
* useful empty states
* loading states
* error states
* success states
* upgrade prompts if needed
* pricing clarity if needed
* data readability
* repeated usage
* retention
* speed
* professional polish

If Project Type is `Business Landing Page`, design for:

* first impression
* credibility
* lead generation
* emotional trust
* service clarity
* strong CTA
* benefit-led storytelling
* local/business trust signals
* mobile conversion
* contact friction reduction
* fast decision making
* memorable brand feel

Never mix SaaS app design and landing page design unless `product.md` clearly requires it.

---

## Visual Identity Rule

Every project must have a clear visual identity.

Before designing, define:

1. Brand mood
2. Color direction
3. Typography personality
4. Shape language
5. Button style
6. Card style
7. Icon style
8. Background system
9. Motion style
10. Image/illustration style

The visual identity must match the product audience.

Examples:

For finance products:

* trustworthy
* sharp
* calm
* data-focused
* premium
* low-noise

For local businesses:

* friendly
* human
* trustworthy
* easy to contact
* service-first

For B2B SaaS:

* clean
* confident
* structured
* high-clarity
* proof-driven

For creative products:

* expressive
* bold
* visual
* memorable
* playful but controlled

---

## Design System Rule

The agent must create a consistent design system.

The design system must define:

* colors
* typography
* spacing
* containers
* border radius
* shadows
* buttons
* cards
* forms
* badges
* alerts
* navigation
* section spacing
* layout widths
* responsive behavior
* animation behavior

Do not style each component randomly.

Do not create inconsistent button sizes, card styles, font sizes, or spacing.

Use design tokens or consistent Tailwind utility patterns where possible.

---

## Color Rule

Use color intentionally.

Each project should have:

* primary brand color
* secondary color
* background color
* surface color
* border color
* text color
* muted text color
* success color
* warning color
* error color
* CTA color

Do not use too many colors.

Do not use random gradients.

Do not use low-contrast text.

Do not use a bright CTA color that clashes with the rest of the page.

The CTA must stand out clearly.

The background must support readability.

Color must guide attention, not decorate randomly.

---

## Typography Rule

Typography must create strong hierarchy.

Every page must have:

* strong H1
* clear H2 sections
* readable body text
* small text that is still legible
* consistent line height
* consistent font weight
* clear label text
* scannable content blocks

Avoid:

* tiny text
* weak headings
* too many font weights
* too many font sizes
* long paragraphs
* poor line height
* low-contrast text

The typography must make the product feel polished even before the user reads deeply.

---

## Layout Rule

Every page must feel intentionally composed.

Use:

* clear grid
* strong alignment
* consistent container width
* generous whitespace
* controlled section spacing
* visual grouping
* hierarchy by size and contrast
* section rhythm
* clear reading path

Avoid:

* crowded sections
* random alignment
* uneven spacing
* too many columns on mobile
* weak section separation
* walls of text
* repeated identical sections

Each section must have a job.

If a section does not help clarity, trust, conversion, or product understanding, remove it.

---

## Visual Hierarchy Rule

The user’s eye must always know where to go next.

Use hierarchy through:

* size
* weight
* color
* contrast
* proximity
* spacing
* grouping
* visual direction
* CTA placement
* image placement
* card priority

The most important message and action must be visually dominant.

The page must not make all elements look equally important.

---

## Hero Section Rule

The hero is the most important section.

For every hero, include:

1. Specific headline
2. Benefit-driven subheadline
3. Primary CTA
4. Secondary CTA only if useful
5. Visual proof
6. Trust signal
7. Product/category clarity
8. Mobile-optimized layout

The hero visual must not be generic.

Good hero visual examples:

* actual tool preview
* dashboard mockup
* result preview
* calculator preview
* form-to-result flow
* before/after comparison
* workflow diagram
* industry-specific scene
* interactive sample
* mini demo card
* animated process
* customer outcome visual

Bad hero visual examples:

* random abstract blob
* meaningless 3D object
* stock image with no relevance
* fake dashboard with fake numbers
* generic laptop mockup
* random illustration unrelated to product

---

## CTA Rule

Every important page must have a clear CTA.

CTA text must be action-focused and specific.

Avoid weak CTA text:

* Submit
* Click Here
* Learn More
* Read More
* Send

Prefer stronger CTA text:

* Get Started
* Start Free
* Check Eligibility
* Calculate Now
* Book a Call
* Get Quote
* Contact Us
* View Pricing
* Try the Tool
* Download Report
* Talk to an Expert

CTA placement must be intentional.

For landing pages, CTA should appear:

* in the hero
* after key benefits
* after trust/proof
* near pricing or offer
* in final section
* sticky on mobile if useful

For SaaS apps, CTA should appear:

* during onboarding
* in empty states
* after successful actions
* near upgrade limits
* inside dashboard where action is natural

Do not overload the page with too many competing CTAs.

---

## Trust Design Rule

The design must build trust quickly.

Use relevant trust signals such as:

* testimonials
* user count
* client logos
* ratings
* certifications
* security notes
* privacy notes
* transparent pricing
* real screenshots
* case studies
* before/after results
* founder/business identity
* contact details
* address if relevant
* clear refund/cancellation info if relevant
* clear data handling notes if relevant

Trust signals must be visually placed near decision points.

Do not hide trust at the bottom only.

Do not use fake testimonials or fake logos.

---

## Conversion Flow Rule

The page must guide the user from attention to action.

For landing pages, follow this flow when suitable:

1. Attention
2. Problem recognition
3. Promise
4. Proof
5. Benefits
6. How it works
7. Offer
8. Objection handling
9. CTA
10. Contact or signup

For SaaS apps, follow this flow when suitable:

1. Understand value
2. Try or preview
3. Sign up
4. Complete onboarding
5. Reach first useful result
6. Save/share/export
7. Return later
8. Upgrade if needed

The design must reduce friction at every step.

---

## Retention Design Rule

The frontend must encourage users to stay, explore, and return.

For tools and SaaS apps, include where relevant:

* fast first result
* visible progress
* saved work
* recent activity
* clear next action
* helpful empty states
* microcopy guidance
* export/share option
* result explanation
* comparison view
* personalized dashboard
* useful default data
* onboarding hints
* success feedback
* clean re-entry path

A useful product with poor interface retention will fail.

The UI must make repeated use easy.

---

## Interaction Design Rule

Interactive elements must feel responsive and alive.

Use interaction polish such as:

* hover states
* pressed states
* focus states
* loading states
* skeleton states
* success states
* smooth transitions
* button feedback
* form validation feedback
* subtle card hover
* active navigation state
* step progress indication

Do not overuse animations.

Every interaction must support clarity.

---

## Motion Rule

Motion must be subtle, useful, and premium.

Use motion for:

* revealing sections
* confirming actions
* showing loading
* guiding attention
* explaining transitions
* making the interface feel responsive

Avoid:

* excessive bouncing
* slow animations
* random movement
* distracting loops
* animations that block usage
* motion that hurts performance

Motion should make the product feel polished, not childish.

Respect reduced-motion preferences where possible.

---

## Microcopy Rule

Small text must help users act with confidence.

Use microcopy for:

* form hints
* empty states
* error messages
* success messages
* payment reassurance
* privacy reassurance
* dashboard guidance
* onboarding help
* CTA support text

Bad microcopy:

* Error occurred
* Invalid input
* Something went wrong
* Submit

Better microcopy:

* Please enter a valid email address.
* We could not save this yet. Try again in a few seconds.
* Your report is ready to download.
* No clients added yet. Add your first client to begin.

Microcopy must sound human, clear, and useful.

---

## Mobile-First Rule

Mobile design is mandatory.

The agent must design mobile carefully, not as an afterthought.

Check every screen for:

* readable font size
* tappable buttons
* no horizontal overflow
* simple navigation
* stacked sections
* short paragraphs
* visible CTA
* usable forms
* thumb-friendly spacing
* fast loading
* sticky CTA if useful
* accessible tap targets
* clean hero section
* no tiny dashboard tables

If a dashboard has tables, create a mobile-friendly card version where needed.

---

## Performance Design Rule

Beautiful design must still be fast.

The frontend must avoid:

* oversized images
* unoptimized video
* unnecessary animation libraries
* heavy icon libraries
* unused UI packages
* large background assets
* excessive client-side JavaScript
* slow-loading third-party scripts

Use:

* optimized images
* lazy loading where useful
* lightweight components
* server-rendered content where possible
* compressed assets
* minimal client-side code
* simple animation methods

A slow beautiful site is still a bad product.

---

## Accessibility Rule

The UI must be accessible by default.

Follow these rules:

* text must have strong contrast
* important buttons must be keyboard reachable
* focus states must be visible
* form fields must have labels or accessible names
* icons must not be the only way to understand action
* images must have useful alt text when meaningful
* decorative images should not distract screen readers
* tap targets must be large enough
* headings must follow logical order
* errors must be understandable
* color alone must not communicate important information

Accessibility is part of professional design.

---

## Form Design Rule

Forms must be short, clear, and confidence-building.

Every form must have:

* clear field labels
* correct input types
* helpful placeholder only when useful
* validation
* error state
* success state
* loading state
* privacy reassurance if needed
* minimal required fields
* clear submit button

Do not ask unnecessary questions.

If asking for phone number, payment info, personal data, or business details, explain why it is needed.

For landing pages, forms should reduce friction.

For SaaS apps, forms should save progress where useful.

---

## Dashboard Design Rule

For SaaS dashboards, design must support daily usage.

Dashboard UI must include where relevant:

* clear sidebar or top nav
* page title
* key metrics
* primary action
* recent activity
* empty state
* quick actions
* filters/search
* readable tables or cards
* status badges
* loading skeletons
* error messages
* success confirmation

Dashboards must not feel like admin templates.

They must feel product-specific.

Use domain-specific labels, visuals, and workflows.

---

## Data Visualization Rule

If the product includes numbers, reports, finance, analytics, or calculations, present data clearly.

Use:

* cards for key numbers
* charts only when helpful
* clear labels
* comparison states
* trend indicators
* color with meaning
* explanations beside complex data
* export/download if required
* mobile-friendly data cards

Avoid:

* meaningless charts
* confusing colors
* tiny labels
* dashboard clutter
* numbers without explanation

Data must help users decide.

---

## Pricing Design Rule

If pricing exists, make it clear and trustworthy.

Pricing UI must show:

* plan name
* price
* billing period
* target user
* included features
* limits
* CTA
* recommended plan if useful
* FAQs or reassurance
* cancellation/refund note if relevant

Avoid:

* hidden charges
* confusing feature lists
* too many plans
* weak CTA
* unclear paid/free difference

For India-focused products, pricing should feel locally understandable.

---

## Contact and Lead Design Rule

For business landing pages, contact must be easy.

Include where relevant:

* phone number
* WhatsApp button
* email
* contact form
* location
* business hours
* map
* service area
* response time promise

The user should never struggle to find how to contact the business.

On mobile, contact actions should be especially easy.

---

## Section Design Rule

Each section must have:

* clear section purpose
* strong heading
* short supporting copy
* visual hierarchy
* enough spacing
* responsive layout
* clear relation to conversion goal

Do not create filler sections.

Do not create sections just because templates usually have them.

Every section must either:

* explain value
* build trust
* reduce doubt
* show proof
* guide action
* improve understanding

---

## Image and Visual Asset Rule

Images must be relevant and high-quality.

Use visuals that explain the product or business.

Prefer:

* product screenshots
* UI mockups
* real business images
* relevant illustrations
* customer outcome visuals
* workflow graphics
* industry-specific icons
* branded patterns

Avoid:

* generic stock people
* random abstract shapes
* unrelated 3D images
* low-quality images
* overused startup illustrations
* fake dashboard screenshots

Images must improve understanding or trust.

---

## Icon Rule

Icons must be consistent.

Use one icon style only.

Icons must support meaning.

Do not use icons as decoration only.

Do not mix filled, outline, 3D, emoji, and line icons randomly.

Every icon should make the section easier to scan.

---

## Navigation Rule

Navigation must be simple and useful.

For landing pages:

* keep navigation short
* highlight main CTA
* avoid too many links
* use anchor links if useful
* make contact easy

For SaaS apps:

* separate public navigation from dashboard navigation
* show active page
* keep dashboard nav predictable
* group related items
* avoid deep confusion

Mobile navigation must be clean and reliable.

---

## Footer Rule

Footer must feel complete but not bloated.

Include only relevant items:

* brand name
* short value statement
* important links
* contact details if needed
* social links if needed
* legal links
* copyright
* newsletter only if useful

Do not create a huge footer with meaningless links.

---

## Empty State Rule

Empty states must guide the user.

Bad empty state:

* No data found

Good empty state:

* No reports yet. Create your first report to see results here.

Every empty state should include:

* what happened
* why it is empty
* what to do next
* CTA if useful

---

## Loading State Rule

Loading must feel smooth.

Use:

* skeleton loaders
* progress indicators
* disabled button state
* helpful loading text when needed

Avoid:

* blank screens
* layout shifts
* endless spinners
* buttons that can be clicked repeatedly

---

## Error State Rule

Errors must be understandable and helpful.

Every error should explain:

* what went wrong
* what the user can do
* whether retry is possible

Avoid technical error messages in user-facing UI.

---

## Success State Rule

Success states must create confidence.

Use:

* confirmation message
* next action
* visual feedback
* saved/downloaded/shared indication
* clear path forward

A successful user action should never feel invisible.

---

## SaaS Onboarding Rule

If SaaS onboarding is required, it must help users reach value quickly.

Good onboarding:

* asks only necessary questions
* shows progress
* explains benefits
* lets users skip when possible
* leads to first useful result
* avoids long boring setup

The user should understand the product before being forced through complexity.

---

## Landing Page Storytelling Rule

A landing page must tell a clear story.

Recommended structure:

1. Hero: what it is and why it matters
2. Problem: what the user is struggling with
3. Solution: how this product/business helps
4. Benefits: what improves for the user
5. Proof: why to trust it
6. Process: how it works
7. Offer: what the user gets
8. FAQ: remove doubt
9. Final CTA: make action easy

Do not use this structure blindly.

Adapt it to `product.md`.

---

## Emotional Design Rule

The design must create the right feeling.

Examples:

For tax/finance tools:

* calm
* accurate
* secure
* professional
* reliable

For business service pages:

* warm
* trustworthy
* clear
* approachable

For productivity SaaS:

* focused
* fast
* organized
* empowering

For premium brands:

* elegant
* spacious
* refined
* confident

The UI must support the emotion users need before taking action.

---

## Brand Memory Rule

The user should remember at least one visual element.

Create a memorable design signature, such as:

* distinctive hero layout
* unique illustration style
* custom background pattern
* product-specific visual card
* branded CTA section
* unique dashboard summary style
* recognizable section divider
* custom data/result preview
* distinct color accent
* memorable icon treatment

Do not make the brand memory gimmicky.

Make it relevant.

---

## Local Market Rule

If the project targets India or a local business audience, design must consider:

* mobile-first usage
* WhatsApp as a contact path if needed
* simple language
* trust and legitimacy
* local payment expectations
* visible phone/contact details
* clear pricing in INR if pricing exists
* low-friction lead capture
* fast loading on average mobile networks

---

## Premium Polish Checklist

Before completing any frontend iteration, check:

1. Does the first screen feel impressive?
2. Is the product immediately understandable?
3. Is the CTA visually strong?
4. Is the design different from generic AI websites?
5. Is spacing consistent?
6. Is typography strong?
7. Is mobile design clean?
8. Are interactions polished?
9. Are loading/error/success states handled?
10. Is the design fast?
11. Is it accessible?
12. Is the page conversion-focused?
13. Does it match the product audience?
14. Does it create trust?
15. Would a user want to continue exploring?

If the answer to any critical question is no, improve the design before moving on.

---

## Anti-Boring Final Review

Before final delivery, the agent must ask:

1. Does this look like a real brand or just a generated page?
2. Is there a unique visual idea?
3. Is the hero memorable?
4. Is the design tailored to the product?
5. Are sections visually varied but consistent?
6. Is the CTA obvious?
7. Is the page easy to scan?
8. Is it beautiful without being cluttered?
9. Is the mobile experience strong?
10. Would this page increase user trust?

If the design feels generic, redesign it.

Do not ship boring frontend.

---

## Final Design Rule

The frontend is not decoration.

The frontend is the product’s first impression, trust builder, conversion engine, and retention layer.

The coding agent must give special attention to frontend quality in every project.

Every project must look custom-made, not AI-template-made.

Every visible screen must feel polished enough that a real customer would trust it, remember it, and want to use it again.
