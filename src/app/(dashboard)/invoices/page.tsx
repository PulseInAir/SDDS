import { createClient } from '@/utils/supabase/server';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import InvoicesListContainer from '@/ui/views/invoices/InvoicesListContainer';

export const revalidate = 0; // Dynamic server rendering

interface InvoicesPageProps {
  searchParams: Promise<{ ay?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedAY = resolvedSearchParams.ay || getCurrentAssessmentYear();
  const ayList = getAssessmentYears();
  const supabase = await createClient();

  // Fetch all invoices for selected AY with client details
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, filings!inner(*, clients!inner(name, pan, mobile))')
    .eq('assessment_year', selectedAY)
    .order('serial_number', { ascending: false });

  if (error) {
    console.error('Failed to load invoices:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Invoices</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review, export, or print client invoices for Assessment Year {selectedAY}.
        </p>
      </div>

      <InvoicesListContainer 
        invoices={(invoices as any[]) || []} 
        selectedAY={selectedAY} 
        ayList={ayList} 
      />
    </div>
  );
}
