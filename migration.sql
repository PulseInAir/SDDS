-- Drop the old filing_documents table (cascading any views/constraints)
DROP TABLE IF EXISTS filing_documents CASCADE;

-- Create the updated filing_documents table with Supabase Storage metadata
CREATE TABLE filing_documents (
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
