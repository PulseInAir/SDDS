# product.md

## Purpose of This File

This file is the highest project-specific source of truth.

The coding agent must follow this file before making product, feature, design, database, authentication, payment, or architecture decisions.

If any other file conflicts with this file, this file wins.

---

## Project Identity

Project Name:

Domain Name:

Business/Brand Name:

Project Type:
- SaaS App
- Business Landing Page

Primary Goal:

One-line Product Description:

---

## Target Users

Primary Audience:

Secondary Audience:

User Location / Market:

User Skill Level:
- Beginner
- Intermediate
- Advanced
- Mixed

Main User Problem:

Main User Desire:

Why will users trust this product/business?

---

## Project Mode Rules

If Project Type is `SaaS App`, the agent may consider:
- authentication
- dashboard
- database
- user accounts
- payment system
- subscription system
- admin panel
- protected routes
- CRUD features
- file storage
- emails or notifications
- billing
- settings page

If Project Type is `Business Landing Page`, the agent must avoid by default:
- login system
- user dashboard
- database
- subscription system
- admin panel
- complex backend
- unnecessary API routes

Only add these if clearly listed in the Required Features section.

---

## Required Features

List only the features that must be built.

1.
2.
3.
4.
5.

---

## Not Required Features

List features the agent must not build unless later instructed.

1.
2.
3.
4.
5.

---

## Pages Needed

List all required pages.

1. Home Page:
2. Pricing Page:
3. About Page:
4. Contact Page:
5. Dashboard Page:
6. Login Page:
7. Signup Page:
8. Terms Page:
9. Privacy Page:
10. Other Pages:

Delete or mark pages as “Not Needed” if they do not apply.

---

## SaaS-Specific Requirements

Use this section only if Project Type is `SaaS App`.

Authentication Required:
- Yes
- No

Database Required:
- Yes
- No

Payment Required:
- Yes
- No

Preferred Payment Provider:
- Razorpay for India-focused products
- Stripe only if international payment is required
- Other:

Subscription Model:
- Free
- Freemium
- One-time payment
- Monthly subscription
- Yearly subscription
- Usage-based
- Not required

User Roles:
1.
2.
3.

Dashboard Features:
1.
2.
3.

Admin Features:
1.
2.
3.

Data to Store:
1.
2.
3.

File Upload Required:
- Yes
- No

Email/Notification Required:
- Yes
- No

---

## Landing Page-Specific Requirements

Use this section only if Project Type is `Business Landing Page`.

Main Call To Action:

Secondary Call To Action:

Lead Capture Required:
- Yes
- No

Contact Form Required:
- Yes
- No

WhatsApp Button Required:
- Yes
- No

Phone Number Display Required:
- Yes
- No

Location/Map Required:
- Yes
- No

Required Sections:
1. Hero
2. Benefits
3. Services
4. About
5. Testimonials
6. FAQ
7. Contact
8. Footer
9. Other:

Trust Signals:
1.
2.
3.

---

## Content Requirements

Tone of Voice:
- Professional
- Friendly
- Premium
- Simple
- Bold
- Trustworthy
- Other:

Writing Style:

Words/Phrases to Use:

Words/Phrases to Avoid:

Brand Message:

Primary Headline Idea:

Offer Details:

Guarantee or Promise:

---

## Design Direction

Preferred Style:
- Clean
- Premium
- Minimal
- Corporate
- Modern
- Bold
- Elegant
- Playful
- Other:

Color Preference:

Font Preference:

Reference Websites:

Designs to Avoid:

Important Visual Elements:

---

## Technical Preferences

Preferred Framework:
- Next.js

Preferred Language:
- TypeScript

Styling:
- Tailwind CSS

Deployment Target:
- Must be confirmed at project start by asking the user:
  - Vercel
  - Netlify

Database Preference:
- Supabase
- Firebase
- None
- Other:

Authentication Preference:
- Supabase Auth
- Firebase Auth
- NextAuth
- None
- Other:

Payment Preference:
- Razorpay
- Stripe
- None
- Other:

---

## SEO Requirements

Primary Keyword:

Secondary Keywords:
1.
2.
3.

Location Keywords:

Meta Title:

Meta Description:

Open Graph Image Required:
- Yes
- No

Blog Required:
- Yes
- No

---

## Conversion Requirements

Main Conversion Goal:
- Signup
- Payment
- Lead form
- WhatsApp click
- Phone call
- Demo booking
- Download
- Other:

Conversion Path:

Offer:

Urgency/Scarcity:

Trust Builders:

---

## Version 1 Scope

The first build must include only these items:

1.
2.
3.
4.
5.

Do not build anything outside Version 1 unless instructed.

---

## Future Scope

These features are planned later but must not be built now:

1.
2.
3.
4.
5.

---

## Final Product Rule

The coding agent must build exactly what this file describes.

The agent must not add extra SaaS features, landing page sections, databases, dashboards, payment systems, or authentication flows unless clearly required here.