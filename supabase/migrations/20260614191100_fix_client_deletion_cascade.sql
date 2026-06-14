-- Migration: Fix Client Deletion Cascade
-- Removes ON DELETE CASCADE from the 6 confirmed client-related constraints to prevent accidental data wipe.
-- Only changes the constraints confirmed in P0-SAFETY-VERIFICATION.

-- 1. activity_logs
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_client_id_fkey;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 2. client_secrets
ALTER TABLE client_secrets DROP CONSTRAINT IF EXISTS client_secrets_client_id_fkey;
ALTER TABLE client_secrets ADD CONSTRAINT client_secrets_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 3. filing_documents
ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_client_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 4. filings
ALTER TABLE filings DROP CONSTRAINT IF EXISTS filings_client_id_fkey;
ALTER TABLE filings ADD CONSTRAINT filings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 5. revenue_invoices
ALTER TABLE revenue_invoices DROP CONSTRAINT IF EXISTS revenue_invoices_client_id_fkey;
ALTER TABLE revenue_invoices ADD CONSTRAINT revenue_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 6. revenue_payments
ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_client_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- ==========================================
-- ROLLBACK PROCEDURE (Commented intentionally)
-- ==========================================
/*
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_client_id_fkey;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE client_secrets DROP CONSTRAINT IF EXISTS client_secrets_client_id_fkey;
ALTER TABLE client_secrets ADD CONSTRAINT client_secrets_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_client_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE filings DROP CONSTRAINT IF EXISTS filings_client_id_fkey;
ALTER TABLE filings ADD CONSTRAINT filings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_invoices DROP CONSTRAINT IF EXISTS revenue_invoices_client_id_fkey;
ALTER TABLE revenue_invoices ADD CONSTRAINT revenue_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_client_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
*/
