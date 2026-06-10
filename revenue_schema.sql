-- Create revenue_invoices table
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

-- Create revenue_payments table
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

-- RLS Enable
ALTER TABLE revenue_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
