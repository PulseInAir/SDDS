-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pan TEXT NOT NULL UNIQUE CHECK (pan = UPPER(pan)),
  email TEXT,
  mobile TEXT NOT NULL,
  dob DATE NOT NULL,
  aadhaar TEXT,
  address TEXT,
  family_group TEXT,
  is_excluded_from_queue BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Filings Table (One Client -> Multiple Assessment Years)
CREATE TABLE IF NOT EXISTS filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assessment_year TEXT NOT NULL,
  itr_type TEXT,
  filing_status TEXT NOT NULL DEFAULT 'Yet To File',
  filing_date DATE,
  acknowledgement_number TEXT,
  return_type TEXT NOT NULL DEFAULT 'Original',
  revision_number INT DEFAULT 0,
  refund_amount NUMERIC(15, 2) DEFAULT 0.00,
  refund_status TEXT DEFAULT 'Yet to receive',
  refund_received_date DATE,
  intimation_status TEXT NOT NULL DEFAULT 'Not Received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(client_id, assessment_year, return_type, revision_number)
);

CREATE TRIGGER update_filings_updated_at
BEFORE UPDATE ON filings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Filing Documents Table (Links Supabase Storage files)
CREATE TABLE IF NOT EXISTS filing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assessment_year TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('itr-v', 'intimation-order', 'form-16', 'computation', 'tax-report', 'acknowledgement', 'other')),
  bucket_name TEXT NOT NULL DEFAULT 'sdds-documents',
  storage_path TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(filing_id, document_type)
);

-- 4. Invoices Table (One Filing -> One Invoice)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID UNIQUE REFERENCES filings(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  serial_number INT NOT NULL,
  assessment_year TEXT NOT NULL,
  filing_charge NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  refund_charge_pct NUMERIC(5, 2) DEFAULT 0.00,
  refund_charge NUMERIC(15, 2) DEFAULT 0.00,
  discount NUMERIC(15, 2) DEFAULT 0.00,
  invoice_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  settlement_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount_received NUMERIC(15, 2) DEFAULT 0.00,
  outstanding_amount NUMERIC(15, 2) DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Payments Table (Tracks manual invoice installment payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  payment_mode TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Client Secrets Table (Separate table for sensitive credentials storage)
CREATE TABLE IF NOT EXISTS client_secrets (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  encrypted_password TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Activity Logs Table (Chronological client activity/timeline)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  filing_id UUID REFERENCES filings(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create policies to allow all operations for authenticated users (Admin role)
CREATE POLICY "Allow all operations for authenticated users" ON clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON filings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON filing_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON client_secrets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON activity_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
