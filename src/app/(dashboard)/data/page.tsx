import { getAssessmentYears, getCurrentAssessmentYear } from '@/utils/ay';
import { createClient } from '@/utils/supabase/server';
import DataManagerClient from './DataManagerClient';

export const revalidate = 0; // Dynamic rendering

export default async function DataManagerPage() {
  const ayList = getAssessmentYears();
  const currentAY = getCurrentAssessmentYear();
  const supabase = await createClient();

  // Fetch all clients for CSV export
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  // Fetch all invoices with client details joined via filings for CSV export
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      filings (
        assessment_year,
        itr_type,
        clients (
          name,
          pan
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch all filings with client details joined for CSV export
  const { data: filings } = await supabase
    .from('filings')
    .select(`
      *,
      clients (
        name,
        pan
      )
    `)
    .order('assessment_year', { ascending: false });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Data Manager</h1>
        <p className="text-sm text-slate-400 mt-2">
          Bulk import tax records, enroll clients in filing rollover, and export database tables to CSV.
        </p>
      </div>

      <DataManagerClient
        ayList={ayList}
        currentAY={currentAY}
        clientsData={clients || []}
        invoicesData={invoices || []}
        filingsData={filings || []}
      />
    </div>
  );
}
