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

-- 8. Revenue Invoices Table (Generics for practice collections)
CREATE TABLE IF NOT EXISTS revenue_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  filing_id UUID REFERENCES filings(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  financial_year TEXT NOT NULL,
  assessment_year TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_payment_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  return_type TEXT,
  description TEXT,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  waived_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount_received NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  balance_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Revenue Payments Table (Installments for generic practice invoices)
CREATE TABLE IF NOT EXISTS revenue_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES revenue_invoices(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE revenue_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all operations for authenticated users" ON revenue_invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON revenue_payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_revenue_invoices_updated_at
BEFORE UPDATE ON revenue_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_payments_updated_at
BEFORE UPDATE ON revenue_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for financials recalculation
CREATE OR REPLACE FUNCTION update_revenue_invoice_financials()
RETURNS TRIGGER AS $$
DECLARE
  v_amount_received NUMERIC(15, 2);
BEGIN
  -- Compute total received for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO v_amount_received
  FROM revenue_payments
  WHERE invoice_id = NEW.id;

  NEW.amount_received := v_amount_received;
  NEW.balance_amount := NEW.total_amount - v_amount_received - NEW.waived_amount;

  -- Ensure balance is not negative
  IF NEW.balance_amount < 0 THEN
    NEW.balance_amount := 0;
  END IF;

  -- Determine payment status
  IF NEW.total_amount = 0 THEN
    NEW.status := 'Not Billed';
  ELSIF NEW.waived_amount > 0 AND NEW.balance_amount <= 0 THEN
    NEW.status := 'Waived';
  ELSIF NEW.balance_amount <= 0 THEN
    NEW.status := 'Paid';
  ELSIF NEW.expected_payment_date < CURRENT_DATE THEN
    NEW.status := 'Overdue';
  ELSIF NEW.amount_received > 0 THEN
    NEW.status := 'Part Paid';
  ELSE
    NEW.status := 'Invoice Raised';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER z_update_revenue_invoices_financials
BEFORE INSERT OR UPDATE ON revenue_invoices
FOR EACH ROW EXECUTE FUNCTION update_revenue_invoice_financials();

-- Trigger to recalculate invoice whenever payments change
CREATE OR REPLACE FUNCTION update_invoice_from_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE revenue_invoices
    SET updated_at = timezone('utc'::text, now())
    WHERE id = NEW.invoice_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE revenue_invoices
    SET updated_at = timezone('utc'::text, now())
    WHERE id = OLD.invoice_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_payment_trigger
AFTER INSERT OR UPDATE OR DELETE ON revenue_payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_from_payment();

