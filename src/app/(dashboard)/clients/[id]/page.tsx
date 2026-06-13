import { createClient } from '@/utils/supabase/server';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import ClientProfileContainer from '@/ui/views/clients/[id]/ClientProfileContainer';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Dynamic server rendering

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ay?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: ClientDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const clientId = resolvedParams.id;
  const selectedAY = resolvedSearchParams.ay || getCurrentAssessmentYear();
  const ayList = getAssessmentYears();
  const supabase = await createClient();

  // Fetch client details, filings, and activity logs in parallel to minimize waterfalls
  const [clientResult, filingsResult, activityLogsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single(),
    supabase
      .from('filings')
      .select('*, filing_documents(*)')
      .eq('client_id', clientId)
      .order('assessment_year', { ascending: false }),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
  ]);

  const { data: client, error: clientError } = clientResult;
  const { data: filings } = filingsResult;
  const { data: activityLogs } = activityLogsResult;

  if (clientError || !client) {
    console.error('Client not found:', clientError);
    redirect('/clients');
  }

  const activeFilings = filings || [];

  // Fetch Invoices and Payments in a parallel chain based on filings
  let invoicesList: any[] = [];
  let paymentsList: any[] = [];

  if (activeFilings.length > 0) {
    const filingIds = activeFilings.map(f => f.id);
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .in('filing_id', filingIds);
    invoicesList = invoices || [];

    if (invoicesList.length > 0) {
      const invoiceIds = invoicesList.map(i => i.id);
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .in('invoice_id', invoiceIds);
      paymentsList = payments || [];
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/clients"
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Directories</span>
          <h2 className="text-sm font-semibold text-slate-300">Back to Clients</h2>
        </div>
      </div>

      {/* Main Profile Container */}
      <ClientProfileContainer
        client={client}
        filings={activeFilings}
        invoices={invoicesList}
        payments={paymentsList}
        activityLogs={activityLogs || []}
        selectedAY={selectedAY}
        ayList={ayList}
      />
    </div>
  );
}
