-- Migration: Fix Client Deletion Cascade
-- Removes ON DELETE CASCADE from all client-related tables to prevent accidental data wipe.

-- 1. filings
ALTER TABLE filings DROP CONSTRAINT IF EXISTS filings_client_id_fkey;
ALTER TABLE filings ADD CONSTRAINT filings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 2. filing_documents
ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_client_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_filing_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_filing_id_fkey FOREIGN KEY (filing_id) REFERENCES filings(id) ON DELETE RESTRICT;

-- 3. invoices
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_filing_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_filing_id_fkey FOREIGN KEY (filing_id) REFERENCES filings(id) ON DELETE RESTRICT;

-- 4. payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT;

-- 5. client_secrets
ALTER TABLE client_secrets DROP CONSTRAINT IF EXISTS client_secrets_client_id_fkey;
ALTER TABLE client_secrets ADD CONSTRAINT client_secrets_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- 6. activity_logs
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_client_id_fkey;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- Note: activity_logs_filing_id_fkey was already ON DELETE SET NULL, we preserve that.

-- 7. revenue_invoices
ALTER TABLE revenue_invoices DROP CONSTRAINT IF EXISTS revenue_invoices_client_id_fkey;
ALTER TABLE revenue_invoices ADD CONSTRAINT revenue_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- Note: revenue_invoices_filing_id_fkey was already ON DELETE SET NULL, we preserve that.

-- 8. revenue_payments
ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_client_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_invoice_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES revenue_invoices(id) ON DELETE RESTRICT;


-- ==========================================
-- ROLLBACK PROCEDURE
-- ==========================================
/*
ALTER TABLE filings DROP CONSTRAINT IF EXISTS filings_client_id_fkey;
ALTER TABLE filings ADD CONSTRAINT filings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_client_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE filing_documents DROP CONSTRAINT IF EXISTS filing_documents_filing_id_fkey;
ALTER TABLE filing_documents ADD CONSTRAINT filing_documents_filing_id_fkey FOREIGN KEY (filing_id) REFERENCES filings(id) ON DELETE CASCADE;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_filing_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_filing_id_fkey FOREIGN KEY (filing_id) REFERENCES filings(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE client_secrets DROP CONSTRAINT IF EXISTS client_secrets_client_id_fkey;
ALTER TABLE client_secrets ADD CONSTRAINT client_secrets_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_client_id_fkey;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_invoices DROP CONSTRAINT IF EXISTS revenue_invoices_client_id_fkey;
ALTER TABLE revenue_invoices ADD CONSTRAINT revenue_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_client_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_payments DROP CONSTRAINT IF EXISTS revenue_payments_invoice_id_fkey;
ALTER TABLE revenue_payments ADD CONSTRAINT revenue_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES revenue_invoices(id) ON DELETE CASCADE;
*/
