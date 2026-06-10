import { createClient } from '@/utils/supabase/server';
import InvoicePrintView from './InvoicePrintView';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Dynamic server rendering

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;
  const supabase = await createClient();

  // Fetch invoice details and payments in parallel to avoid database sequential waterfall
  const [invoiceResult, paymentsResult] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, filings!inner(*, clients!inner(*))')
      .eq('id', invoiceId)
      .single(),
    supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: true })
  ]);

  const { data: invoice, error } = invoiceResult;
  const { data: payments } = paymentsResult;

  if (error || !invoice) {
    console.error('Invoice not found:', error);
    redirect('/invoices');
  }

  return (
    <div className="py-4">
      <InvoicePrintView 
        invoice={invoice} 
        payments={payments || []} 
      />
    </div>
  );
}
