import { createClient } from '@/utils/supabase/server';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import DashboardClient from './DashboardClient';

export const revalidate = 0; // Dynamic rendering

interface DashboardProps {
  searchParams: Promise<{ ay?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const resolvedParams = await searchParams;
  const currentAY = resolvedParams.ay || getCurrentAssessmentYear();
  const ayOptions = getAssessmentYears();
  const supabase = await createClient();

  // Run all dashboard queries in parallel to eliminate database roundtrip waterfalls
  const [
    totalClientsResult,
    filingsResult,
    invoicesResult,
    recentLogsResult,
    queueItemsResult
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('filings')
      .select('filing_status, refund_amount, refund_status, intimation_status')
      .eq('assessment_year', currentAY),
    supabase
      .from('invoices')
      .select('outstanding_amount, settlement_amount')
      .eq('assessment_year', currentAY),
    supabase
      .from('activity_logs')
      .select('id, action_type, description, created_at, clients(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('filings')
      .select('id, filing_status, client_id, clients(name, pan, mobile)')
      .eq('assessment_year', currentAY)
      .in('filing_status', ['Yet To File', 'Documents Pending', 'Ready to File'])
      .limit(5)
  ]);

  const totalClients = totalClientsResult.count || 0;
  const filings = filingsResult.data || [];
  const invoices = invoicesResult.data || [];
  const recentLogs = recentLogsResult.data || [];
  const queueItems = queueItemsResult.data || [];

  const totalFilingsForAY = filings.length;

  // Filed This AY: Status is Filed, Under Processing, or Processed
  const completedFilings = filings.filter(f => 
    f.filing_status === 'Processed' || 
    f.filing_status === 'Filed' || 
    f.filing_status === 'Under Processing'
  ).length;

  // Yet To File This AY: Status is exactly 'Yet To File'
  const yetToFileFilings = filings.filter(f => f.filing_status === 'Yet To File').length;

  // Pending Filings (Queue Workload): Filings that are not yet Filed/Under Processing/Processed and not 'Yet To File' either (e.g. Documents Pending, Ready to File, Rectification Required)
  const pendingFilings = filings.filter(f => 
    f.filing_status !== 'Processed' && 
    f.filing_status !== 'Filed' && 
    f.filing_status !== 'Under Processing' &&
    f.filing_status !== 'Yet To File'
  ).length;

  // Refunds Pending: refund_amount > 0 and refund_status is 'Yet to receive'
  const refundsPending = filings.filter(f => 
    Number(f.refund_amount || 0) > 0 && 
    f.refund_status === 'Yet to receive'
  ).length;

  // Intimations Pending: intimation_status is 'Not Received' or 'Under Processing' for filings that are already filed (i.e. filing_status in Filed, Under Processing, Processed)
  const intimationsPending = filings.filter(f => 
    (f.filing_status === 'Filed' || f.filing_status === 'Under Processing' || f.filing_status === 'Processed') &&
    (f.intimation_status === 'Not Received' || f.intimation_status === 'Under Processing')
  ).length;

  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.outstanding_amount || 0), 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.settlement_amount || 0), 0);

  return (
    <DashboardClient
      totalClients={totalClients || 0}
      completedFilings={completedFilings}
      yetToFileFilings={yetToFileFilings}
      pendingFilings={pendingFilings}
      refundsPending={refundsPending}
      intimationsPending={intimationsPending}
      totalOutstanding={totalOutstanding}
      totalBilled={totalBilled}
      queueItems={queueItems || []}
      recentLogs={recentLogs || []}
      currentAY={currentAY}
      ayOptions={ayOptions}
    />
  );
}
