# Product Name

Single Digit Data Solutions (SDDS)

---

# One-Line Description

A private ITR Practice Management System that helps Single Digit Data Solutions manage clients, track income tax filings, generate invoices, monitor refunds and intimations, and automatically follow up with clients every assessment year.

---

# Target Audience

## Primary Users

* Owner of Single Digit Data Solutions

## Secondary Users

* Future staff members (if added later)

## Who Should NOT Use This Product

* General public
* Other tax consultants
* Chartered Accountancy firms needing multi-user enterprise features
* CSC operators requiring multiple government service modules

---

# Problem Statement

Managing ITR clients manually becomes difficult as the client base grows.

Key challenges:

* Finding client details quickly
* Tracking filings across multiple assessment years
* Managing refund and intimation status
* Tracking invoices, settlements and payments
* Remembering which clients have not filed this year
* Following up with previous clients every tax season
* Accessing ITR portal credentials quickly

Current solutions:

* Excel sheets
* Manual notebooks
* WhatsApp chats
* Physical files

Problems with current solutions:

* Data scattered across multiple places
* Difficult to track client history
* Follow-ups are missed
* No central dashboard
* No automatic AY tracking
* No invoice automation

---

# Product Goal

Primary Goals:

* Track all clients in one place
* Track every assessment year filing
* Simplify annual follow-ups
* Reduce manual work
* Improve client retention
* Generate invoices automatically
* Track payments and settlements
* Track refunds and intimations
* Access client information instantly

---

# Core Features

## Feature 1: Client Management

Client Profile includes:

* Client Name
* Mobile Number
* PAN Number
* Date of Birth (DOB) (Mandatory for generating Intimation Order password)
* Address
* Email
* ITR Portal Password (Encrypted)
* Family Group (Optional)

Search by:

* Name
* PAN
* Mobile
* Invoice Number
* Ack Number

---

## Feature 2: Assessment Year Filing Management

One Client → Multiple AY Records

Each filing record stores:

* Assessment Year
* ITR Type
* Filing Status
* Filing Date
* Acknowledgement Number
* Original Return
* Revised Return(s)

---

## Feature 3: Refund & Intimation Tracking

Refund Tracking:

* Refund Amount
* Refund Status
* Refund Received Date

Intimation Tracking:

* Not Received
* Received
* Refund Determined
* Demand Raised
* No Demand No Refund
* Rectification Required
* Under Processing

---

## Feature 4: Invoice & Payment Management

Automatic Invoice Number:

* SDDS/ITR/AY/Serial Number (Serial number resets to 001 every Assessment Year)

Example:

* SDDS/ITR/2027-28/001

Invoice Actions:

* PDF Downloadable
* Directly printable from the browser

Billing Fields (No GST):

* Filing Charge
* Refund Charge %
* Refund Charge
* Discount
* Invoice Amount
* Settlement Amount
* Amount Received
* Outstanding Amount

Payment Tracking (Manual entry only, no payment gateway integration):

* Payment Status: Paid, Partial, Unpaid (Invoice status updates based on outstanding balance)
* Payment Mode (Cash, UPI)
* Payment Date
* Payment Notes

---

## Feature 5: AY Dashboard & Follow-up Engine

Dashboard Metrics:

* Filed This AY
* Yet To File This AY
* Pending Filings
* Refunds Pending
* Intimations Pending

Automatic Follow-up Queue:

* Previous AY clients automatically enrolled
* Manual exclusion supported

WhatsApp Follow-up:

* One-click WhatsApp reminder

---

## Feature 6: Client Activity Timeline

Automatically generated timeline.

Examples:

* Client Added
* WhatsApp Sent
* ITR Filed
* Ack Added
* Invoice Generated
* Payment Received
* Intimation Received
* Refund Received

---

## Feature 7: Privacy Mode

Enabled by default.

Hide by default:

* PAN
* Mobile
* Address
* Password
* Revenue
* Refund Amount
* Invoice Values
* Payment Values

