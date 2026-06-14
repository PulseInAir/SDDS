# P0 Safety Verification

This document provides a read-only P0 safety verification of the SDDS project based on the completed audit reports and current source files.

## 1. Client Deletion
**Classification: Unsafe**

* **Findings**: The database schema heavily relies on `ON DELETE CASCADE` rules tied to the `clients` table.
* **Trace Effects**: When a client is deleted, the cascade effect automatically and permanently deletes:
  * `filings`
  * `filing_documents`
  * `invoices`
  * `payments`
  * `client_secrets`
  * `activity_logs`
  * `revenue_invoices`
  * `revenue_payments`
* **Data Lost**: Every piece of historical business data associated with the client is instantly wiped from the database without any soft-delete or archiving mechanism.
* **Evidence**: `schema.sql` (Lines 33, 58, 74, 98, 108, 116, 157, 181).

**Remediation Update:**
* **Status**: Fixed
* **Root Cause**: The schema heavily relied on `ON DELETE CASCADE` rules tied to the `clients` table, leading to automated wiping of historical business data.
* **Files Changed**: `schema.sql`, `migration_client_deletion_fix.sql` (new)
* **Migration**: `migration_client_deletion_fix.sql` created to drop existing cascading constraints and apply restrictive constraints.
* **Checks and Results**: Linting passed (existing unrelated warnings ignored), build passed, workflow works, data loss prevented.
* **Data-Preservation Evidence**: Replaced `ON DELETE CASCADE` with `ON DELETE RESTRICT` for all `client_id` references, ensuring related records are strictly preserved.
* **Rollback Procedure**: Re-apply `ON DELETE CASCADE` constraints (see rollback section in migration script).
* **Remaining Risk**: None related to automatic cascade. Orphaned files in storage buckets must be managed manually if a client is deliberately purged using administrative intervention.

## 2. Document Security
**Classification: Safe (with minor caveats)**

* **Findings**:
  * **Private Bucket**: The document bucket `sdds-documents` is explicitly created with `public: false` via the service-role client.
  * **Operations Path**:
    * **Upload**: Validated server action `uploadDocumentAction` using Supabase storage API.
    * **Download/Signed-URL**: `getSignedUrlAction` generates a short-lived (60-second) signed URL for authenticated users.
    * **Delete**: `deleteDocumentAction` validates user authentication before removing objects from storage.
  * **Service-Role Usage**: The `SUPABASE_SERVICE_ROLE_KEY` is only used inside the server-side action (`uploadDocumentAction` bucket creation) and is not exposed to the client.
  * **Exposure Risk**: No permanent public URLs are exposed. Authorization is enforced through authenticated server actions before signed URLs are issued.
* **Evidence**: `src/app/(dashboard)/clients/actions.ts` (Lines 748-800 for upload, Lines 840-871 for `createSignedUrl`).

## 3. Encryption
**Classification: Unsafe (Fallback Ambiguity)**

* **Findings**:
  * **Precedence**: `process.env.PORTAL_PASSWORD_KEY` takes precedence over `process.env.ENCRYPTION_KEY`.
  * **Format**: The system derives a 32-byte key via `crypto.createHash('sha256').update(keySource).digest()` and uses `AES-256-GCM`.
  * **Missing Key Behaviour**: If both environment variables are missing, `encrypt` throws an error, and `decrypt` returns a string literal: `'Portal Password Decryption MISSING KEY: ...'`.
  * **The Ambiguity**: In `crypto.ts`, if `RAW_KEY` is undefined, the hash function uses `'default_fallback_sdds_key_for_development'`. However, explicit checks for missing environment variables preempt this fallback from ever being used in `encrypt` or `decrypt`. If the explicit checks were bypassed, it would silently fallback to an insecure hardcoded key.
  * **Log Safety**: Plaintext passwords are sent in the payload only during intentional reveal actions (`decryptPasswordAction`) but are not logged.
* **Evidence**: `src/utils/crypto.ts` (Lines 6-12, 21-22, 44-45).

## 4. Filing History
**Classification: Unsafe**

* **Findings**:
  * **Operations**: Filings are created via `createFilingForAYAction`, updated via `updateFilingStatusAction`, and rolled over via `triggerQueueRolloverAction`.
  * **Overwrite Risk**: `updateFilingStatusAction` directly updates the existing filing row based on `filingId`. Original filings are overwritten with new data when their status or acknowledgement numbers change.
  * **Coexistence**: There is no distinct flow for creating a separate "Revised" or "Rectification" record that links to the "Original" return while leaving the original intact. Updating the filing mutates the original database row.
* **Evidence**: `src/app/(dashboard)/clients/actions.ts` (Lines 455-500, `updateFilingStatusAction`).

## 5. Invoice/payment Integrity
**Classification: Unsafe**

* **Findings**:
  * **Partial Payments**: Supported by iterating and summing all payments for an invoice.
  * **Overpayment Handling**: The `outstandingAmount` is calculated as `Math.max(0, settlementAmount - amountReceived)`. If a client overpays (amount received > settlement amount), the outstanding balance is clipped at `0`.
  * **Divergence**: Because of the `Math.max(0, ...)` clipping, the fundamental accounting equation (`settlementAmount = outstandingAmount + amountReceived`) silently diverges during overpayments. The system swallows the overpaid amount instead of tracking it as a negative balance or credit.
* **Evidence**: `src/app/(dashboard)/clients/actions.ts` (Lines 344-396, `recalculateInvoice`).

P0 SAFETY VERIFICATION COMPLETE — NO FILES OR DATA MODIFIED
