-- Create system_settings table to persist firm profile, filing fee presets, and WhatsApp templates
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read/write for service role (admin) and authenticated users if needed
-- Since SDDS operates on service role or admin client under authenticated routes:
CREATE POLICY "Allow all operations for authenticated users" ON system_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
