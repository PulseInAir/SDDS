-- 1. Drop all existing tables (both old schema tables and partially-created new schema tables)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS filing_documents CASCADE;
DROP TABLE IF EXISTS filings CASCADE;
DROP TABLE IF EXISTS client_secrets CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS fee_presets CASCADE;
DROP TABLE IF EXISTS itr_records CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;

-- 2. Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