Show only after clicking eye icon.

Global Privacy Mode toggle available.

---

## Feature 8: ITR Login & Intimation Password Assistant

Quick actions:

* Copy PAN
* Copy Password
* Copy Intimation Order PDF Password (Auto-generated using `pan.toLowerCase() + dob(ddmmyyyy)`)
* Open ITR Portal helper modal (shows both ITR Portal credentials and Intimation Order PDF password)

PAN stored automatically in uppercase.

---

## Feature 9: Google Drive Document Integration

For each client and Assessment Year (AY), the portal integrates with Google Drive (using the Admin's Google Drive via a Google Service Account):

* **Two Main Documents**:
  1. ITR V (Acknowledgement PDF)
  2. INTIMATION ORDER (Assessment Order PDF)
* **Storage & Fetching**:
  * Files are stored in the Admin's Google Drive.
  * Files are named containing the client's PAN and AY (e.g., `{PAN}_ITRV_{AY}.pdf`, `{PAN}_INTIMATION_{AY}.pdf`).
  * A "Fetch Documents" button in the client portal queries Google Drive via API to locate these files.
  * Once found, the file metadata (Google Drive File ID, webViewLink) is saved in the database under the respective filing record.
  * Direct links/viewers are provided in the client's dashboard.

---

## Feature 10: Client Import Engine

To bootstrap existing data covering multiple assessment years, repeat clients, and new clients:

* Supports uploading a formatted CSV spreadsheet file.
* Integrates an importer that upserts clients based on PAN, and automatically records their history, invoices, and payments AY-wise.

---

# Technical Stack & Infrastructure (Under Construction)

* **Database**: Supabase PostgreSQL
* **Hosting**: Vercel
* **Authentication**: Supabase Auth
* **Internal Users**: 1 user (Single user currently, but designed multi-user ready)
* **User Roles**: Single administrative role for now; no RBAC needed for this stage.
* **Budget**: $0 (Zero-cost / free-tier mandatory at the beginning using Supabase Free Tier, Vercel Hobby, etc.)
* **Storage / Documents**: Google Drive Integration (via Google Service Account) to fetch ITR V and Intimation Order PDF files.
* **Security & Privacy**:
  * Reversible encryption for ITR portal passwords in DB using an environment key (`ENCRYPTION_KEY`) in Next.js server logic.
  * Password reveal actions are NOT logged.
  * 2FA and Session Timeouts are NOT required for this stage.
  * Data Export (CSV/Excel) is enabled for the Admin user.
* **Client Volume**: ~110-150 active clients per year.
* **UI/UX Design**:
  * Desktop-first layout optimization.
  * Client profile page layout: Profile header, Current Case Status, Financial Summary, Filing History, Billing History, and the Activity Timeline at the bottom.
* **Filing Workflow Statuses**:
  * `Yet To File` (Initial status / Auto-enrolled previous AY clients)
  * `Documents Pending` (Waiting for client paperwork)
  * `Ready to File` (Computation ready)
  * `Filed` (Submitted, pending department processing)
  * `Under Processing` (Filing complete, under CPC processing)
  * `Processed` (Completed, refund/demand/no-demand status determined)
  * `Rectification Required` (Notice or error raised, requires action)

---

# Non-Negotiable Rules

* Private Internal Tool Only
* Mobile Friendly
* Accessible Worldwide
* Cloud Hosted
* Daily Automatic Backups
* One-click Data Export
* Assessment Year Driven Workflow
* One Client → Multiple AY Records
* One AY Filing → One Invoice
* Revised Returns Must Be Preserved
* Privacy Mode ON by Default
* Sensitive Data Hidden by Default
* Passwords Encrypted
* PAN Stored in Uppercase
* Automatic Follow-up Queue
* Manual Follow-up Exclusion Allowed
* Client Profile Must Show Complete Client History
* No Duplicate Data Entry
* Minimum Data Entry Philosophy
* Operations First, Accounting Second
* Single User Today, Multi-user Ready Tomorrow
